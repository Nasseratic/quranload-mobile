import axios from "axios";

// Default to localhost for development
// You can change this to your server's IP address if testing on a physical device
const AUDIO_SERVER_URL = __DEV__ 
  ? "http://localhost:3000" 
  : "http://localhost:3000"; // Update this for production

export interface UploadChunkParams {
  sessionId: string;
  chunkIndex: number;
  fileUri: string;
  token?: string;
}

export interface FinalizeRecordingParams {
  sessionId: string;
}

export interface FinalizeRecordingResponse {
  success: boolean;
  mediaId: string;
  mediaUri: string;
}

/**
 * Upload a single audio chunk to the server
 */
export async function uploadChunkToServer({
  sessionId,
  chunkIndex,
  fileUri,
  token,
}: UploadChunkParams): Promise<{ success: boolean; chunkIndex: number }> {
  const formData = new FormData();
  formData.append("sessionId", sessionId);
  formData.append("chunkIndex", chunkIndex.toString());
  formData.append("file", {
    uri: fileUri,
    name: `chunk_${chunkIndex}.m4a`,
    type: "audio/x-m4a",
  } as any);
  
  if (token) {
    formData.append("token", token);
  }

  const response = await axios.post(`${AUDIO_SERVER_URL}/upload-chunk`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 30000, // 30 second timeout
  });

  return response.data;
}

/**
 * Finalize the recording - concatenate chunks and upload to Azure
 */
export async function finalizeRecording({
  sessionId,
}: FinalizeRecordingParams): Promise<FinalizeRecordingResponse> {
  const response = await axios.post(
    `${AUDIO_SERVER_URL}/finalize`,
    { sessionId },
    {
      timeout: 120000, // 2 minute timeout for concatenation and upload
    }
  );

  return response.data;
}

/**
 * Check if the audio server is available
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${AUDIO_SERVER_URL}/health`, {
      timeout: 5000,
    });
    return response.data.status === "ok";
  } catch (error) {
    console.log("Audio server not available:", error);
    return false;
  }
}
