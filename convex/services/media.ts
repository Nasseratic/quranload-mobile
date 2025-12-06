import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Generate upload URL for media files
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Upload media file (register in database after upload)
export const uploadMedia = mutation({
  args: {
    fileId: v.id("_storage"),
    mediaType: v.number(), // 1=image, 2=video, 3=audio, 4=file
    uploadedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, { fileId, mediaType, uploadedBy }) => {
    const mediaId = await ctx.db.insert("media", {
      fileId,
      mediaType: mediaType as 1 | 2 | 3 | 4,
      uploadedBy,
      createdAt: Date.now(),
    });

    // Get the URL for the uploaded file
    const url = await ctx.storage.getUrl(fileId);

    return {
      id: mediaId,
      uri: url,
    };
  },
});

// Get media URL by ID
export const getMediaUrl = query({
  args: {
    mediaId: v.id("media"),
  },
  handler: async (ctx, { mediaId }) => {
    const media = await ctx.db.get(mediaId);

    if (!media) {
      throw new ConvexError("Media not found");
    }

    const url = await ctx.storage.getUrl(media.fileId);

    return { url };
  },
});

// Get media URL by file ID
export const getMediaUrlByFileId = query({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, { fileId }) => {
    const url = await ctx.storage.getUrl(fileId);
    return { url };
  },
});

// Delete media
export const deleteMedia = mutation({
  args: {
    mediaId: v.id("media"),
  },
  handler: async (ctx, { mediaId }) => {
    const media = await ctx.db.get(mediaId);

    if (!media) {
      throw new ConvexError("Media not found");
    }

    // Delete from storage
    await ctx.storage.delete(media.fileId);

    // Delete from database
    await ctx.db.delete(mediaId);

    return { message: "Media deleted" };
  },
});
