import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery } from "../_generated/server";
import { R2 } from "@convex-dev/r2";
import { components } from "../_generated/api";
import { internal } from "../_generated/api";

// Initialize R2 client
export const r2 = new R2(components.r2);

// Generate upload URL and sync metadata for client-side uploads
const r2ClientApi = r2.clientApi({
  checkUpload: async (ctx, bucket) => {
    // TODO: Add user authentication check here
    // const user = await userFromAuth(ctx);
    // if (!user) throw new Error("Unauthorized");
  },
  onUpload: async (ctx, bucket, key) => {
    console.log(`File uploaded to R2 with key: ${key}`);
  },
});

export const generateUploadUrl = r2ClientApi.generateUploadUrl;
export const syncMetadata = r2ClientApi.syncMetadata;

/**
 * Create a new recording session
 */
export const createSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.string(),
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Deactivate any existing active sessions for this user+lesson
    const existingActiveSessions = await ctx.db
      .query("recordingSessions")
      .withIndex("by_userId_lessonId_active", (q) =>
        q.eq("userId", args.userId).eq("lessonId", args.lessonId).eq("isActive", true)
      )
      .collect();

    for (const session of existingActiveSessions) {
      await ctx.db.patch(session._id, { isActive: false, updatedAt: now });
    }

    const sessionDbId = await ctx.db.insert("recordingSessions", {
      sessionId: args.sessionId,
      userId: args.userId,
      status: "recording",
      isActive: true,
      uploadType: args.uploadType,
      lessonId: args.lessonId,
      studentId: args.studentId,
      lessonState: args.lessonState,
      totalDuration: 0,
      fragmentsCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { sessionDbId, sessionId: args.sessionId };
  },
});

/**
 * Update recording session status
 */
export const updateSessionStatus = mutation({
  args: {
    sessionId: v.string(),
    status: v.union(
      v.literal("recording"),
      v.literal("paused"),
      v.literal("finalizing"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("recordingSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error(`Session not found: ${args.sessionId}`);
    }

    // Terminal statuses deactivate the session
    const isTerminalStatus = args.status === "completed" || args.status === "failed";

    await ctx.db.patch(session._id, {
      status: args.status,
      ...(isTerminalStatus && { isActive: false }),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Add a fragment to a session after R2 upload
 */
export const addFragment = mutation({
  args: {
    sessionId: v.string(),
    fragmentIndex: v.number(),
    r2Key: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("recordingSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error(`Session not found: ${args.sessionId}`);
    }

    // Insert the fragment
    const fragmentId = await ctx.db.insert("audioFragments", {
      sessionId: args.sessionId,
      fragmentIndex: args.fragmentIndex,
      r2Key: args.r2Key,
      duration: args.duration,
      uploadedAt: Date.now(),
    });

    // Update session totals
    await ctx.db.patch(session._id, {
      totalDuration: session.totalDuration + args.duration,
      fragmentsCount: session.fragmentsCount + 1,
      updatedAt: Date.now(),
    });

    return { fragmentId, fragmentIndex: args.fragmentIndex };
  },
});

/**
 * Finalize session with final audio R2 key
 */
export const finalizeSession = mutation({
  args: {
    sessionId: v.string(),
    finalAudioKey: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("recordingSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error(`Session not found: ${args.sessionId}`);
    }

    await ctx.db.patch(session._id, {
      status: "completed",
      isActive: false,
      finalAudioKey: args.finalAudioKey,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a recording session and all its fragments
 */
export const deleteSession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("recordingSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      // Session already deleted or never existed - this is fine
      return { success: true, deletedFragments: 0, alreadyDeleted: true };
    }

    // Delete all fragments
    const fragments = await ctx.db
      .query("audioFragments")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const fragment of fragments) {
      await ctx.db.delete(fragment._id);
    }

    // Delete session
    await ctx.db.delete(session._id);

    return { success: true, deletedFragments: fragments.length };
  },
});

/**
 * Get session details by sessionId
 */
export const getSession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("recordingSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    return session;
  },
});

/**
 * Get active (recoverable) session for a specific user and lesson
 */
export const getActiveSessionForLesson = query({
  args: {
    userId: v.string(),
    lessonId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("recordingSessions")
      .withIndex("by_userId_lessonId_active", (q) =>
        q.eq("userId", args.userId).eq("lessonId", args.lessonId).eq("isActive", true)
      )
      .first();

    return session;
  },
});

/**
 * List all fragments for a session (ordered by index)
 */
export const listFragments = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const fragments = await ctx.db
      .query("audioFragments")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Sort by fragment index
    return fragments.sort((a, b) => a.fragmentIndex - b.fragmentIndex);
  },
});

/**
 * Internal query to list all fragments for a session (ordered by index)
 * Used by actions that need to access fragment data
 */
export const listFragmentsInternal = internalQuery({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const fragments = await ctx.db
      .query("audioFragments")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Sort by fragment index
    return fragments.sort((a, b) => a.fragmentIndex - b.fragmentIndex);
  },
});

/**
 * Get all recording sessions for a user
 */
export const getUserSessions = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("recordingSessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc");

    const sessions = args.limit ? await query.take(args.limit) : await query.collect();

    return sessions;
  },
});

/**
 * Upload concatenated audio to R2
 * Called by audio server after concatenating fragments
 */
export const uploadFinalAudio = action({
  args: {
    sessionId: v.string(),
    blob: v.any(), // Concatenated audio blob
  },
  handler: async (ctx, args) => {
    try {
      // Store final audio in R2
      const key = await r2.store(ctx, args.blob, {
        key: `recordings/${args.sessionId}.mp3`,
        type: "audio/mpeg",
      });

      // Update session with final audio key
      await ctx.runMutation(internal.services.recordings.finalizeSession, {
        sessionId: args.sessionId,
        finalAudioKey: key,
      });

      return { success: true, finalAudioKey: key };
    } catch (error) {
      console.error("Failed to upload final audio to R2:", error);
      throw new Error(`Final audio upload failed: ${error}`);
    }
  },
});

/**
 * Get download URLs for fragments
 */
export const getFragmentUrls = action({
  args: { sessionId: v.string() },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx, args): Promise<any> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fragments: any = await ctx.runQuery(internal.services.recordings.listFragmentsInternal, {
      sessionId: args.sessionId,
    });

    const urls = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fragments.map(async (f: any) => ({
        index: f.fragmentIndex,
        url: await r2.getUrl(f.r2Key),
      }))
    );

    return urls;
  },
});

/**
 * Get sessions that are ready to be finalized
 * Called by audio server worker
 */
export const getFinalizingSessions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("recordingSessions")
      .withIndex("by_status", (q) => q.eq("status", "finalizing"))
      .collect();
  },
});

/**
 * Mark a session as processing to avoid multiple workers picking it up
 */
export const startProcessingSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("recordingSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) throw new Error("Session not found");
    if (session.status !== "finalizing")
      return { success: false, reason: "Session not in finalizing state" };

    await ctx.db.patch(session._id, {
      status: "processing",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Report failure for a session
 */
export const failSession = mutation({
  args: { sessionId: v.string(), error: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("recordingSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) throw new Error("Session not found");

    await ctx.db.patch(session._id, {
      status: "failed",
      isActive: false,
      updatedAt: Date.now(),
    });

    console.error(`Session ${args.sessionId} failed: ${args.error}`);
    return { success: true };
  },
});
