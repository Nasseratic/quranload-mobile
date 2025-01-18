import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { v } from "convex/values";
import { messageInitializer } from "../schema";

const getConversationId = (participant1: string, participant2?: string) => {
  return [participant1, participant2].sort().join("_");
};

export const paginate = query({
  args: {
    paginationOpts: paginationOptsValidator,
    teamId: v.optional(v.string()),
    conversationParticipants: v.optional(
      v.object({
        participant1: v.string(),
        participant2: v.string(),
      })
    ),
  },
  handler: async (ctx, { paginationOpts, teamId, conversationParticipants }) => {
    if (!teamId && !conversationParticipants)
      return ctx.db.query("messages").paginate(paginationOpts);

    return ctx.db
      .query("messages")
      .withIndex("conversation", (q) =>
        q.eq(
          "conversationId",
          teamId ||
            getConversationId(
              conversationParticipants!.participant1,
              conversationParticipants!.participant2
            )
        )
      )
      .order("desc")
      .paginate(paginationOpts);
  },
});

export const send = mutation({
  args: {
    messages: v.array(
      v.object({
        ...messageInitializer,
        teamId: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) =>
    Promise.all(
      args.messages.map(({ teamId, ...message }) =>
        ctx.db.insert("messages", {
          ...message,
          conversationId: teamId || getConversationId(message.senderId, message.receiverId),
        })
      )
    ),
});
