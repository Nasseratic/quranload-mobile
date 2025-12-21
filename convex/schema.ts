import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const messageInitializer = {
  isSystem: v.boolean(),
  chatType: v.optional(v.union(v.literal("normal"), v.literal("support"))),
  mediaType: v.optional(
    v.union(v.literal("image"), v.literal("video"), v.literal("audio"), v.literal("file"))
  ),
  mediaUrl: v.optional(v.string()),
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
  authToken: v.optional(v.string()),
};

export default defineSchema({
  featureFlags: defineTable({
    name: v.union(v.literal("chat"), v.literal("inAppEnrolment"), v.literal("supportChat")),
    enabled: v.boolean(),
  }),
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
  contactSupportInfo: defineTable(contactSupportInfo),
  userInfo: defineTable(userInfo),

  // Recording sessions for audio fragment management with R2
  recordingSessions: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    status: v.union(
      v.literal("recording"),
      v.literal("paused"),
      v.literal("finalizing"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    isActive: v.boolean(), // Whether this is an active/recoverable session
    uploadType: v.optional(
      v.union(
        v.literal("media_only"),
        v.literal("lesson_submission"),
        v.literal("feedback_submission")
      )
    ),
    lessonId: v.optional(v.string()),
    studentId: v.optional(v.string()),
    lessonState: v.optional(v.number()),
    totalDuration: v.number(), // in milliseconds
    fragmentsCount: v.number(),
    finalAudioKey: v.optional(v.string()), // R2 key for concatenated audio
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_lessonId_active", ["userId", "lessonId", "isActive"]),

  // Audio fragments stored in R2
  audioFragments: defineTable({
    sessionId: v.string(),
    fragmentIndex: v.number(),
    r2Key: v.string(), // R2 object key
    duration: v.number(), // in milliseconds
    uploadedAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_session_and_index", ["sessionId", "fragmentIndex"]),
});
