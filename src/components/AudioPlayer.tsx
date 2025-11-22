/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useState, useRef, useEffect, memo, useId } from "react";
import { ActivityIndicator } from "react-native";
import { XStack, YStack, Text, Slider, Button } from "tamagui";
import { PlayIcon } from "./icons/PlayIcon";
import { RecordingPauseIcon } from "./icons/RecordingPauseIcon";
import { formatAudioDuration } from "utils/formatAudioDuration";
import { Colors } from "constants/Colors";
import { File, Directory, Paths } from "expo-file-system";
import { fetch } from "expo/fetch";
import { IconButton } from "./buttons/IconButton";
import { ForwardIcon } from "components/icons/ForwerdIcon";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { useAudioManager } from "hooks/useAudioManager";

let onProgressFiles: {
  componentId: string;
  abortController: AbortController;
  onProgress?: (progress: number) => void;
}[] = [];

export const AudioPlayer = memo(
  ({
    uri,
    isVisible,
    width = SCREEN_WIDTH,
    isCompact,
  }: {
    uri: string;
    isVisible: boolean;
    width?: number;
    isCompact?: boolean;
  }) => {
    const componentId = useId();
    const [downloadProgress, setDownloadProgress] = useState<number>();
    const [playableUri, setPlayableUri] = useState<string | null>(null);
    const { playSound, pauseSound, setSound } = useAudioManager();
    const wasPlaying = useRef(false);

    // Use the new useAudioPlayer hook with the playableUri
    const player = useAudioPlayer(playableUri, { updateInterval: 300 });
    const status = useAudioPlayerStatus(player);

    // Extract values from status
    const durationSec = status.duration || 0;
    const isPlaying = status.playing;
    const positionSec = status.currentTime || 0;

    async function play() {
      if (durationSec - positionSec < 0.3) player?.seekTo(0);
      playSound();
    }

    useEffect(() => {
      if (!isVisible) {
        pauseSound();
      }
    }, [isVisible]);

    useEffect(() => {
      return () => {
        const toCancel = onProgressFiles.filter((file) => file.componentId === componentId);
        toCancel.forEach((file) => file.abortController.abort());
        onProgressFiles = onProgressFiles.filter((file) => file.componentId !== componentId);
      };
    }, []);

    // Download audio and set playableUri
    useEffect(() => {
      (async () => {
        if (!uri) return;

        const isRemoteFile = uri.startsWith("http://") || uri.startsWith("https://");
        const resolvedUri = isRemoteFile
          ? await downloadAudio(uri, componentId, (progress) => {
              setDownloadProgress(Math.floor(progress));
            })
          : uri;
        
        setPlayableUri(resolvedUri);
      })();
    }, [uri]);

    // Set the player in the audio manager when it's ready
    useEffect(() => {
      if (player) {
        setSound(player);
      }
    }, [player]);

    const onTogglePlay = () => {
      if (isPlaying) pauseSound();
      else play();
    };

    // sound did load yet
    if (durationSec === 0)
      return isCompact ? (
        <YStack w={width} h={40} bg="white" m="$2" borderRadius="$4" jc="center" ai="center">
          <ActivityIndicator />
          {downloadProgress != null && downloadProgress > 0 && <Text>{downloadProgress}%</Text>}
        </YStack>
      ) : (
        <YStack jc="center" ai="center" p="$4">
          <ActivityIndicator />
          {downloadProgress != null && downloadProgress > 0 && <Text>{downloadProgress}%</Text>}
        </YStack>
      );

    const updateValue = (value: number) => {
      const valueSec = convertPresentToPosition(value, durationSec);

      if (valueSec < 0 || valueSec > durationSec) return;
      if (player?.playing) {
        pauseSound();
        wasPlaying.current = true;
      }
    };

    return (
      <XStack
        bg="white"
        borderRadius="$4"
        p={isCompact ? "$2" : "$4"}
        gap="$3"
        h={isCompact ? 40 : undefined}
      >
        {isCompact && (
          <Button bg="$colorTransparent" hitSlop={20} size={25} w={32} onPress={onTogglePlay}>
            {isPlaying ? (
              <RecordingPauseIcon fill={Colors.Gray[1]} size={16} />
            ) : (
              <PlayIcon size={12} />
            )}
          </Button>
        )}
        <YStack key={uri} pointerEvents="box-none" jc="center" alignItems="center" gap="$2">
          {isVisible && (
            <YStack w={width - 32} gap={isCompact ? "$1" : "$1.5"}>
              <Slider
                step={1}
                max={100}
                min={0}
                onSlideMove={(_, value) => updateValue(value)}
                onSlideStart={(_, value) => updateValue(value)}
                onSlideEnd={(_, value) => {
                  updateValue(value);
                  player?.seekTo(convertPresentToPosition(value, durationSec));
                  if (wasPlaying.current) {
                    playSound();
                    wasPlaying.current = false;
                  }
                }}
                value={[convertPositionToPresent(positionSec, durationSec)]}
              >
                <Slider.Track w="100%" f={1} maxHeight={3} hitSlop={20}>
                  <Slider.TrackActive />
                </Slider.Track>
                <Slider.Thumb
                  size={isCompact ? 8 : 12}
                  bg="black"
                  borderWidth={0}
                  circular
                  index={0}
                />
              </Slider>
              <XStack gap="$3" jc="space-between" alignItems="center" w="100%">
                <Text fontSize={9} style={{ color: Colors.Black[2] }}>
                  {formatAudioDuration(Math.floor(positionSec))}
                </Text>
                <Text fontSize={9} style={{ color: Colors.Black[2] }}>
                  {formatAudioDuration(Math.floor(durationSec))}
                </Text>
              </XStack>
            </YStack>
          )}
          {!isCompact && (
            <XStack
              style={{
                transform: [{ translateY: -12 }],
              }}
              gap="$3"
            >
              <IconButton
                size="xs"
                onPress={() => {
                  const newPosition = Math.max(positionSec - 3, 0);
                  player?.seekTo(newPosition);
                }}
                icon={<ForwardIcon backward />}
              />
              <IconButton
                size="sm"
                onPress={onTogglePlay}
                icon={
                  isPlaying ? (
                    <RecordingPauseIcon fill={Colors.Gray[1]} size={40} />
                  ) : (
                    <PlayIcon size={35} />
                  )
                }
              />
              <IconButton
                size="xs"
                onPress={() => {
                  const newPosition = Math.min(positionSec + 3, durationSec);
                  player?.seekTo(newPosition);
                }}
                icon={<ForwardIcon />}
              />
            </XStack>
          )}
        </YStack>
      </XStack>
    );
  }
);

const convertPresentToPosition = (present: number, duration: number) => {
  return (present / 100) * duration;
};

const convertPositionToPresent = (position: number, duration: number) => {
  return (position / duration) * 100;
};

const recordingsDir = new Directory(Paths.cache, "recordings");

// clean old files in recording dir
const cleanAndCreateRecordingsDir = () => {
  try {
    recordingsDir.delete();
  } catch (error) {
    // Directory might not exist, which is fine
  }
  recordingsDir.create({ intermediates: true });
};

// clean when app starts
cleanAndCreateRecordingsDir();

const downloadAudio = async (
  uri: string,
  componentId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const filename = uri.split("/").pop()?.split("?")[0];

  const localFile = new File(recordingsDir, filename + ".mp3");

  if (localFile.exists) {
    return localFile.uri;
  }

  const abortController = new AbortController();
  onProgressFiles.push({ componentId, abortController, onProgress });

  try {
    const response = await fetch(uri, { signal: abortController.signal });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      if (total > 0 && onProgress) {
        const progress = (receivedLength / total) * 100;
        onProgress(progress);
      }
    }

    // Combine all chunks into a single Uint8Array
    const allChunks = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }

    // Write to file
    localFile.create({ intermediates: true });
    localFile.write(allChunks);
    
    return localFile.uri;
  } catch (error) {
    console.error("Error downloading audio:", error);
    return "";
  } finally {
    // Clean up from tracking array
    onProgressFiles = onProgressFiles.filter((file) => file.componentId !== componentId);
  }
};
