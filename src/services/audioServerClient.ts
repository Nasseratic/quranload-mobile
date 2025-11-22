import axios from "axios";

// Default to localhost for development
// You can change this to your server's IP address if testing on a physical device
const AUDIO_SERVER_URL = __DEV__ 
  ? "http://localhost:3000" 
  : "http://akokoog4gg0gk88gwk0soc0s.213.199.41.153.sslip.io"; // Update this for production

// Upload type enum matching server
export enum UploadType {
  MEDIA_ONLY = "media_only",
  LESSON_SUBMISSION = "lesson_submission",
  FEEDBACK_SUBMISSION = "feedback_submission",
}

export interface UploadChunkParams {
  sessionId: string;
  chunkIndex: number;
  fileUri: string;
  token?: string;
}

export interface FinalizeRecordingParams {
  sessionId: string;
  uploadType?: UploadType;
  lessonId?: string;
  studentId?: string;
  duration?: number;
  lessonState?: number;
}

export interface FinalizeRecordingResponse {
  success: boolean;
  mediaId?: string;
  mediaUri?: string;
  filename?: string;
  uploadType: UploadType;
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
 * Optionally submit lesson or feedback based on uploadType
 */
export async function finalizeRecording({
  sessionId,
  uploadType,
  lessonId,
  studentId,
  duration,
  lessonState,
}: FinalizeRecordingParams): Promise<FinalizeRecordingResponse> {
  const response = await axios.post(
    `${AUDIO_SERVER_URL}/finalize`,
    { 
      sessionId,
      uploadType,
      lessonId,
      studentId,
      duration,
      lessonState,
    },
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
