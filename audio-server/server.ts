import "bun";
import { spawn } from "child_process";
import { mkdir, rm, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import axios from "axios";
import FormData from "form-data";
import { createReadStream } from "fs";
import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import "dotenv/config";

const CONVEX_URL = process.env.CONVEX_URL || "https://courteous-goat-120.convex.cloud";
const AZURE_API_URL = process.env.AZURE_API_URL || "https://quranload-be-prod-app.azurewebsites.net/api/";
const TEMP_DIR = join(import.meta.dir, "temp");

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

// Timestamp helper for consistent logging
function getTimestamp(): string {
  return new Date().toISOString();
}

function log(message: string, ...args: any[]) {
  console.log(`[${getTimestamp()}]`, message, ...args);
}

function logError(message: string, ...args: any[]) {
  console.error(`[${getTimestamp()}]`, message, ...args);
}

function logWarn(message: string, ...args: any[]) {
  console.warn(`[${getTimestamp()}]`, message, ...args);
}

// Helper to sleep for a given duration
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ensure temp directory exists
if (!existsSync(TEMP_DIR)) {
  await mkdir(TEMP_DIR, { recursive: true });
}

// Create Convex client with robust connection handling
let client: ConvexClient;
let isConnected = false;
let connectionAttempt = 0;

async function initializeConvexClient(): Promise<ConvexClient> {
  return new Promise((resolve) => {
    const newClient = new ConvexClient(CONVEX_URL);
    // Give the client time to establish initial connection and complete any internal reconnection
    // The Convex client may log "WebSocket reconnected" during initialization - this is normal
    setTimeout(() => {
      resolve(newClient);
    }, 3000);
  });
}

async function connectWithRetry(): Promise<ConvexClient> {
  while (connectionAttempt < MAX_RETRY_ATTEMPTS) {
    try {
      log(`Connecting to Convex (attempt ${connectionAttempt + 1}/${MAX_RETRY_ATTEMPTS})...`);
      const newClient = await initializeConvexClient();
      return newClient;
    } catch (error) {
      connectionAttempt++;
      if (connectionAttempt < MAX_RETRY_ATTEMPTS) {
        const delay = RETRY_DELAYS[connectionAttempt - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        logWarn(`Connection failed, retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        logError("Failed to connect to Convex after max retries");
        throw error;
      }
    }
  }
  throw new Error("Failed to connect to Convex");
}

client = await connectWithRetry();

// Helper to concatenate audio files using FFmpeg
async function concatAudioFiles(files: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audioInputs = files.flatMap(f => ['-i', f]);
    const concatFilter = files.length > 1 
      ? ['-filter_complex', `${files.map((_, i) => `[${i}:a]`).join('')}concat=n=${files.length}:v=0:a=1`]
      : [];
    
    const args = [
      ...audioInputs,
      ...concatFilter,
      '-codec:a', 'libmp3lame',
      '-q:a', '4',
      outputPath
    ];

    log('Running FFmpeg with args:', args);
    
    const ffmpeg = spawn('ffmpeg', args);
    
    let stderr = '';
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        logError('FFmpeg error:', stderr);
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(err);
    });
  });
}

// Submit lesson recording to backend
async function submitLessonRecording({
  filePath,
  lessonId,
  duration,
  token,
}: {
  filePath: string;
  lessonId: string;
  duration: number;
  token?: string;
}): Promise<void> {
  const form = new FormData();
  form.append('Recording', createReadStream(filePath), {
    filename: 'recording.mp3',
    contentType: 'audio/mpeg'
  });
  form.append('LessonId', lessonId);
  form.append('RecordingDuration', `${duration}`);

  const headers: Record<string, string> = {
    ...form.getHeaders(),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  await axios.post(`${AZURE_API_URL}LessonSubmission/recording`, form, {
    headers,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
}

// Submit feedback to backend
async function submitFeedback({
  filePath,
  lessonId,
  studentId,
  lessonState,
  token,
}: {
  filePath: string;
  lessonId: string;
  studentId: string;
  lessonState: number;
  token?: string;
}): Promise<void> {
  const form = new FormData();
  form.append('LessonId', lessonId);
  form.append('StudentId', studentId);
  form.append('Recording', createReadStream(filePath), {
    filename: 'feedback.mp3',
    contentType: 'audio/mpeg'
  });
  form.append('LessonState', `${lessonState}`);

  const headers: Record<string, string> = {
    ...form.getHeaders(),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  await axios.post(`${AZURE_API_URL}LessonSubmission/feedback`, form, {
    headers,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
}

// Fetch user's auth token from Convex
async function getUserAuthToken(userId: string): Promise<string | null> {
  try {
    const result = await client.query(api.services.user.getUserAuthToken, { userId });
    if (result?.token) {
      log(`Auth token retrieved for user ${userId.substring(0, 8)}...`);
      return result.token;
    } else {
      logWarn(`No auth token found for user ${userId}`);
      return null;
    }
  } catch (error) {
    logError(`Failed to fetch auth token for user ${userId}:`, error);
    return null;
  }
}

async function processSession(session: any) {
  const { sessionId, userId, uploadType, lessonId, studentId, lessonState, totalDuration } = session;
  const sessionDir = join(TEMP_DIR, sessionId);
  
  try {
    log(`Processing session ${sessionId}...`);
    
    // 1. Mark as processing to avoid duplicate work
    const started = await client.mutation(api.services.recordings.startProcessingSession, { sessionId });
    if (!started.success) {
      logWarn(`Failed to start processing session ${sessionId}: ${started.reason}`);
      return;
    }

    if (!existsSync(sessionDir)) {
      await mkdir(sessionDir, { recursive: true });
    }

    // 2. Fetch fragment URLs
    log(`Fetching fragment URLs for session ${sessionId}...`);
    const fragments = await client.action(api.services.recordings.getFragmentUrls, { sessionId });
    
    // 3. Download fragments
    log(`Downloading ${fragments.length} fragments for session ${sessionId}...`);
    const fragmentPaths: string[] = [];
    for (const fragment of fragments.sort((a: any, b: any) => a.index - b.index)) {
      const fragmentPath = join(sessionDir, `fragment_${fragment.index}.m4a`);
      const response = await axios.get(fragment.url, { responseType: 'arraybuffer' });
      await writeFile(fragmentPath, Buffer.from(response.data));
      fragmentPaths.push(fragmentPath);
    }

    // 4. Concatenate
    const outputPath = join(sessionDir, 'output.mp3');
    log(`Concatenating fragments for session ${sessionId}...`);
    await concatAudioFiles(fragmentPaths, outputPath);

    // 5. Upload final audio to R2 via Convex
    log(`Uploading final audio for session ${sessionId} to R2...`);
    const audioData = await Bun.file(outputPath).arrayBuffer();
    await client.action(api.services.recordings.uploadFinalAudio, {
      sessionId,
      blob: audioData,
    });

    // 6. Fetch user's auth token for Azure submission
    const authToken = await getUserAuthToken(userId);
    if (!authToken) {
      logWarn(`Proceeding without auth token for session ${sessionId}`);
    }

    // 7. Optional: Submit to Azure API
    if (uploadType === 'lesson_submission' && lessonId) {
      log(`Submitting lesson recording for lessonId: ${lessonId}`);
      await submitLessonRecording({
        filePath: outputPath,
        lessonId,
        duration: Math.round(totalDuration / 1000),
        token: authToken || undefined,
      });
    } else if (uploadType === 'feedback_submission' && lessonId && studentId && lessonState !== undefined) {
      log(`Submitting feedback for lessonId: ${lessonId}, studentId: ${studentId}`);
      await submitFeedback({
        filePath: outputPath,
        lessonId,
        studentId,
        lessonState,
        token: authToken || undefined,
      });
    }

    log(`Successfully finalized session ${sessionId}`);

    // Cleanup
    await rm(sessionDir, { recursive: true, force: true });

  } catch (error) {
    logError(`Error processing session ${sessionId}:`, error);
    await client.mutation(api.services.recordings.failSession, {
      sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
    // Partial cleanup
    if (existsSync(sessionDir)) {
      await rm(sessionDir, { recursive: true, force: true });
    }
  }
}

// Subscribe to finalizing sessions with reconnection handling
function setupSubscription() {
  log(`🎙️  Audio server worker started. Monitoring Convex at ${CONVEX_URL}...`);

  const unsubscribe = client.onUpdate(api.services.recordings.getFinalizingSessions, {}, (sessions: any) => {
    if (!isConnected) {
      isConnected = true;
      connectionAttempt = 0;
      log("✅ Convex subscription active and receiving updates");
    }

    if (sessions && sessions.length > 0) {
      log(`Found ${sessions.length} sessions to finalize.`);
      for (const session of sessions) {
        // Process each session (non-blocking)
        processSession(session);
      }
    }
  });

  return unsubscribe;
}

// Handle process signals for graceful shutdown
process.on("SIGINT", () => {
  log("Received SIGINT, shutting down gracefully...");
  client.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("Received SIGTERM, shutting down gracefully...");
  client.close();
  process.exit(0);
});

setupSubscription();
