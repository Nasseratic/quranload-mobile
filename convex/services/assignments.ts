import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get assignments by team and type
export const getAssignments = query({
  args: {
    teamId: v.id("teams"),
    typeId: v.number(), // 1 = Auto, 2 = Custom
  },
  handler: async (ctx, { teamId, typeId }) => {
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_team_type", (q) => q.eq("teamId", teamId).eq("typeId", typeId as 1 | 2))
      .collect();

    return {
      pager: {
        currentPageIndex: 0,
        pageSize: assignments.length,
        totalRecordCount: assignments.length,
        pageCount: 1,
      },
      list: assignments.map((a) => ({
        id: a._id,
        teamId: a.teamId,
        typeId: a.typeId,
        description: a.description,
        startDate: a.startDate,
        endDate: a.endDate,
        pagesPerDay: a.pagesPerDay,
        startFromPage: a.startFromPage,
        days: a.days,
        attachments: a.attachments ?? [],
        createdAt: new Date(a.createdAt).toISOString(),
      })),
    };
  },
});

// Create assignment (auto or custom)
export const createAssignment = mutation({
  args: {
    teamId: v.id("teams"),
    typeId: v.number(), // 1 = Auto, 2 = Custom
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    pagesPerDay: v.optional(v.number()),
    startFromPage: v.optional(v.number()),
    days: v.optional(v.number()),
    attachments: v.optional(
      v.array(
        v.object({
          id: v.string(),
          uri: v.string(),
          sortOrder: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const assignmentId = await ctx.db.insert("assignments", {
      teamId: args.teamId,
      typeId: args.typeId as 1 | 2,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      pagesPerDay: args.pagesPerDay,
      startFromPage: args.startFromPage,
      days: args.days,
      attachments: args.attachments,
      createdAt: Date.now(),
    });

    return { id: assignmentId };
  },
});

// Update assignment
export const updateAssignment = mutation({
  args: {
    id: v.id("assignments"),
    teamId: v.id("teams"),
    typeId: v.number(),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    pagesPerDay: v.optional(v.number()),
    startFromPage: v.optional(v.number()),
    days: v.optional(v.number()),
    attachments: v.optional(
      v.array(
        v.object({
          id: v.string(),
          uri: v.string(),
          sortOrder: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, { id, ...updates }) => {
    const assignment = await ctx.db.get(id);

    if (!assignment) {
      throw new ConvexError("Assignment not found");
    }

    await ctx.db.patch(id, {
      teamId: updates.teamId,
      typeId: updates.typeId as 1 | 2,
      description: updates.description,
      startDate: updates.startDate,
      endDate: updates.endDate,
      pagesPerDay: updates.pagesPerDay,
      startFromPage: updates.startFromPage,
      days: updates.days,
      attachments: updates.attachments,
    });

    return { message: "Assignment updated" };
  },
});

// Delete assignment
export const deleteAssignment = mutation({
  args: {
    id: v.id("assignments"),
  },
  handler: async (ctx, { id }) => {
    const assignment = await ctx.db.get(id);

    if (!assignment) {
      throw new ConvexError("Assignment not found");
    }

    await ctx.db.delete(id);

    return { message: "Assignment deleted" };
  },
});
