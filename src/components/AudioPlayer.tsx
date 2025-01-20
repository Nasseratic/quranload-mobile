/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Audio } from "expo-av";
import { useState, useRef, useEffect, memo } from "react";
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
    const { playSound, pauseSound, sound, setSound } = useAudioManager();
    const [durationSec, setDurationSec] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [positionSec, setPositionSec] = useState(0);
    const wasPlaying = useRef(false);

    async function play() {
      if (durationSec - positionSec < 0.3) sound?.setPositionAsync(0);
      playSound();
    }

    useEffect(() => {
      if (!isVisible) {
        pauseSound();
      }
    }, [isVisible]);

    useEffect(() => {
      (async () => {
        if (!uri) return;

        const isRemoteFile = uri.startsWith("http://") || uri.startsWith("https://");
        const playableUri = isRemoteFile ? await downloadAudio(uri) : uri;

        const { sound, status } = await Audio.Sound.createAsync(
          {
            uri: playableUri,
          },
          { progressUpdateIntervalMillis: 300 },
          (status) => {
            if (status.isLoaded && status.isPlaying) {
              setIsPlaying(true);
              setPositionSec((status.positionMillis ?? 0) / 1000);
            } else setIsPlaying(false);
          }
        );
        if (!status.isLoaded) return;
        setSound(sound);
        setTimeout(() => {
          setDurationSec((status.durationMillis ?? 0) / 1000);
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
        <XStack w={width} h={40} bg="white" m="$2" borderRadius="$4" jc="center" ai="center">
          <ActivityIndicator />
        </XStack>
      ) : (
        <XStack jc="center" ai="center" p="$4">
          <ActivityIndicator />
        </XStack>
      );

    const updateValue = (value: number) => {
      const valueSec = convertPresentToPosition(value, durationSec);

      if (valueSec < 0 || valueSec > durationSec) return;
      setPositionSec(valueSec);
      sound?.getStatusAsync().then((status) => {
        if (status.isLoaded && status.isPlaying) {
          pauseSound();
          wasPlaying.current = true;
        }
      });
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
                  sound?.setPositionAsync(convertPresentToPosition(value, durationSec) * 1000);
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
                  sound?.setPositionAsync(newPosition * 1000);
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
                  sound?.setPositionAsync(newPosition * 1000);
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

const downloadedAudioFiles: { [key: string]: string } = {};

const downloadAudio = async (uri: string): Promise<string> => {
  if (downloadedAudioFiles[uri]) return downloadedAudioFiles[uri]!;

  const token = (await AsyncStorage.getItem("accessToken")) ?? "";
  const file = await FileSystem.downloadAsync(
    uri,
    recordingDir + Math.random().toString(36).substring(7) + ".mp3",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  downloadedAudioFiles[uri] = file.uri;
  return file.uri;
};
