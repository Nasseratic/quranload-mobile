/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createAudioPlayer, type AudioPlayer as ExpoAudioPlayer } from "expo-audio";
import { useState, useRef, useEffect, memo, useId } from "react";
import { ActivityIndicator } from "react-native";
import { XStack, YStack, Text, Slider, Button } from "tamagui";
import { PlayIcon } from "./icons/PlayIcon";
import { RecordingPauseIcon } from "./icons/RecordingPauseIcon";
import { formatAudioDuration } from "utils/formatAudioDuration";
import { Colors } from "constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { IconButton } from "./buttons/IconButton";
import { ForwardIcon } from "components/icons/ForwerdIcon";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { useAudioManager } from "hooks/useAudioManager";

let onProgressFiles: {
  componentId: string;
  instance: FileSystem.DownloadResumable;
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
    const { playSound, pauseSound, sound, setSound } = useAudioManager();
    const [durationSec, setDurationSec] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [positionSec, setPositionSec] = useState(0);
    const wasPlaying = useRef(false);

    async function play() {
      if (durationSec - positionSec < 0.3) sound?.seekTo(0);
      playSound();
    }

    useEffect(() => {
      if (!isVisible) {
        pauseSound();
      }
    }, [isVisible]);

    useEffect(() => {
      return () => {
        // Clear the status tracking interval if it exists
        if ((sound as any)?._statusInterval) {
          clearInterval((sound as any)._statusInterval);
        }
        sound?.release();
        const toCancel = onProgressFiles.filter((file) => file.componentId === componentId);
        toCancel.forEach((file) => file.instance.cancelAsync());
        onProgressFiles = onProgressFiles.filter((file) => file.componentId !== componentId);
      };
    }, []);

    useEffect(() => {
      (async () => {
        if (!uri) return;

        const isRemoteFile = uri.startsWith("http://") || uri.startsWith("https://");
        const playableUri = isRemoteFile
          ? await downloadAudio(uri, componentId, (progress) => {
              setDownloadProgress(
                Math.floor((progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100)
              );
            })
          : uri;
        
        const player = createAudioPlayer(playableUri, { updateInterval: 300 });
        
        // Set up interval to track playback status
        const statusInterval = setInterval(() => {
          if (player.playing) {
            setIsPlaying(true);
            setPositionSec(player.currentTime);
          } else {
            setIsPlaying(false);
          }
        }, 300);
        
        // Store interval ID for cleanup
        (player as any)._statusInterval = statusInterval;
        
        setSound(player);
        
        // Wait a bit for the player to load the audio metadata
        setTimeout(() => {
          setDurationSec(player.duration || 0);
        }, 100);
      })();
    }, [uri]);

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
      setPositionSec(valueSec);
      if (sound?.playing) {
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
                  sound?.seekTo(convertPresentToPosition(value, durationSec));
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
                  sound?.seekTo(newPosition);
                  setPositionSec(newPosition);
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
                  sound?.seekTo(newPosition);
                  setPositionSec(newPosition);
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

const recordingDir = `${FileSystem.cacheDirectory}recordings/`;

// clean old files in recording dir
const cleanAndCreateRecordingsDir = () =>
  FileSystem.deleteAsync(recordingDir, { idempotent: true }).then(() => {
    FileSystem.makeDirectoryAsync(recordingDir, { intermediates: true });
  });

// clean when app starts
cleanAndCreateRecordingsDir();

const downloadAudio = async (
  uri: string,
  componentId: string,
  callback?: (data: FileSystem.DownloadProgressData) => void
): Promise<string> => {
  const filename = uri.split("/").pop()?.split("?")[0];

  const localFileUri = recordingDir + filename + ".mp3";
  const fileInfo = await FileSystem.getInfoAsync(localFileUri);

  if (fileInfo.exists) {
    return fileInfo.uri;
  }

  const downloadResumable = FileSystem.createDownloadResumable(uri, localFileUri, {}, callback);

  onProgressFiles.push({ componentId, instance: downloadResumable });

  const file = await downloadResumable.downloadAsync();

  if (!file) return "";

  return file.uri;
};
