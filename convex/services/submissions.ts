import { mutation, query, action } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";

// Generate upload URL for recording
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Submit student recording
export const submitRecording = mutation({
  args: {
    lessonId: v.id("lessons"),
    studentId: v.id("users"),
    recordingFileId: v.id("_storage"),
    recordingDuration: v.number(),
  },
  handler: async (ctx, { lessonId, studentId, recordingFileId, recordingDuration }) => {
    const lesson = await ctx.db.get(lessonId);

    if (!lesson) {
      throw new ConvexError("Lesson not found");
    }

    if (lesson.studentId !== studentId) {
      throw new ConvexError("You are not authorized to submit for this lesson");
    }

    // Check if submission already exists
    const existingSubmission = await ctx.db
      .query("submissions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .first();

    if (existingSubmission) {
      // Delete old recording file
      if (existingSubmission.recordingFileId) {
        await ctx.storage.delete(existingSubmission.recordingFileId);
      }

      // Update existing submission
      await ctx.db.patch(existingSubmission._id, {
        recordingFileId,
        recordingDuration,
        submittedAt: Date.now(),
      });
    } else {
      // Create new submission
      await ctx.db.insert("submissions", {
        lessonId,
        studentId,
        recordingFileId,
        recordingDuration,
        submittedAt: Date.now(),
      });
    }

    // Update lesson status to submitted
    await ctx.db.patch(lessonId, {
      status: "submitted",
    });

    return { message: "Recording submitted successfully" };
  },
});

// Delete submission (student recording)
export const deleteSubmission = mutation({
  args: {
    lessonId: v.id("lessons"),
    studentId: v.id("users"),
  },
  handler: async (ctx, { lessonId, studentId }) => {
    const submission = await ctx.db
      .query("submissions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .first();

    if (!submission) {
      throw new ConvexError("Submission not found");
    }

    if (submission.studentId !== studentId) {
      throw new ConvexError("You are not authorized to delete this submission");
    }

    // Delete the recording file from storage
    if (submission.recordingFileId) {
      await ctx.storage.delete(submission.recordingFileId);
    }

    // Delete the submission record
    await ctx.db.delete(submission._id);

    // Reset lesson status to pending
    await ctx.db.patch(lessonId, {
      status: "pending",
    });

    return { message: "Submission deleted" };
  },
});

// Get recording URL
export const getRecordingUrl = query({
  args: {
    lessonId: v.id("lessons"),
    studentId: v.id("users"),
  },
  handler: async (ctx, { lessonId, studentId }) => {
    const submission = await ctx.db
      .query("submissions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .first();

    if (!submission || !submission.recordingFileId) {
      return null;
    }

    const url = await ctx.storage.getUrl(submission.recordingFileId);
    return { url };
  },
});

// Submit teacher feedback
export const submitFeedback = mutation({
  args: {
    lessonId: v.id("lessons"),
    teacherId: v.id("users"),
    studentId: v.id("users"),
    feedbackFileId: v.id("_storage"),
    lessonState: v.union(
      v.literal("pending"),
      v.literal("submitted"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, { lessonId, teacherId, studentId, feedbackFileId, lessonState }) => {
    const lesson = await ctx.db.get(lessonId);

    if (!lesson) {
      throw new ConvexError("Lesson not found");
    }

    // Check if feedback already exists
    const existingFeedback = await ctx.db
      .query("feedback")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .first();

    if (existingFeedback) {
      // Delete old feedback file
      if (existingFeedback.feedbackFileId) {
        await ctx.storage.delete(existingFeedback.feedbackFileId);
      }

      // Update existing feedback
      await ctx.db.patch(existingFeedback._id, {
        feedbackFileId,
        lessonState,
        createdAt: Date.now(),
      });
    } else {
      // Create new feedback
      await ctx.db.insert("feedback", {
        lessonId,
        teacherId,
        studentId,
        feedbackFileId,
        lessonState,
        createdAt: Date.now(),
      });
    }

    // Update lesson status
    await ctx.db.patch(lessonId, {
      status: lessonState,
      teacherId,
    });

    return { message: "Feedback submitted successfully" };
  },
});

// Delete feedback
export const deleteFeedback = mutation({
  args: {
    lessonId: v.id("lessons"),
    studentId: v.id("users"),
  },
  handler: async (ctx, { lessonId, studentId }) => {
    const feedback = await ctx.db
      .query("feedback")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .first();

    if (!feedback) {
      throw new ConvexError("Feedback not found");
    }

    // Delete the feedback file from storage
    if (feedback.feedbackFileId) {
      await ctx.storage.delete(feedback.feedbackFileId);
    }

    // Delete the feedback record
    await ctx.db.delete(feedback._id);

    // Reset lesson status to submitted (since feedback was removed)
    await ctx.db.patch(lessonId, {
      status: "submitted",
    });

    return { message: "Feedback deleted" };
  },
});

// Get feedback URL
export const getFeedbackUrl = query({
  args: {
    lessonId: v.id("lessons"),
    studentId: v.id("users"),
  },
  handler: async (ctx, { lessonId, studentId }) => {
    const feedback = await ctx.db
      .query("feedback")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .first();

    if (!feedback || !feedback.feedbackFileId) {
      return null;
    }

    const url = await ctx.storage.getUrl(feedback.feedbackFileId);
    return { url };
  },
});
