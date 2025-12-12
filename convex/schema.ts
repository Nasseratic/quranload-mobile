import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

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
};

export default defineSchema({
  // Convex Auth tables (users, authAccounts, authSessions, etc.)
  ...authTables,

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

  // ======= APP-SPECIFIC TABLES =======

  // User profiles - extended profile data (Convex Auth manages the base users table)
  userProfiles: defineTable({
    userId: v.id("users"),
    fullName: v.string(),
    phoneNumber: v.optional(v.string()),
    gender: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    roles: v.array(v.union(v.literal("Student"), v.literal("Teacher"))),
  }).index("by_userId", ["userId"]),

  // Organizations table
  organizations: defineTable({
    name: v.string(),
    logo: v.optional(v.string()),
    description: v.optional(v.string()),
  }),

  // Teams (classes) table
  teams: defineTable({
    name: v.string(),
    organizationId: v.id("organizations"),
    fee: v.number(),
    duration: v.number(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_organization", ["organizationId"]),

  // Team memberships (which users belong to which teams)
  teamMemberships: defineTable({
    userId: v.id("users"),
    teamId: v.id("teams"),
    isActive: v.boolean(),
    isAllowedToViewContents: v.boolean(),
    joinedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_team", ["teamId"])
    .index("by_user_team", ["userId", "teamId"]),

  // Assignments table
  assignments: defineTable({
    teamId: v.id("teams"),
    typeId: v.union(v.literal(1), v.literal(2)), // 1 = Auto, 2 = Custom
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    // Auto assignment specific fields
    pagesPerDay: v.optional(v.number()),
    startFromPage: v.optional(v.number()),
    days: v.optional(v.number()), // Bitmask for days of week
    // Attachments stored as JSON array
    attachments: v.optional(
      v.array(
        v.object({
          id: v.string(),
          uri: v.string(),
          sortOrder: v.number(),
        })
      )
    ),
    createdAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_team_type", ["teamId", "typeId"]),

  // Lessons table (individual homework assignments for students)
  lessons: defineTable({
    assignmentId: v.optional(v.id("assignments")),
    teamId: v.id("teams"),
    studentId: v.id("users"),
    teacherId: v.optional(v.id("users")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startPage: v.optional(v.number()),
    endPage: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("submitted"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    dueDate: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_team", ["teamId"])
    .index("by_team_status", ["teamId", "status"])
    .index("by_student_status", ["studentId", "status"]),

  // Submissions table (student recordings)
  submissions: defineTable({
    lessonId: v.id("lessons"),
    studentId: v.id("users"),
    recordingFileId: v.optional(v.id("_storage")),
    recordingDuration: v.optional(v.number()),
    submittedAt: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_student", ["studentId"]),

  // Feedback table (teacher feedback recordings)
  feedback: defineTable({
    lessonId: v.id("lessons"),
    teacherId: v.id("users"),
    studentId: v.id("users"),
    feedbackFileId: v.optional(v.id("_storage")),
    lessonState: v.union(
      v.literal("pending"),
      v.literal("submitted"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_teacher", ["teacherId"]),

  // Devices table for push notifications
  devices: defineTable({
    userId: v.id("users"),
    token: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"]),

  // Subscriptions/Payments table
  subscriptions: defineTable({
    userId: v.id("users"),
    teamId: v.id("teams"),
    amount: v.number(),
    status: v.string(),
    paymentDate: v.string(),
    expiryDate: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_team", ["teamId"]),

  // Media files table
  media: defineTable({
    fileId: v.id("_storage"),
    mediaType: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)), // 1=image, 2=video, 3=audio, 4=file
    uploadedBy: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_uploader", ["uploadedBy"]),
});
