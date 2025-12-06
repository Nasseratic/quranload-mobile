import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get all organizations
export const getOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const organizations = await ctx.db.query("organizations").collect();

    // Get teams for each organization
    const orgWithTeams = await Promise.all(
      organizations.map(async (org) => {
        const teams = await ctx.db
          .query("teams")
          .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
          .collect();

        return {
          id: org._id,
          name: org.name,
          logo: org.logo,
          description: org.description,
          teams: teams.map((t) => ({
            id: t._id,
            name: t.name,
            fee: t.fee,
            duration: t.duration,
            description: t.description,
            isActive: t.isActive,
          })),
        };
      })
    );

    return {
      pager: {
        currentPageIndex: 0,
        pageSize: organizations.length,
        totalRecordCount: organizations.length,
        pageCount: 1,
      },
      list: orgWithTeams,
    };
  },
});

// Get students list for a team
export const getStudentsList = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, { teamId }) => {
    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();

    const students = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        if (!user || !user.roles.includes("Student")) {
          return null;
        }

        // Get user's team memberships for other teams
        const userMemberships = await ctx.db
          .query("teamMemberships")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const teams = await Promise.all(
          userMemberships.map(async (m) => {
            const team = await ctx.db.get(m.teamId);
            if (!team) return null;
            const org = await ctx.db.get(team.organizationId);
            return {
              id: team._id,
              name: team.name,
              fee: team.fee,
              studentCount: 0,
              organizationName: org?.name ?? "",
              organizationLogo: org?.logo,
              duration: team.duration,
              description: team.description ?? "",
              isActive: m.isActive,
              isAllowedtoViewContents: m.isAllowedToViewContents,
            };
          })
        );

        return {
          id: user._id,
          fullName: user.fullName,
          emailAddress: user.email,
          phoneNumber: user.phoneNumber ?? "",
          gender: user.gender ?? "",
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : new Date(),
          teams: teams.filter((t) => t !== null),
          roles: user.roles,
          username: user.username ?? user.email,
          percentageOfAcceptedOrSubmittedLessons: 0,
        };
      })
    );

    const filteredStudents = students.filter((s) => s !== null);

    return {
      pager: {
        currentPageIndex: 0,
        pageSize: filteredStudents.length,
        totalRecordCount: filteredStudents.length,
        pageCount: 1,
      },
      list: filteredStudents,
    };
  },
});

// Register device for push notifications
export const registerDevice = mutation({
  args: {
    userId: v.id("users"),
    token: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { userId, token, name }) => {
    // Check if device already registered
    const existingDevice = await ctx.db
      .query("devices")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (existingDevice) {
      // Update existing device
      await ctx.db.patch(existingDevice._id, {
        userId,
        name,
      });
    } else {
      // Create new device
      await ctx.db.insert("devices", {
        userId,
        token,
        name,
        createdAt: Date.now(),
      });
    }

    return { message: "Device registered" };
  },
});

// Create organization (admin only)
export const createOrganization = mutation({
  args: {
    name: v.string(),
    logo: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      logo: args.logo,
      description: args.description,
    });

    return { id: orgId };
  },
});

// Create team (admin only)
export const createTeam = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    fee: v.number(),
    duration: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const teamId = await ctx.db.insert("teams", {
      organizationId: args.organizationId,
      name: args.name,
      fee: args.fee,
      duration: args.duration,
      description: args.description,
      isActive: true,
    });

    return { id: teamId };
  },
});

// Add user to team
export const addUserToTeam = mutation({
  args: {
    userId: v.id("users"),
    teamId: v.id("teams"),
    isAllowedToViewContents: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, teamId, isAllowedToViewContents = true }) => {
    // Check if already a member
    const existingMembership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user_team", (q) => q.eq("userId", userId).eq("teamId", teamId))
      .first();

    if (existingMembership) {
      throw new ConvexError("User is already a member of this team");
    }

    await ctx.db.insert("teamMemberships", {
      userId,
      teamId,
      isActive: true,
      isAllowedToViewContents,
      joinedAt: Date.now(),
    });

    return { message: "User added to team" };
  },
});
