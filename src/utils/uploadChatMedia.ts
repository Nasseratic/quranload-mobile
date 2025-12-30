import * as FileSystem from "expo-file-system";
import { client } from "api/convex";
import { api } from "../../convex/_generated/api";
import { decode } from "base64-arraybuffer";

/**
 * Upload chat media (image or audio) to Cloudflare R2 via Convex
 * @param uri - Local file URI to upload
 * @param type - Media type: 'image' or 'audio'
 * @returns The public URL of the uploaded file, or undefined on error
 */
export const uploadChatMedia = async (
  uri: string,
  type: "image" | "audio"
): Promise<string | undefined> => {
  try {
    const contentType = type === "image" ? "image/png" : "audio/mpeg";

    // Generate upload URL from Convex R2 storage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storageApi = api.services.storage as any;
    const { url, key } = await client.mutation(storageApi.generateUploadUrl, {});

    // Read the file as base64 and convert to binary
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
    const binaryData = decode(base64);

    // Upload to R2 using the signed URL
    const uploadResponse = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: binaryData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    // Sync metadata to Convex so we can retrieve file info later
    await client.mutation(storageApi.syncMetadata, { key });

    // Get the file metadata which includes the URL
    const metadata = await client.query(storageApi.getMetadata, { key });

    return metadata?.url ?? undefined;
  } catch (e) {
    console.error("Error uploading chat media:", e);
    return undefined;
  }
};
