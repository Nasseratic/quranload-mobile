import { File } from "expo-file-system";
import { client } from "api/convex";
import { api } from "../../convex/_generated/api";

/**
 * Upload chat media (image, audio, or video) to Cloudflare R2 via Convex
 * @param uri - Local file URI to upload
 * @param type - Media type: 'image', 'audio', or 'video'
 * @returns The R2 storage key for the uploaded file, or undefined on error
 */
export const uploadChatMedia = async (
  uri: string,
  type: "image" | "audio" | "video"
): Promise<string | undefined> => {
  try {
    const contentType =
      type === "image" ? "image/png" : type === "video" ? "video/mp4" : "audio/mpeg";

    console.log(`[uploadChatMedia] Starting upload for ${type}: ${uri}`);

    // Generate upload URL from Convex R2 storage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storageApi = api.services.storage as any;
    console.log("[uploadChatMedia] Requesting upload URL from Convex...");
    const { url, key } = await client.mutation(storageApi.generateUploadUrl, {});
    console.log(`[uploadChatMedia] Got upload URL, key: ${key}`);

    // Use the new expo-file-system File API which implements Blob interface
    const file = new File(uri);
    console.log(`[uploadChatMedia] File exists: ${file.exists}, size: ${file.size}`);

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log(`[uploadChatMedia] ArrayBuffer byteLength: ${arrayBuffer.byteLength}`);

    // Upload to R2 using the signed URL
    const uploadResponse = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: arrayBuffer,
    });

    console.log(`[uploadChatMedia] Upload response: ${uploadResponse.status}`);

    if (!uploadResponse.ok) {
      const responseText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${responseText}`);
    }

    // Sync metadata in background (non-blocking)
    client.mutation(storageApi.syncMetadata, { key }).catch((e: Error) => {
      console.warn("[uploadChatMedia] Metadata sync failed (non-critical):", e.message);
    });

    console.log(`[uploadChatMedia] Upload complete, returning key: ${key}`);

    // Return the R2 key - signed URLs will be generated when fetching messages
    return key;
  } catch (e) {
    console.error("[uploadChatMedia] Error:", e);
    return undefined;
  }
};
