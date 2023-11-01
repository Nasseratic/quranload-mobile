import { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import { RecordIcon } from "components/icons/RecordIcon";
import { RecordingPauseIcon } from "components/icons/RecordingPauseIcon";
import * as Linking from "expo-linking";
import Animated, {
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "constants/Colors";
import { Checkmark } from "components/icons/CheckmarkIcon";
import { CrossIcon } from "components/icons/CrossIcon";
import * as Haptics from "expo-haptics";
import { formatAudioDuration } from "utils/formatAudioDuration";
import { IconButton } from "components/buttons/IconButton";

import { XStack } from "tamagui";
import { sleep } from "utils/sleep";
import {
  clearAudioRecordings,
  getPersistentAudioRecordings,
  persistAudioRecordings,
} from "utils/persistAudioRecordings";
import { concatAudioFragments } from "utils/concatAudioFragments";

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

export const RecordingScreenRecorder = ({
  lessonId,
  onSubmit,
}: {
  lessonId: string;
  onSubmit: (params: { uri: string; duration: number }) => void;
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [isConcatenatingAudio, setIsConcatenatingAudio] = useState(false);

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

  async function discardRecording() {
    await currentRecording?.stopAndUnloadAsync();
    currentRecording = null;
    recordings = [];
    setRecordingState("idle");
    clearAudioRecordings({ lessonId });
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
  }

  const submitRecording = async () => {
    setRecordingState("idle");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await cutRecording();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    setIsConcatenatingAudio(true);
    const uri = await concatAudioFragments(recordings.map(({ uri }) => uri));
    setIsConcatenatingAudio(false);

    if (!uri) return;
    onSubmit({
      uri,
      duration: Math.round(recordings.reduce((acc, { duration }) => acc + duration, 0) / 1000),
    });
  };

  async function startRecordingWithAutoFragmenting() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HEIGH_QUALITY
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

  if (isConcatenatingAudio) return <ActivityIndicator />;

  return (
    <XStack jc="center" ai="center" gap="$2">
      <View>
        {recordingState !== "idle" && (
          <IconButton
            size="sm"
            bg={Colors.Black[2]}
            icon={<CrossIcon />}
            onPress={discardRecording}
          />
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
          <IconButton
            size="sm"
            bg={Colors.Success[1]}
            icon={<Checkmark />}
            onPress={submitRecording}
          />
        )}
      </View>
    </XStack>
  );
};

const RecordingButton = ({ recordingState }: { recordingState: RecordingState }) => {
  const isExpanded = recordingState === "recording" || recordingState === "paused";

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: isExpanded ? withSpring(120) : withTiming(45),
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
      width: withTiming(isExpanded ? 54 : 0),
      marginLeft: withTiming(isExpanded ? 6 : 0),
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

const styles = StyleSheet.create({
  recordingButton: {
    width: 45,
    height: 45,
    borderRadius: 45,
    backgroundColor: "#E5505A",
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
  recordingTimerContainer: {
    gap: 12,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
