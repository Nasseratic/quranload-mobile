import { Audio } from "expo-av";
import { useState, useRef, useEffect, memo } from "react";
import { ActivityIndicator } from "react-native";
import { XStack, YStack, Text } from "tamagui";
import { PlayIcon } from "./icons/PlayIcon";
import { RecordingPauseIcon } from "./icons/RecordingPauseIcon";
import { formatAudioDuration } from "utils/formatAudioDuration";
import { Colors } from "constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { downloadAsync, documentDirectory } from "expo-file-system";
import { IconButton } from "./buttons/IconButton";
import { ForwardIcon } from "components/icons/ForwerdIcon";
import Slider from "./Slider";
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
      <YStack w="100%" gap="$2">
        <Slider
          step={durationSec / 100}
          style={{
            width: "100%",
            height: 1,
          }}
          value={positionSec}
          minimumValue={0}
          maximumValue={durationSec}
          onValueChange={(value: number) => {
            if (value < 0 || value > durationSec) return;
            setPositionSec(value);
            sound?.getStatusAsync().then((status) => {
              if (status.isLoaded && status.isPlaying) {
                sound?.pauseAsync();
                wasPlaying.current = true;
              }
            });
          }}
          useNativeDriver={true}
          onSlidingStart={() => {
            sound?.getStatusAsync().then((status) => {
              if (status.isLoaded && status.isPlaying) {
                sound?.pauseAsync();
                wasPlaying.current = true;
              }
            });
          }}
          onSlidingComplete={() => {
            sound?.setPositionAsync(positionSec * 1000);
            if (wasPlaying.current) {
              sound?.playAsync();
              wasPlaying.current = false;
            }
          }}
        />
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
          transform: [{ translateY: -4 }],
        }}
        gap="$3"
      >
        <IconButton
          size="sm"
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
          size="sm"
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
