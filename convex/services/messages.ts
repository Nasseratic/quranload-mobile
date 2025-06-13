import { paginationOptsValidator, PaginationResult } from "convex/server";
import { mutation, MutationCtx, query, QueryCtx } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { messageInitializer } from "../schema";
import { isNotNullish } from "utils/notNullish";
import { pushNotifications } from "./pushNotifications";
import { match } from "ts-pattern";

export const paginate = query({
  args: {
    paginationOpts: paginationOptsValidator,
    conversation: v.union(
      v.object({
        type: v.literal("team"),
        teamId: v.string(),
      }),
      v.object({
        type: v.literal("direct"),
        participantX: v.string(),
        participantY: v.string(),
      }),
      v.object({
        type: v.literal("support"),
        userId: v.string(),
      })
    ),
  },
  handler: async (ctx, { paginationOpts, conversation }) => {
    const conversationId = await match(conversation)
      .with({ type: "support" }, async ({ userId }) => `support_${userId}`)
      .with({ type: "team" }, ({ teamId }) => teamId)
      .with(
        { type: "direct" },
        async (directConversation) => (await getConversationId(ctx, directConversation)) ?? "_"
      )
      .exhaustive();

    return ctx.db
      .query("messages")
      .withIndex("conversation", (q) => q.eq("conversationId", conversationId))
      .order("desc")
      .paginate(paginationOpts);
  },
});

export const unsend = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, { messageId }) => {
    return ctx.db.delete(messageId);
  },
});

const isDirectConversation = (conversation: any): conversation is { type: "direct" } =>
  conversation.type === "direct";

export const send = mutation({
  args: {
    senderId: v.string(),
    to: v.union(
      v.object({
        type: v.literal("team"),
        teamId: v.string(),
      }),
      v.object({
        type: v.literal("direct"),
        receiverId: v.string(),
      }),
      v.object({
        type: v.literal("support"),
        userId: v.string(),
      })
    ),
    messages: v.array(
      v.object({
        ...messageInitializer,
      })
    ),
  },
  handler: async (ctx, { senderId, messages, to }) => {
    if (!senderId) return new ConvexError("Sender ID is required");

    const conversationId = await match(to)
      .with({ type: "support" }, async ({ userId }) => `support_${userId}`)
      .with({ type: "team" }, ({ teamId }) => teamId)
      .with(
        { type: "direct" },
        async ({ receiverId }) =>
          await getOrCreateDirectConversation(ctx, {
            senderId,
            receiverId,
          })
      )
      .exhaustive();

    await Promise.all(
      messages.map(async (message) =>
        ctx.db.insert("messages", {
          ...message,
          senderId,
          receiverId:
            to.type === "direct" ? to.receiverId : to.type === "support" ? "support" : undefined,
          conversationId,
          chatType: to.type === "support" ? "support" : "normal",
        })
      )
    );

    const mediaBody =
      messages?.[0]?.mediaUrl && messages?.[0]?.mediaType
        ? messages[0].mediaType === "image"
          ? `📷 Image`
          : `🎙️ Audio`
        : undefined;

    if (to.type === "direct") {
      try {
        await pushNotifications.sendPushNotification(ctx, {
          userId: to.receiverId,
          notification: {
            title: `New message from ${messages[0]?.senderName || "Someone"}`,
            body: messages[0]?.text || mediaBody,
            data: {
              type: "message",
              message: {
                ...messages[0],
                ...to,
                senderId,
              },
            },
          },
        });
      } catch {
        // ignore as most likely the user doesn't have push token
      }
    }
  },
});

const template = `✨ MashaAllah 🤩, {{user}} has submitted the recording for {{text}}`;
export const celebrateSubmission = mutation({
  args: {
    teamId: v.string(),
    senderId: v.string(),
    senderName: v.string(),
    submission: v.union(
      v.string(),
      v.object({
        startPage: v.number(),
        endPage: v.number(),
      })
    ),
  },
  handler: async (ctx, { teamId, senderId, senderName, submission }) => {
    if (!senderId) return new ConvexError("Sender ID is required");

    const text =
      typeof submission === "string"
        ? template.replace("{{user}}", senderName).replace("{{text}}", submission)
        : template
            .replace("{{user}}", senderId)
            .replace("{{text}}", `${submission.startPage}-${submission.endPage}`);

    await ctx.db.insert("messages", {
      text,
      conversationId: teamId,
      senderName,
      isSystem: true,
      senderId,
    });
  },
});

export const allMyConversations = query({
  args: {
    userId: v.string(),
    teamIds: v.array(v.string()),
  },
  handler: async (ctx, { userId, teamIds }) => {
    const conversations1 = await ctx.db
      .query("directConversations")
      .withIndex("by_participants", (q) => q.eq("participant1", userId))
      .collect();
    const conversations2 = await ctx.db
      .query("directConversations")
      .withIndex("by_participant2", (q) => q.eq("participant2", userId))
      .collect();

    const directConversations = [...conversations1, ...conversations2].sort(
      (a, b) => a._creationTime - b._creationTime
    );

    const teamsLatestMessages = await Promise.all(
      teamIds.map((teamId) => {
        return ctx.db
          .query("messages")
          .withIndex("conversation", (q) => q.eq("conversationId", teamId))
          .order("desc")
          .first();
      })
    );
    const directConversationsLatestMessages = await Promise.all(
      directConversations.map((dc) =>
        ctx.db
          .query("messages")
          .withIndex("conversation", (q) => q.eq("conversationId", dc._id))
          .order("desc")
          .first()
      )
    );

    return [...teamsLatestMessages, ...directConversationsLatestMessages]
      .filter(isNotNullish)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

const getConversationId = async (
  ctx: QueryCtx,
  {
    participantX,
    participantY,
  }: {
    participantX: string;
    participantY: string;
  }
) => {
  const dc1 = await ctx.db
    .query("directConversations")
    .withIndex("by_participants", (q) =>
      q.eq("participant1", participantX).eq("participant2", participantY)
    )
    .first();
  const dc2 = await ctx.db
    .query("directConversations")
    .withIndex("by_participants", (q) =>
      q.eq("participant1", participantY).eq("participant2", participantX)
    )
    .first();

  return (dc1 || dc2)?._id;
};

const getOrCreateDirectConversation = async (
  ctx: MutationCtx,
  { senderId, receiverId }: { senderId: string; receiverId: string }
) =>
  (await getConversationId(ctx, { participantX: senderId, participantY: receiverId })) ||
  ctx.db.insert("directConversations", { participant1: senderId, participant2: receiverId });

// Alternative more efficient implementation using the compound index
export const allSupportConversations = query({
  args: {},
  handler: async (ctx) => {
    const supportMessages = await ctx.db
      .query("messages")
      .withIndex("by_chatType", (q) => q.eq("chatType", "support"))
      .collect();

    const conversationLatestMessages = new Map();

    for (const message of supportMessages) {
      const existing = conversationLatestMessages.get(message.conversationId);
      if (!existing || message._creationTime > existing._creationTime) {
        conversationLatestMessages.set(message.conversationId, message);
      }
    }

    return Array.from(conversationLatestMessages.values()).sort(
      (a, b) => b._creationTime - a._creationTime
    );
  },
});
