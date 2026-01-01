import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const messageInitializer = {
  isSystem: v.boolean(),
  chatType: v.optional(v.union(v.literal("normal"), v.literal("support"))),
  mediaType: v.optional(
    v.union(v.literal("image"), v.literal("video"), v.literal("audio"), v.literal("file"))
  ),
  // R2 storage key for media - used to generate fresh signed URLs
  mediaKey: v.optional(v.string()),
  receiverName: v.optional(v.string()),
  senderName: v.optional(v.string()),
  text: v.optional(v.string()),
} as const;

export const contactSupportInfo = {
  email: v.string(),
  name: v.optional(v.string()),
  phone: v.optional(v.string()),
  otaVersion: v.string(),
};

export const userInfo = {
  userId: v.string(),
  currentOtaVersion: v.string(),
  currentAppVersion: v.string(),
  platform: v.string(),
  lastSeen: v.number(),
};

export default defineSchema({
  featureFlags: defineTable({
    name: v.union(v.literal("chat"), v.literal("inAppEnrolment"), v.literal("supportChat")),
    enabled: v.boolean(),
  }),
  userTeam: defineTable({
    userId: v.string(),
    teamId: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_teamId", ["teamId"])
    .index("by_userId_teamId", ["userId", "teamId"]),
  messages: defineTable({
    ...messageInitializer,
    senderId: v.string(),
    receiverId: v.optional(v.string()),
    conversationId: v.string(),
  })
    .index("by_chatType", ["chatType"])
    .index("conversation", ["conversationId"]),
  directConversations: defineTable({
    participant1: v.string(),
    participant2: v.string(),
  })
    .index("by_participants", ["participant1", "participant2"])
    .index("by_participant2", ["participant2"]),
  supportConversations: defineTable({
    conversationId: v.string(),
    userId: v.string(),
    archived: v.boolean(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_userId", ["userId"])
    .index("by_archived", ["archived"]),
  contactSupportInfo: defineTable(contactSupportInfo),
  userInfo: defineTable(userInfo).index("by_userId", ["userId"]),
});
