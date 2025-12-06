import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

type LessonStatus = "pending" | "submitted" | "accepted" | "rejected";

// Get lessons with pagination and filtering
export const getLessons = query({
  args: {
    teamId: v.id("teams"),
    studentId: v.optional(v.id("users")),
    lessonState: v.optional(v.number()), // 0=pending, 1=rejected, 2=accepted, 3=submitted
    pageNumber: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, { teamId, studentId, lessonState, pageNumber = 1, pageSize = 20 }) => {
    let lessonsQuery = ctx.db
      .query("lessons")
      .withIndex("by_team", (q) => q.eq("teamId", teamId));

    let lessons = await lessonsQuery.collect();

    // Filter by student if provided
    if (studentId) {
      lessons = lessons.filter((l) => l.studentId === studentId);
    }

    // Filter by status if provided
    if (lessonState !== undefined) {
      const statusMap: Record<number, LessonStatus> = {
        0: "pending",
        1: "rejected",
        2: "accepted",
        3: "submitted",
      };
      const status = statusMap[lessonState];
      if (status) {
        lessons = lessons.filter((l) => l.status === status);
      }
    }

    // Sort by creation time descending
    lessons.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const totalRecordCount = lessons.length;
    const pageCount = Math.ceil(totalRecordCount / pageSize);
    const startIndex = (pageNumber - 1) * pageSize;
    const paginatedLessons = lessons.slice(startIndex, startIndex + pageSize);

    // Enrich lessons with student and submission data
    const enrichedLessons = await Promise.all(
      paginatedLessons.map(async (lesson) => {
        const student = await ctx.db.get(lesson.studentId);
        const submission = await ctx.db
          .query("submissions")
          .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
          .first();
        const feedback = await ctx.db
          .query("feedback")
          .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
          .first();

        return {
          id: lesson._id,
          assignmentId: lesson.assignmentId,
          teamId: lesson.teamId,
          studentId: lesson.studentId,
          studentName: student?.fullName ?? "",
          teacherId: lesson.teacherId,
          title: lesson.title,
          description: lesson.description,
          startPage: lesson.startPage,
          endPage: lesson.endPage,
          status: lesson.status,
          lessonState: {
            pending: 0,
            rejected: 1,
            accepted: 2,
            submitted: 3,
          }[lesson.status],
          dueDate: lesson.dueDate,
          createdAt: new Date(lesson.createdAt).toISOString(),
          submission: submission
            ? {
                id: submission._id,
                recordingFileId: submission.recordingFileId,
                recordingDuration: submission.recordingDuration,
                submittedAt: new Date(submission.submittedAt).toISOString(),
              }
            : null,
          feedback: feedback
            ? {
                id: feedback._id,
                feedbackFileId: feedback.feedbackFileId,
                lessonState: feedback.lessonState,
                createdAt: new Date(feedback.createdAt).toISOString(),
              }
            : null,
        };
      })
    );

    return {
      pager: {
        currentPageIndex: pageNumber - 1,
        pageSize,
        totalRecordCount,
        pageCount,
      },
      list: enrichedLessons,
    };
  },
});

// Get single lesson details
export const getLessonDetails = query({
  args: {
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, { lessonId }) => {
    const lesson = await ctx.db.get(lessonId);

    if (!lesson) {
      throw new ConvexError("Lesson not found");
    }

    const student = await ctx.db.get(lesson.studentId);
    const teacher = lesson.teacherId ? await ctx.db.get(lesson.teacherId) : null;
    const team = await ctx.db.get(lesson.teamId);
    const assignment = lesson.assignmentId ? await ctx.db.get(lesson.assignmentId) : null;

    const submission = await ctx.db
      .query("submissions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .first();

    const feedback = await ctx.db
      .query("feedback")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .first();

    return {
      id: lesson._id,
      assignmentId: lesson.assignmentId,
      teamId: lesson.teamId,
      teamName: team?.name ?? "",
      studentId: lesson.studentId,
      studentName: student?.fullName ?? "",
      teacherId: lesson.teacherId,
      teacherName: teacher?.fullName ?? "",
      title: lesson.title,
      description: lesson.description ?? assignment?.description ?? "",
      startPage: lesson.startPage,
      endPage: lesson.endPage,
      status: lesson.status,
      lessonState: {
        pending: 0,
        rejected: 1,
        accepted: 2,
        submitted: 3,
      }[lesson.status],
      dueDate: lesson.dueDate,
      createdAt: new Date(lesson.createdAt).toISOString(),
      submission: submission
        ? {
            id: submission._id,
            recordingFileId: submission.recordingFileId,
            recordingDuration: submission.recordingDuration,
            submittedAt: new Date(submission.submittedAt).toISOString(),
          }
        : null,
      feedback: feedback
        ? {
            id: feedback._id,
            feedbackFileId: feedback.feedbackFileId,
            lessonState: feedback.lessonState,
            createdAt: new Date(feedback.createdAt).toISOString(),
          }
        : null,
      attachments: assignment?.attachments ?? [],
    };
  },
});

// Delete lesson
export const deleteLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, { lessonId }) => {
    const lesson = await ctx.db.get(lessonId);

    if (!lesson) {
      throw new ConvexError("Lesson not found");
    }

    // Delete associated submissions
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .collect();

    for (const submission of submissions) {
      if (submission.recordingFileId) {
        await ctx.storage.delete(submission.recordingFileId);
      }
      await ctx.db.delete(submission._id);
    }

    // Delete associated feedback
    const feedbacks = await ctx.db
      .query("feedback")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .collect();

    for (const fb of feedbacks) {
      if (fb.feedbackFileId) {
        await ctx.storage.delete(fb.feedbackFileId);
      }
      await ctx.db.delete(fb._id);
    }

    // Delete the lesson
    await ctx.db.delete(lessonId);

    return { message: "Lesson deleted" };
  },
});

// Create lesson (for manual lesson creation)
export const createLesson = mutation({
  args: {
    teamId: v.id("teams"),
    studentId: v.id("users"),
    assignmentId: v.optional(v.id("assignments")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startPage: v.optional(v.number()),
    endPage: v.optional(v.number()),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lessonId = await ctx.db.insert("lessons", {
      teamId: args.teamId,
      studentId: args.studentId,
      assignmentId: args.assignmentId,
      title: args.title,
      description: args.description,
      startPage: args.startPage,
      endPage: args.endPage,
      status: "pending",
      dueDate: args.dueDate,
      createdAt: Date.now(),
    });

    return { id: lessonId };
  },
});
