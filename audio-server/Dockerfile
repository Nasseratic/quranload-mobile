FROM oven/bun:1

# Copy ffmpeg from static image (faster than apt-get install)
COPY --from=mwader/static-ffmpeg:7.0 /ffmpeg /usr/local/bin/
COPY --from=mwader/static-ffmpeg:7.0 /ffprobe /usr/local/bin/

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Create temp directory
RUN mkdir -p temp

# Expose port
EXPOSE 3000

# Start server
CMD ["bun", "run", "server.ts"]
