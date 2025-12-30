import { R2 } from "@convex-dev/r2";
import { components } from "../_generated/api";

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
export const {
  generateUploadUrl,
  syncMetadata,
  deleteObject,
  getMetadata,
  listMetadata,
} = r2.clientApi();
