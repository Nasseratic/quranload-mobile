/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Audio } from "expo-av";
import { useState, useRef, useEffect, memo } from "react";
import { ActivityIndicator } from "react-native";
import { XStack, YStack, Text, Slider } from "tamagui";
import { PlayIcon } from "./icons/PlayIcon";
import { RecordingPauseIcon } from "./icons/RecordingPauseIcon";
import { formatAudioDuration } from "utils/formatAudioDuration";
import { Colors } from "constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { downloadAsync, documentDirectory } from "expo-file-system";
import { IconButton } from "./buttons/IconButton";
import { ForwardIcon } from "components/icons/ForwerdIcon";
const downloadedAudioFiles: Record<string, string> = {};

export const AudioPlayer = memo(({ uri }: { uri: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(0);
  const wasPlaying = useRef(false);

  async function playSound() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    if (durationSec - positionSec < 0.3) sound?.setPositionAsync(0);
    sound?.playAsync();
  }

  useEffect(() => {
    let soundToClean: Audio.Sound | null = null;

    (async () => {
      if (!uri) return;

      const isRemoteFile = uri.startsWith("http://") || uri.startsWith("https://");
      const playableUri = isRemoteFile
        ? downloadedAudioFiles[uri] ?? (await downloadAudio(uri))
        : uri;

      downloadedAudioFiles[uri] = playableUri;

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
      soundToClean = sound;
      setSound(sound);
      setDurationSec((status.durationMillis ?? 0) / 1000);
    })();
    return function cleanUpSound() {
      soundToClean?.unloadAsync();
    };
  }, [uri]);

  // sound did load yet
  if (durationSec === 0)
    return (
      <XStack f={1} jc="center" ai="center">
        <ActivityIndicator />
      </XStack>
    );

  const updateValue = (value: number) => {
    const valueSec = convertPresentToPosition(value, durationSec);

    if (valueSec < 0 || valueSec > durationSec) return;
    setPositionSec(valueSec);
    sound?.getStatusAsync().then((status) => {
      if (status.isLoaded && status.isPlaying) {
        sound?.pauseAsync();
        wasPlaying.current = true;
      }
    });
  };
  return (
    <YStack
      pointerEvents="box-none"
      jc="center"
      alignItems="center"
      w="100%"
      gap="$2"
      p="$4"
      bg="white"
    >
      <YStack w="100%" gap="$1.5">
        {/* @ts-expect-error */}
        <Slider
          step={1}
          max={100}
          min={0}
          onValueChange={([value]) => {
            if (!value) return;
            const valueSec = convertPresentToPosition(value, durationSec);
            if (valueSec < 0 || valueSec > durationSec) return;
            setPositionSec(valueSec);
            sound?.getStatusAsync().then((status) => {
              if (status.isLoaded && status.isPlaying) {
                sound?.pauseAsync();
                wasPlaying.current = true;
              }
            });
          }}
          onSlideMove={(_, value) => updateValue(value)}
          onSlideStart={(_, value) => updateValue(value)}
          onSlideEnd={(_, value) => {
            updateValue(value);
            sound?.setPositionAsync(convertPresentToPosition(value, durationSec) * 1000);
            if (wasPlaying.current) {
              sound?.playAsync();
              wasPlaying.current = false;
            }
          }}
          value={[convertPositionToPresent(positionSec, durationSec)]}
        >
          <Slider.Track w="100%" f={1} maxHeight={3} hitSlop={20}>
            <Slider.TrackActive />
          </Slider.Track>
          <Slider.Thumb size={12} bg="black" borderWidth={0} circular index={0} />
        </Slider>
        <XStack gap="$3" jc="space-between" alignItems="center" w="100%">
          <Text style={{ color: Colors.Black[2] }}>
            {formatAudioDuration(Math.floor(positionSec))}
          </Text>
          <Text style={{ color: Colors.Black[2] }}>
            {formatAudioDuration(Math.floor(durationSec))}
          </Text>
        </XStack>
      </YStack>
      <XStack
        style={{
          transform: [{ translateY: -12 }],
        }}
        gap="$3"
      >
        <IconButton
          size="xs"
          onPress={() => {
            sound?.setPositionAsync((positionSec - 3) * 1000);
            setPositionSec(positionSec - 3);
          }}
          icon={<ForwardIcon backward />}
        />
        <IconButton
          size="sm"
          onPress={() => {
            if (isPlaying) sound?.pauseAsync();
            else playSound();
          }}
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
            sound?.setPositionAsync((positionSec + 3) * 1000);
            setPositionSec(positionSec + 3);
          }}
          icon={<ForwardIcon />}
        />
      </XStack>
    </YStack>
  );
});

const downloadAudio = async (uri: string) => {
  const token = (await AsyncStorage.getItem("accessToken")) ?? "";
  const file = await downloadAsync(
    uri,
    documentDirectory + Math.random().toString(36).substring(7) + ".mp3",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return file.uri;
};

const convertPresentToPosition = (present: number, duration: number) => {
  return (present / 100) * duration;
};

const convertPositionToPresent = (position: number, duration: number) => {
  return (position / duration) * 100;
};
