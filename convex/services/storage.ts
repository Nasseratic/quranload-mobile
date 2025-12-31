import { R2 } from "@convex-dev/r2";
import { components } from "../_generated/api";
import { action } from "../_generated/server";
import { v } from "convex/values";

// Initialize R2 with the component
// Note: After running `npx convex dev`, the components.r2 type will be available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const r2 = new R2(components.r2 as any);

// Export client API functions for R2 storage operations
// - generateUploadUrl: Creates a signed URL for uploading files to R2
// - syncMetadata: Syncs R2 file metadata to Convex database
// - deleteObject: Deletes a file from R2 and its metadata from Convex
// - getMetadata: Retrieves file metadata including the signed URL
// - listMetadata: Lists all files in the bucket with pagination
export const { generateUploadUrl, syncMetadata, deleteObject, getMetadata, listMetadata } =
  r2.clientApi();

/**
 * Get a signed URL for accessing a file from R2
 * This is called directly after upload to get the URL without waiting for metadata sync
 */
export const getUrl = action({
  args: {
    key: v.string(),
  },
  handler: async (_, args) => {
    return await r2.getUrl(args.key);
  },
});
