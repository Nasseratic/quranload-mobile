import { Audio } from "expo-av";
import { useState, useRef, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { XStack, YStack, Slider, Text } from "tamagui";
import { PlayIcon } from "./icons/PlayIcon";
import { RecordingPauseIcon } from "./icons/RecordingPauseIcon";
import { formatAudioDuration } from "utils/formatAudioDuration";
import { Colors } from "constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { downloadAsync, documentDirectory } from "expo-file-system";
import { IconButton } from "./buttons/IconButton";

export const AudioPlayer = ({ uri }: { uri: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [durationMS, setDurationMS] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMS, setPositionMS] = useState(0);
  const wasPlaying = useRef(false);

  function playSound() {
    if (durationMS - positionMS < 0.3) sound?.setPositionAsync(0);
    sound?.playAsync();
  }

  useEffect(() => {
    let soundToClean: Audio.Sound | null = null;

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
            setPositionMS((status.positionMillis ?? 0) / 1000);
          } else setIsPlaying(false);
        }
      );
      if (!status.isLoaded) return;
      soundToClean = sound;
      setSound(sound);
      setDurationMS((status.durationMillis ?? 0) / 1000);
    })();
    return function cleanUpSound() {
      soundToClean?.unloadAsync();
    };
  }, [uri]);

  // sound did load yet
  if (durationMS === 0)
    return (
      <XStack f={1} jc="center" ai="center">
        <ActivityIndicator />
      </XStack>
    );

  return (
    <XStack jc="center" alignItems="center" gap="$2" f={1}>
      <IconButton
        size="sm"
        onPress={() => {
          if (isPlaying) sound?.pauseAsync();
          else playSound();
        }}
        icon={
          isPlaying ? (
            <RecordingPauseIcon fill={Colors.Black[2]} />
          ) : (
            <PlayIcon fill={Colors.Black[2]} />
          )
        }
      />
      <YStack f={1} jc="center" alignItems="center" pt="$5" gap="$2">
        {/* For some reason types of the slider is not happy, ignoring it for now  */}
        {/* @ts-expect-error for some reason Slider is always not happy */}
        <Slider
          onSlideMove={(_, value) => {
            if (value < 0 || value > durationMS) return;
            setPositionMS(value);
            sound?.getStatusAsync().then((status) => {
              if (status.isLoaded && status.isPlaying) {
                sound?.pauseAsync();
                wasPlaying.current = true;
              }
            });
          }}
          onSlideEnd={() => {
            sound?.setPositionAsync(positionMS * 1000);
            if (wasPlaying.current) {
              sound?.playAsync();
              wasPlaying.current = false;
            }
          }}
          defaultValue={[0]}
          value={[positionMS]}
          min={0}
          max={durationMS}
          step={0.5}
          // @ts-expect-error for some reason Slider is always not happy
          w="100%"
        >
          <Slider.Track h={2} bg="$gray8">
            <Slider.TrackActive h={2} bg="$gray11" />
          </Slider.Track>
          <Slider.Thumb hitSlop={20} circular bg="$gray12" index={0} borderWidth={0} size={14} />
        </Slider>
        <XStack gap="$3" jc="space-between" alignItems="center" w="100%">
          <Text style={{ color: Colors.Black[2] }}>
            {formatAudioDuration(Math.floor(positionMS))}
          </Text>
          <Text style={{ color: Colors.Black[2] }}>
            {formatAudioDuration(Math.floor(durationMS))}
          </Text>
        </XStack>
      </YStack>
    </XStack>
  );
};

const downloadAudio = async (uri: string) => {
  const token = (await AsyncStorage.getItem("accessToken")) ?? "";
  const file = await downloadAsync(uri, documentDirectory + "audio.mp3", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return file.uri;
};
