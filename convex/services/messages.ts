import { paginationOptsValidator, PaginationResult } from "convex/server";
import { mutation, MutationCtx, query, QueryCtx } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { messageInitializer } from "../schema";
import { isNotNullish } from "utils/notNullish";

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
      })
    ),
  },
  handler: async (ctx, { paginationOpts, conversation }) => {
    const conversationId =
      conversation.type === "team"
        ? conversation.teamId
        : (await getConversationId(ctx, conversation)) ??
          // TODO: this will cause error in client, if you start conversation with someone new
          // because the getConversationId will return undefined first time, but after first message it will change to return conversationId
          // this will trigger cursor changed error
          "_";

    return ctx.db
      .query("messages")
      .withIndex("conversation", (q) => q.eq("conversationId", conversationId))
      .order("desc")
      .paginate(paginationOpts);
  },
});

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

    const conversationId =
      to.type === "team"
        ? to.teamId
        : await getOrCreateDirectConversation(ctx, {
            senderId,
            receiverId: to.receiverId,
          });

    return Promise.all(
      messages.map(async (message) =>
        ctx.db.insert("messages", {
          ...message,
          senderId,
          receiverId: to.type === "direct" ? to.receiverId : undefined,
          conversationId,
        })
      )
    );
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

export const del = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, { messageId }) => {
    return ctx.db.delete(messageId);
  },
});
