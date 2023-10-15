import { useState, useEffect, useRef, useCallback } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RecordIcon } from "components/icons/RecordIcon";
import { RecordingPauseIcon } from "components/icons/RecordingPauseIcon";
import * as Linking from "expo-linking";
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "constants/Colors";
import { Checkmark } from "components/icons/CheckmarkIcon";
import { CrossIcon } from "components/icons/CrossIcon";
import * as Haptics from "expo-haptics";
import { AudioPlayer } from "components/AudioPlayer";
import { formatAudioDuration } from "utils/formatAudioDuration";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteLessonSubmission,
  getFeedbackUrl,
  getRecordingUrl,
  submitLessonRecording,
} from "services/lessonsService";
import { concatAudioFragments } from "utils/concatAudioFragments";
import { IconButton } from "components/buttons/IconButton";
import { BinIcon } from "components/icons/BinIcon";
import {
  clearAudioRecordings,
  getPersistentAudioRecordings,
  persistAudioRecordings,
} from "utils/persistAudioRecordings";
import { sleep } from "utils/sleep";
import { Stack, XStack } from "tamagui";
import { t } from "locales/config";
import { useUser } from "contexts/auth";
import { Switch } from "components/AnimatedSwitch";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { SCREEN_WIDTH } from "constants/GeneralConstants";

let currentRecording: Audio.Recording | null = null;

let recordings: {
  uri: string;
  duration: number;
}[] = [];

const RECORDING_INTERVAL = 60 * 1000 * 2;
const RECORDING_INTERVAL_TOLERANCE = 15 * 1000;
const METERING_CHECK_INTERVAL = 300;

declare global {
  interface FormData {
    append(name: string, value: FormDataValue, fileName?: string): void;
  }
}

type RecordingState = "idle" | "recording" | "paused";

export function RecordScreenRecorder({
  lessonId,
  recordingId,
  feedbackId,
}: {
  lessonId: string;
  recordingId?: string;
  feedbackId?: string;
}) {
  const user = useUser();
  const carouselRef = useRef<ICarouselInstance>(null);
  const [showFeedback, setShowFeedback] = useState(!!feedbackId);
  const [isConcatenatingAudio, setIsConcatenatingAudio] = useState(false);
  const insets = useSafeAreaInsets();
  const [uriOutput, setUriOutput] = useState<string | null>(
    recordingId ? getRecordingUrl({ lessonId, recordingId: recordingId }) : null
  );
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");

  const queryClient = useQueryClient();
  const { mutate, isLoading: isSubmitting } = useMutation(submitLessonRecording, {
    onSuccess: () => {
      queryClient.invalidateQueries(["assignments"]);
    },
  });

  async function startRecording() {
    const { granted } = await Audio.requestPermissionsAsync();

    if (!granted) {
      Alert.alert(
        "Permission required",
        "You need to grant permission to record audio to use this app.",
        [
          {
            text: "Go to settings",
            onPress: () => {
              Linking.openSettings();
            },
          },
        ]
      );
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRecordingState("recording");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      await startRecordingWithAutoFragmenting();
    } catch (err) {
      console.log(err);
      setRecordingState("idle");
    }
  }

  const cutRecording = async () => {
    if (!currentRecording) return;
    const { durationMillis } = await currentRecording.getStatusAsync();
    await currentRecording.stopAndUnloadAsync();
    const uri = currentRecording.getURI();
    if (uri) {
      recordings.push({
        uri,
        duration: durationMillis,
      });
      persistAudioRecordings({ lessonId, recordings });
    }
    currentRecording = null;
  };

  const pauseRecording = async () => {
    setRecordingState("paused");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await cutRecording();
  };

  function discardRecording() {
    recordings = [];
    setRecordingState("idle");
    setUriOutput(null);
    clearAudioRecordings({ lessonId });
  }

  const submitRecording = async () => {
    setRecordingState("idle");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await cutRecording();

    setIsConcatenatingAudio(true);
    const uri = await concatAudioFragments(recordings.map(({ uri }) => uri));
    setIsConcatenatingAudio(false);

    if (!uri) return;

    mutate(
      {
        lessonId,
        file: {
          uri,
          name: "test.mp3",
          type: "audio/mpeg",
        },
        duration: 100,
      },
      {
        onSuccess: () => {
          setUriOutput(uri);
          recordings = [];
          clearAudioRecordings({ lessonId });
        },
        onError: () => {
          setRecordingState("paused");
        },
      }
    );
  };

  async function startRecordingWithAutoFragmenting() {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY
      );
      currentRecording = recording;

      await sleep(RECORDING_INTERVAL);

      await Promise.race([
        sleep(RECORDING_INTERVAL_TOLERANCE),
        (async () => {
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const status = await recording.getStatusAsync();
            if (!status.isRecording) break;
            if (status.metering && status.metering < -40) {
              console.log("Metering is too low, stopping recording");
              break;
            } else console.log("Metering is", status.metering);
            await sleep(METERING_CHECK_INTERVAL);
          }
        })(),
      ]);

      await cutRecording();
      startRecordingWithAutoFragmenting();
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  useEffect(() => {
    getPersistentAudioRecordings({ lessonId }).then((savedRecordings) => {
      if (savedRecordings.length > 0) {
        recordings = savedRecordings;
        setRecordingState("paused");
      }
    });
    return () => {
      recordings = [];
      clearAudioRecordings({ lessonId });
      if (currentRecording) {
        currentRecording.stopAndUnloadAsync();
      }
    };
  }, [lessonId]);

  const animationStyle = useCallback((value: number) => {
    "worklet";

    const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
    const scale = interpolate(value, [-1, 0, 1], [1.25, 1, 0.25]);
    const opacity = interpolate(value, [-0.75, 0, 1], [0, 1, 0]);

    return {
      transform: [{ scale }],
      zIndex,
      opacity,
    };
  }, []);

  if (isSubmitting || isConcatenatingAudio)
    return (
      <View
        style={[
          styles.container,
          styles.shadow,
          {
            paddingBottom: insets.bottom,
            justifyContent: "center",
          },
        ]}
      >
        <ActivityIndicator />
      </View>
    );

  if (uriOutput && recordingState === "idle")
    return (
      <Stack
        style={[
          styles.shadow,
          {
            backgroundColor: "#fff",
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <Stack pt="$3" px="$4" jc="flex-end" ai="center">
          <Carousel
            data={
              feedbackId
                ? [
                    getFeedbackUrl({
                      lessonId,
                      feedbackId: feedbackId,
                      studentId: user!.id,
                    }),
                    uriOutput,
                  ]
                : [uriOutput]
            }
            width={SCREEN_WIDTH}
            height={40 + insets.bottom}
            renderItem={({ item }) => <AudioPlayer uri={item} />}
            ref={carouselRef}
            loop={false}
            vertical
            customAnimation={animationStyle}
            enabled={false}
          />
          <XStack jc="space-between" pointerEvents="box-none" position="absolute" w="100%">
            <View>
              {feedbackId && (
                <Switch
                  value={showFeedback}
                  onChange={(value) => {
                    setShowFeedback(value);
                    carouselRef.current?.scrollTo({ index: value ? 0 : 1, animated: true });
                  }}
                />
              )}
            </View>
            {!showFeedback && (
              <IconButton
                onPress={() =>
                  Alert.alert(
                    t("recordingScreen.deleteRecording"),
                    t("recordingScreen.deleteRecordingDescription"),
                    [
                      {
                        text: t("cancel"),
                        style: "cancel",
                      },
                      {
                        text: t("delete"),
                        style: "destructive",
                        onPress: () => {
                          deleteLessonSubmission({ lessonId, studentId: user!.id });
                          setUriOutput(null);
                        },
                      },
                    ]
                  )
                }
                icon={<BinIcon size={20} color={Colors.Black[2]} />}
                size="sm"
              />
            )}
          </XStack>
        </Stack>
      </Stack>
    );

  return (
    <View
      style={[
        styles.container,
        styles.shadow,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View>
        {recordingState !== "idle" && (
          <IconButton bg={Colors.Black[2]} icon={<CrossIcon />} onPress={discardRecording} />
        )}
      </View>

      <TouchableOpacity
        onPress={recordingState === "recording" ? () => pauseRecording() : startRecording}
        activeOpacity={0.9}
      >
        <RecordingButton recordingState={recordingState} />
      </TouchableOpacity>
      <View>
        {recordingState !== "idle" && (
          <IconButton bg={Colors.Success[1]} icon={<Checkmark />} onPress={submitRecording} />
        )}
      </View>
    </View>
  );
}

const RecordingTimer = ({ isRunning }: { isRunning: boolean }) => {
  const [seconds, setSeconds] = useState(
    Math.round(recordings.reduce((acc, { duration }) => acc + duration, 0) / 1000)
  );

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  return (
    <View style={styles.recordingTimerContainer}>
      <View
        style={{
          width: 1,
          height: 20,
          backgroundColor: "#fff",
        }}
      />
      <Text
        style={{ fontSize: 16, fontWeight: "600", color: "white" }}
        ellipsizeMode="clip"
        numberOfLines={1}
      >
        {formatAudioDuration(seconds)}
      </Text>
    </View>
  );
};

const RecordingButton = ({ recordingState }: { recordingState: RecordingState }) => {
  const isExpanded = recordingState === "recording" || recordingState === "paused";

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: isExpanded ? withSpring(150) : withTiming(50),
      transform: [
        {
          scale:
            recordingState === "recording"
              ? withSequence(withSpring(0.97), withSpring(1))
              : recordingState === "paused"
              ? withSequence(withSpring(1.03), withSpring(1))
              : 1,
        },
      ],
    };
  }, [recordingState]);

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isExpanded ? 1 : 0),
      width: withTiming(isExpanded ? 58 : 0),
      marginLeft: withTiming(isExpanded ? 12 : 0),
    };
  });

  return (
    <Animated.View style={[styles.recordingButton, animatedStyle]}>
      {recordingState === "recording" ? <RecordingPauseIcon /> : <RecordIcon />}

      <Animated.View style={[animatedTextStyle]}>
        {recordingState !== "idle" && <RecordingTimer isRunning={recordingState === "recording"} />}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  recordingButton: {
    width: 50,
    height: 50,
    backgroundColor: "#E5505A",
    borderRadius: 58,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  container: {
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    flexDirection: "row",
    minHeight: 100,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  recordingTimerContainer: {
    gap: 12,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
