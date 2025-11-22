import { serve } from "bun";
import { spawn } from "child_process";
import { mkdir, rm, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import axios from "axios";
import FormData from "form-data";
import { createReadStream } from "fs";

const PORT = process.env.PORT || 3000;
const AZURE_API_URL = process.env.AZURE_API_URL || "https://quranload-be-prod-app.azurewebsites.net/api/";
const TEMP_DIR = join(import.meta.dir, "temp");

// Upload type enum
enum UploadType {
  MEDIA_ONLY = "media_only",
  LESSON_SUBMISSION = "lesson_submission",
  FEEDBACK_SUBMISSION = "feedback_submission",
}

// Session storage with upload type and submission parameters
interface SessionData {
  chunks: { buffer: Buffer; filename: string }[];
  token?: string;
  uploadType?: UploadType;
  lessonId?: string;
  studentId?: string;
  duration?: number;
  lessonState?: number;
}

const sessions = new Map<string, SessionData>();

// Ensure temp directory exists
if (!existsSync(TEMP_DIR)) {
  await mkdir(TEMP_DIR, { recursive: true });
}

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

    console.log('Running FFmpeg with args:', args);
    
    const ffmpeg = spawn('ffmpeg', args);
    
    let stderr = '';
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error('FFmpeg error:', stderr);
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(err);
    });
  });
}

// Upload to Azure Media API
async function uploadToAzure(filePath: string, token?: string): Promise<{ id: string; uri: string }> {
  const form = new FormData();
  form.append('File', createReadStream(filePath), {
    filename: 'audio.mp3',
    contentType: 'audio/mpeg'
  });
  form.append('MediaType', '2');

  const headers: Record<string, string> = {
    ...form.getHeaders(),
  };
  console.log('{{token}}:', token);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await axios.post(`${AZURE_API_URL}Media`, form, {
    headers,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  return response.data;
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

// Clean up session
async function cleanupSession(sessionId: string) {
  sessions.delete(sessionId);
  const sessionDir = join(TEMP_DIR, sessionId);
  if (existsSync(sessionDir)) {
    await rm(sessionDir, { recursive: true, force: true });
  }
}

const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upload chunk endpoint
    if (url.pathname === '/upload-chunk' && req.method === 'POST') {
      try {
        const formData = await req.formData();
        const sessionId = formData.get('sessionId') as string;
        const chunkIndex = formData.get('chunkIndex') as string;
        const file = formData.get('file') as File;
        const token = formData.get('token') as string | null;

        if (!sessionId || !file) {
          return new Response(JSON.stringify({ error: 'Missing sessionId or file' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Initialize session if not exists
        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, { chunks: [], token: token || undefined });
          await mkdir(join(TEMP_DIR, sessionId), { recursive: true });
        }

        // Save chunk to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `chunk_${chunkIndex}_${Date.now()}.${file.name.split('.').pop()}`;
        const chunkPath = join(TEMP_DIR, sessionId, filename);
        await writeFile(chunkPath, buffer);

        // Store chunk reference
        const session = sessions.get(sessionId)!;
        session.chunks.push({ buffer, filename });

        console.log(`Received chunk ${chunkIndex} for session ${sessionId}`);

        return new Response(JSON.stringify({ success: true, chunkIndex }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error uploading chunk:', error);
        return new Response(JSON.stringify({ error: 'Failed to upload chunk' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Finalize and upload endpoint
    if (url.pathname === '/finalize' && req.method === 'POST') {
      try {
        const body = await req.json();
        const { 
          sessionId, 
          uploadType = UploadType.MEDIA_ONLY,
          lessonId,
          studentId,
          duration,
          lessonState,
        } = body;

        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'Missing sessionId' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const session = sessions.get(sessionId);
        if (!session || session.chunks.length === 0) {
          return new Response(JSON.stringify({ error: 'No chunks found for session' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`Finalizing session ${sessionId} with ${session.chunks.length} chunks, uploadType: ${uploadType}`);

        // Get chunk file paths
        const sessionDir = join(TEMP_DIR, sessionId);
        const chunkPaths = session.chunks.map(c => join(sessionDir, c.filename));

        // Concatenate audio files
        const outputPath = join(sessionDir, 'output.mp3');
        await concatAudioFiles(chunkPaths, outputPath);

        let uploadResult: { id: string; uri: string } | null = null;

        // Perform action based on upload type
        if (uploadType === UploadType.MEDIA_ONLY) {
          // Only upload to Azure for media-only requests
          uploadResult = await uploadToAzure(outputPath, session.token);
          console.log(`Uploaded to Azure, mediaId: ${uploadResult.id}`);
        } else if (uploadType === UploadType.LESSON_SUBMISSION) {
          if (!lessonId || duration === undefined || !studentId) {
            throw new Error('Missing lessonId, duration, or studentId for lesson submission');
          }
          // Upload directly to lesson submission endpoint
          await submitLessonRecording({
            filePath: outputPath,
            lessonId,
            duration,
            token: session.token,
          });
          console.log(`Submitted lesson recording for lessonId: ${lessonId}`);
        } else if (uploadType === UploadType.FEEDBACK_SUBMISSION) {
          if (!lessonId || !studentId || lessonState === undefined) {
            throw new Error('Missing lessonId, studentId, or lessonState for feedback submission');
          }
          // Upload directly to feedback submission endpoint
          await submitFeedback({
            filePath: outputPath,
            lessonId,
            studentId,
            lessonState,
            token: session.token,
          });
          console.log(`Submitted feedback for lessonId: ${lessonId}, studentId: ${studentId}`);
        }

        // Poll for filename
        let filename: string | null = null;
        if (uploadType === UploadType.LESSON_SUBMISSION || uploadType === UploadType.FEEDBACK_SUBMISSION) {
          console.log(`Starting polling for filename for session ${sessionId}...`);
          const maxRetries = 5;
          const delays = [500, 1000, 2000, 3000, 5000];

          for (let i = 0; i < maxRetries; i++) {
            console.log(`Polling attempt ${i + 1}/${maxRetries} (waiting ${delays[i]}ms)...`);
            await sleep(delays[i] || 1000);

            try {
              const lessonDetails = await fetchLessonDetails(lessonId || "", session.token);
              console.log(`[DEBUG] Full lesson details response:`, JSON.stringify(lessonDetails, null, 2));
              
              // Find the submission for this student
              // For lesson submission, we need to find the student's submission
              // For feedback submission, we need to find the submission for the student we are giving feedback to
              
              const targetStudentId = studentId; // This should be passed in the request
              console.log(`Looking for submission for studentId: ${targetStudentId}`);

              if (lessonDetails.lessonSubmissions && targetStudentId) {
                const submission = lessonDetails.lessonSubmissions.find(
                  (s: any) => s.student?.id === targetStudentId
                );

                if (submission) {
                  if (uploadType === UploadType.LESSON_SUBMISSION) {
                    filename = submission.recording?.uri;
                    console.log(`Found submission, recording uri: ${filename}`);
                  } else if (uploadType === UploadType.FEEDBACK_SUBMISSION) {
                    filename = submission.feedback?.uri;
                    console.log(`Found submission, feedback uri: ${filename}`);
                  }
                } else {
                  console.log(`No submission found for studentId: ${targetStudentId}`);
                }
              } else {
                 console.log(`Missing lessonSubmissions or targetStudentId`);
              }

              if (filename) {
                console.log(`Found filename: ${filename}`);
                break;
              }
            } catch (error) {
              console.error(`Error fetching lesson details during polling:`, error);
            }
          }

          if (!filename) {
            console.warn(`Failed to retrieve filename after ${maxRetries} attempts`);
          }
        }

        // Cleanup (after submissions complete)
        await cleanupSession(sessionId);

        console.log(`Successfully processed session ${sessionId}`);

        return new Response(JSON.stringify({ 
          success: true, 
          mediaId: uploadResult?.id,
          mediaUri: uploadResult?.uri,
          filename,
          uploadType,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error finalizing:', error);
        return new Response(JSON.stringify({ 
          error: 'Failed to finalize recording',
          details: error instanceof Error ? error.message : 'Unknown error',
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
});

console.log(`🎙️  Audio server running on http://localhost:${PORT}`);
console.log(`📦 Azure API: ${AZURE_API_URL}`);
console.log(`📁 Temp directory: ${TEMP_DIR}`);

async function fetchLessonDetails(lessonId: string, token: string) {
  console.log(`Fetching lesson details for lessonId: ${lessonId}`);
  const response = await fetch(
    `https://quranload-be-prod-app.azurewebsites.net/api/Lessons/${lessonId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch lesson details: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
