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

// Session storage: sessionId -> { chunks: Buffer[], token?: string }
const sessions = new Map<string, { chunks: { buffer: Buffer; filename: string }[]; token?: string }>();

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
        const { sessionId } = body;

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

        console.log(`Finalizing session ${sessionId} with ${session.chunks.length} chunks`);

        // Get chunk file paths
        const sessionDir = join(TEMP_DIR, sessionId);
        const chunkPaths = session.chunks.map(c => join(sessionDir, c.filename));

        // Concatenate audio files
        const outputPath = join(sessionDir, 'output.mp3');
        await concatAudioFiles(chunkPaths, outputPath);

        // Upload to Azure
        const uploadResult = await uploadToAzure(outputPath, session.token);

        // Cleanup
        await cleanupSession(sessionId);

        console.log(`Successfully processed session ${sessionId}`);

        return new Response(JSON.stringify({ 
          success: true, 
          mediaId: uploadResult.id,
          mediaUri: uploadResult.uri,
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
