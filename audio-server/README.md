# Audio Server

A Bun server for receiving, concatenating, and uploading audio recordings from the Quranload mobile app.

## Features

- Receives audio chunks in real-time as they're recorded
- Concatenates chunks using FFmpeg
- Uploads final audio to Azure Media API
- Session-based chunk management
- CORS enabled for local development

## Prerequisites

- [Bun](https://bun.sh/) installed
- FFmpeg installed (`brew install ffmpeg` on macOS)

## Setup

1. Install dependencies:
```bash
cd audio-server
bun install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
PORT=3000
AZURE_API_URL=https://quranload-be-prod-app.azurewebsites.net/api/
```

## Running the Server

Development mode (with auto-reload):
```bash
bun run dev
```

Production mode:
```bash
bun start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Upload Chunk
```
POST /upload-chunk
Content-Type: multipart/form-data

Parameters:
- sessionId: string (unique session identifier)
- chunkIndex: number (chunk sequence number)
- file: File (audio chunk file)
- token: string (optional, auth token for Azure API)
```
Uploads a single audio chunk for a recording session.

### Finalize Recording
```
POST /finalize
Content-Type: application/json

Body:
{
  "sessionId": "string"
}
```
Concatenates all chunks for the session, uploads to Azure, and returns the media ID and URI.

## How It Works

1. **Recording Start**: Mobile app checks server health and creates a session
2. **Chunk Upload**: As each audio fragment is recorded (~2 minutes), it's uploaded to `/upload-chunk`
3. **Finalization**: When user submits the recording, `/finalize` is called:
   - All chunks are concatenated using FFmpeg
   - The final audio is uploaded to Azure Media API
   - Temporary files are cleaned up
   - Session is destroyed

## Mobile App Integration

The mobile app (`src/components/Recorder.tsx`) automatically:
- Checks if the server is available on recording start
- Uploads chunks in real-time if server is available
- Falls back to local concatenation if server is unavailable
- Uses server finalization when possible, with local fallback

## Development Notes

- Temporary files are stored in `./temp/<sessionId>/`
- Sessions are cleaned up after finalization
- The server handles one session per recording
- If the mobile app can't reach the server, it falls back to local processing seamlessly

## Troubleshooting

**Server not responding:**
- Ensure the server is running (`bun run dev`)
- Check that port 3000 is not in use
- Verify FFmpeg is installed: `ffmpeg -version`

**Mobile app can't connect:**
- For iOS Simulator: Use `http://localhost:3000`
- For physical devices: Update `audioServerClient.ts` with your computer's IP address
- Ensure both devices are on the same network

**FFmpeg errors:**
- Check FFmpeg installation: `which ffmpeg`
- Verify audio files are valid
- Check server logs for detailed error messages
