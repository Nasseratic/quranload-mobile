import { Audio } from "expo-av";
import { useState, useRef, useEffect } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { XStack, YStack, Slider, Text } from "tamagui";
import { PlayIcon } from "./icons/PlayIcon";
import { RecordingPauseIcon } from "./icons/RecordingPauseIcon";
import { formatAudioDuration } from "utils/formatAudioDuration";
import { Colors } from "constants/Colors";

export const AudioPlayer = ({ uri }: { uri: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [durationMS, setDurationMS] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMS, setPositionMS] = useState(0);
  const wasPlaying = useRef(false);

  async function playSound() {
    if (durationMS === positionMS) sound?.setPositionAsync(0);
    sound?.playAsync();
  }

  useEffect(() => {
    (async () => {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { progressUpdateIntervalMillis: 300 },
        (status) => {
          if (status.isLoaded && status.isPlaying) {
            setIsPlaying(true);
            setPositionMS((status.positionMillis ?? 0) / 1000);
          } else setIsPlaying(false);
        }
      );
      if (!status.isLoaded) return;

      setSound(sound);
      setDurationMS((status.durationMillis ?? 0) / 1000);
    })();

    return function cleanUpSound() {
      sound?.unloadAsync();
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
    <XStack jc="center" alignItems="center" gap="$4" px="$3">
      <TouchableOpacity
        onPress={() => {
          if (isPlaying) sound?.pauseAsync();
          else playSound();
        }}
      >
        {isPlaying ? (
          <RecordingPauseIcon fill={Colors.Black[2]} />
        ) : (
          <PlayIcon fill={Colors.Black[2]} />
        )}
      </TouchableOpacity>
      <YStack f={1} jc="center" alignItems="center" pt="$5" gap="$2">
        {/* For some reason types of the slider is not happy, ignoring it for now  */}
        {/* @ts-expect-error */}
        <Slider
          onSlideMove={async (_, value) => {
            if (value < 0 || value > durationMS) return;
            setPositionMS(value);
            sound?.getStatusAsync().then((status) => {
              if (status.isLoaded && status.isPlaying) {
                sound?.pauseAsync();
                wasPlaying.current = true;
              }
            });
          }}
          onSlideEnd={(value) => {
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
          // @ts-expect-error
          w="100%"
        >
          <Slider.Track h={2} bg="$gray8">
            <Slider.TrackActive h={2} bg="$gray11" />
          </Slider.Track>
          <Slider.Thumb hitSlop={20} circular bg="$gray12" index={0} borderWidth={0} size="$0.75" />
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
