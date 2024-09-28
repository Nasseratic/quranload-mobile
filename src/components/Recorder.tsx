import { useState, useEffect, useCallback } from "react";
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
  eraseAudioRecordingsFromStorage,
  getPersistentAudioRecordings,
  persistAudioRecordings,
} from "utils/persistAudioRecordings";
import { concatAudioFragments } from "utils/concatAudioFragments";
import { t } from "locales/config";
import { useAppStatusEffect } from "hooks/useAppStatusEffect";
import { IS_IOS } from "constants/GeneralConstants";
import {
  AndroidAudioEncoder,
  AndroidOutputFormat,
  IOSAudioQuality,
  IOSOutputFormat,
} from "expo-av/build/Audio";
import { toast } from "./Toast";
import { PermissionStatus } from "../../node_modules/expo-modules-core/src/PermissionsInterface";

let currentRecording: Audio.Recording | null = null;

const cleanCurrentRecording = async () => {
  if (currentRecording) {
    const stopAndUnloadPromise = currentRecording.stopAndUnloadAsync();
    currentRecording = null;
    await stopAndUnloadPromise;
  }
};

let recordings: {
  uri: string;
  duration: number;
}[] = [];

const cleanRecordings = async ({ lessonId }: { lessonId?: string }) => {
  recordings = [];
  await Promise.all([
    cleanCurrentRecording(),
    lessonId ? eraseAudioRecordingsFromStorage({ lessonId }) : Promise.resolve(),
  ]);
};

const RECORDING_INTERVAL = 60 * 1000 * 2;
const RECORDING_INTERVAL_TOLERANCE = 15 * 1000;
const METERING_CHECK_INTERVAL = 300;

export type RecordingState = "idle" | "recording" | "paused" | "submitting";

export const Recorder = ({
  lessonId,
  onSubmit,
  onStatusChange,
}: {
  lessonId?: string;
  onSubmit: (params: { uri: string; duration: number }) => Promise<any>;
  onStatusChange?: (status: RecordingState) => void;
}) => {
  const [permissionStatus, requestPermission] = Audio.usePermissions({ request: false });
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");

  const handleStatusChange = useCallback(
    (status: RecordingState) => {
      setRecordingState(status);
      onStatusChange?.(status);
    },
    [onStatusChange]
  );
  async function startRecording() {
    let isDenied = permissionStatus && permissionStatus.status === PermissionStatus.DENIED;
    if (!permissionStatus || permissionStatus.status === PermissionStatus.UNDETERMINED) {
      const { granted } = await requestPermission();
      if (!granted) isDenied = true;
    }

    if (isDenied) {
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
      if (IS_IOS) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleStatusChange("recording");

      await startRecordingWithAutoFragmenting();
    } catch (err) {
      //Implement error handling
      err;
      handleStatusChange("idle");
    }
  }

  const cutRecording = async () => {
    if (!currentRecording) return;
    const { durationMillis } = await currentRecording.getStatusAsync();
    const uri = currentRecording.getURI();
    await cleanCurrentRecording();
    if (uri) {
      recordings.push({
        uri,
        duration: durationMillis,
      });
      if (lessonId) persistAudioRecordings({ lessonId, recordings });
    }
  };

  const pauseRecording = async () => {
    if (!currentRecording) return;
    handleStatusChange("paused");
    if (IS_IOS) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await cutRecording();
  };

  const discardRecording = useCallback(async () => {
    await cleanRecordings({ lessonId });
    handleStatusChange("idle");
    if (IS_IOS)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
  }, [lessonId]);

  const submitRecording = async () => {
    try {
      if (IS_IOS) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await cutRecording();
      handleStatusChange("submitting");
      if (IS_IOS)
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      const uri = await concatAudioFragments(recordings.map(({ uri }) => uri));

      if (!uri) return;

      // in case of error, we want to keep the recordings
      const tempRecordings = recordings;
      try {
        const duration = Math.round(
          recordings.reduce((acc, { duration }) => acc + duration, 0) / 1000
        );
        recordings = [];
        await onSubmit({
          uri,
          duration,
        });
        await cleanRecordings({ lessonId });
      } catch {
        recordings = tempRecordings;
        //TODO: Error handling
      }
    } finally {
      handleStatusChange("idle");
    }
  };

  async function startRecordingWithAutoFragmenting() {
    try {
      if (IS_IOS)
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
        });
      if (currentRecording) {
        await cleanCurrentRecording();
        toast.show({ title: "want to record while having current recording", status: "Warning" });
      }
      const { recording } = await Audio.Recording.createAsync({
        web: {},
        ios: {
          extension: ".m4a",
          outputFormat: IOSOutputFormat.MPEG4AAC,
          audioQuality: IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        android: {
          extension: ".mp4",
          outputFormat: AndroidOutputFormat.MPEG_4, //mp4 (m4a)
          audioEncoder: AndroidAudioEncoder.AMR_WB,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 108000,
        },
      });
      currentRecording = recording;

      await sleep(RECORDING_INTERVAL);

      await Promise.race([
        sleep(RECORDING_INTERVAL_TOLERANCE),
        (async () => {
          for (;;) {
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
      if (currentRecording) {
        await cutRecording();
        startRecordingWithAutoFragmenting();
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  useAppStatusEffect({
    onBackground: pauseRecording,
  });

  useEffect(() => {
    if (lessonId) {
      getPersistentAudioRecordings({ lessonId }).then((savedRecordings) => {
        if (savedRecordings.length > 0) {
          recordings = savedRecordings;
          handleStatusChange("paused");
          console.log("Restored recordings", savedRecordings);
        }
      });
    }
    return () => {
      cutRecording().then(() => {
        if (recordings.length === 0) return;
        Alert.alert(
          t("recordingScreen.discardRecording"),
          t("recordingScreen.discardRecordingDescription"),
          [
            {
              text: t("cancel"),
              style: "cancel",
            },
            {
              text: t("discard"),
              style: "destructive",
              onPress: discardRecording,
            },
          ]
        );
      });
    };
  }, [lessonId]);

  if (recordingState === "submitting") return <ActivityIndicator />;

  return (
    <XStack jc="center" ai="center" gap="$8">
      <View>
        {recordingState !== "idle" && (
          <IconButton
            size="sm"
            bg={Colors.Black[2]}
            icon={<CrossIcon />}
            onPress={() =>
              Alert.alert(
                t("recordingScreen.discardRecording"),
                t("recordingScreen.discardRecordingDescription"),
                [
                  {
                    text: t("cancel"),
                    style: "cancel",
                  },
                  {
                    text: t("discard"),
                    style: "destructive",
                    onPress: discardRecording,
                  },
                ]
              )
            }
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
      width: isExpanded ? withSpring(155) : withTiming(45),
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
      width: withTiming(isExpanded ? 75 : 0),
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
