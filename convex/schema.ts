import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const messageInitializer = {
  isSystem: v.boolean(),
  mediaType: v.optional(
    v.union(v.literal("image"), v.literal("video"), v.literal("audio"), v.literal("file"))
  ),
  mediaUrl: v.optional(v.string()),
  receiverId: v.optional(v.string()),
  receiverName: v.optional(v.string()),
  senderId: v.string(),
  senderName: v.optional(v.string()),
  text: v.optional(v.string()),
} as const;

export default defineSchema({
  featureFlags: defineTable({
    name: v.union(v.literal("chat"), v.literal("inAppEnrolment")),
    enabled: v.boolean(),
  }),
  messages: defineTable({
    ...messageInitializer,
    conversationId: v.string(),
  }).index("conversation", ["conversationId"]),
  directConversations: defineTable({
    participant1: v.string(),
    participant2: v.string(),
  })
    .index("by_participants", ["participant1", "participant2"])
    .index("by_participant2", ["participant2"]),
});
