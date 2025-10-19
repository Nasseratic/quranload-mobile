import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
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

import { Stack, Text, XStack } from "tamagui";
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
import { useOnAudioPlayCallback } from "hooks/useAudioManager";
import { Sentry } from "utils/sentry";
import { throttleTrack } from "utils/tracking";
import { DevLogOverlay } from "./DevLogOverlay";
import { logDevEvent } from "state/devMode";

let currentRecordingDurationMillis = 0;
let currentRecording: Audio.Recording | null = null;

const throttledTrack = throttleTrack(2000);

const cleanCurrentRecording = async () => {
  if (currentRecording) {
    const stopAndUnloadPromise = currentRecording.stopAndUnloadAsync();
    currentRecording = null;
    currentRecordingDurationMillis = 0;
    await stopAndUnloadPromise;
  }
};
type Recording = {
  uri: string;
  durationInMs: number;
};
let recordings: Recording[] = [];

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
  onFinished,
}: {
  lessonId?: string;
  onSubmit: (params: { uri: string; duration: number }) => Promise<any>;
  onFinished?: (params: { uri: string; duration: number }) => void;
  onStatusChange?: (status: RecordingState, recordings: Recording[]) => void;
}) => {
  const [permissionStatus, requestPermission] = Audio.usePermissions({ request: false });
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");

  const handleStatusChange = useCallback(
    (status: RecordingState) => {
      logDevEvent("Recording status changed", {
        status,
        fragments: recordings.length,
        currentRecordingDurationMillis,
      });
      setRecordingState(status);
      onStatusChange?.(status, recordings);
    },
    [onStatusChange]
  );
  async function startRecording() {
    logDevEvent("Attempting to start recording", {
      permissionStatus: permissionStatus?.status,
    });
    let isDenied = permissionStatus && permissionStatus.status === PermissionStatus.DENIED;
    if (!permissionStatus || permissionStatus.status === PermissionStatus.UNDETERMINED) {
      const { granted } = await requestPermission();
      if (!granted) isDenied = true;
      logDevEvent("Microphone permission request completed", {
        granted,
      });
    }

    if (isDenied) {
      logDevEvent("Microphone permission denied by the user");
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
      if (IS_IOS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleStatusChange("recording");

      logDevEvent("Starting recorder with auto fragmenting");
      await startRecordingWithAutoFragmenting();
    } catch (err) {
      toast.reportError(err, t("recordingScreen.failedToStartRecording"));
      handleStatusChange("idle");
      logDevEvent("Failed to start recording", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const cutRecording = async () => {
    if (!currentRecording) return;
    logDevEvent("Cutting active recording fragment", {
      fragments: recordings.length,
    });
    const { durationMillis } = await currentRecording.getStatusAsync();
    const durationInMs = Math.max(durationMillis, currentRecordingDurationMillis);
    if (durationMillis < currentRecordingDurationMillis) {
      Sentry.captureEvent({
        message: "Recording duration missmatch, currentRecordingDurationMillis is greater",
        extra: { durationMillis, currentRecordingDurationMillis },
      });
    }
    const uri = currentRecording.getURI();
    await cleanCurrentRecording();
    if (uri) {
      recordings.push({
        uri,
        durationInMs,
      });
      logDevEvent("Stored recording fragment", {
        durationInMs,
        fragments: recordings.length,
      });
      if (lessonId) persistAudioRecordings({ lessonId, recordings });
    }
  };

  const pauseRecording = async () => {
    if (!currentRecording) return;
    logDevEvent("Pausing recording session");
    handleStatusChange("paused");
    await cutRecording();
  };

  const discardRecording = useCallback(async () => {
    logDevEvent("Discarding all recording fragments", {
      fragments: recordings.length,
    });
    await cleanRecordings({ lessonId });
    handleStatusChange("idle");
    if (IS_IOS)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
  }, [lessonId]);

  const submitRecording = async () => {
    if (IS_IOS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    logDevEvent("Submitting recording", { fragments: recordings.length });
    try {
      handleStatusChange("submitting");
      await cutRecording();
      logDevEvent("Preparing submission payload", {
        fragments: recordings.length,
      });

      const { uri, totalDuration } = await concatAudioFragments(recordings.map(({ uri }) => uri));

      const durationInSec =
        Math.round(recordings.reduce((acc, { durationInMs }) => acc + durationInMs, 0) / 1000) ?? 0;

      if (totalDuration && totalDuration > durationInSec && totalDuration - durationInSec > 5) {
        Sentry.captureEvent({
          message: "Recording duration mismatch, concatAudioFragments totalDuration is greater",
          extra: { totalDuration, durationInSec },
        });
        logDevEvent("Detected duration mismatch after concatenation", {
          totalDuration,
          durationInSec,
        });
      }

      try {
        await cleanRecordings({ lessonId });

        await onSubmit({
          uri,
          duration: durationInSec || totalDuration || 0,
        });

        logDevEvent("Recording submitted successfully", {
          durationInSec,
          totalDuration,
        });
        handleStatusChange("idle");
      } catch (error) {
        logDevEvent("Failed to submit recording, persisting fragments for retry", {
          error: error instanceof Error ? error.message : String(error),
        });
        if (lessonId) {
          persistAudioRecordings({
            lessonId,
            recordings: [
              {
                uri,
                durationInMs: durationInSec * 1000,
              },
            ],
          });
        }
      } finally {
        onFinished?.({ uri, duration: durationInSec });
      }
    } catch (error) {
      logDevEvent("Unexpected error during recording submission", {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      handleStatusChange("paused");
      logDevEvent("Submission flow completed");
      if (IS_IOS)
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
    }
  };

  async function startRecordingWithAutoFragmenting() {
    if (IS_IOS)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
      });

    if (currentRecording) {
      await cleanCurrentRecording();
      toast.show({ title: "want to record while having current recording", status: "Warning" });
      logDevEvent("Cleaned up dangling recording before starting a new one");
    }
    const { recording } = await Audio.Recording.createAsync(
      {
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
        isMeteringEnabled: true,
      },
      ({ durationMillis }) => {
        if (durationMillis === 0) {
          throttledTrack("RecordingStatusChangedWith0Duration");
        }

        currentRecordingDurationMillis = durationMillis;
      },
      100
    );
    currentRecording = recording;
    logDevEvent("Started new recording fragment");

    await sleep(RECORDING_INTERVAL);

    await Promise.race([
      sleep(RECORDING_INTERVAL_TOLERANCE),
      (async () => {
        for (;;) {
          const status = await recording.getStatusAsync();
          if (!status.isRecording) break;
          if (status.metering && status.metering < -40) {
            console.log("Metering is too low, stopping recording");
            logDevEvent("Stopped fragment due to low metering", { metering: status.metering });
            break;
          } else {
            console.log("Metering is", status.metering);
            logDevEvent("Recording metering", { metering: status.metering });
          }
          await sleep(METERING_CHECK_INTERVAL);
        }
      })(),
    ]);

    try {
      if (currentRecording) {
        await cutRecording();
        logDevEvent("Fragment interval reached, starting a new fragment");
        await startRecordingWithAutoFragmenting();
      }
    } catch (err) {
      toast.reportError(err, "Error while creating extra recording fragment");
      logDevEvent("Error while creating extra recording fragment", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  useAppStatusEffect({
    onBackground: pauseRecording,
  });

  useOnAudioPlayCallback(() => {
    if (recordingState === "recording") {
      pauseRecording();
      toast.show({ title: t("audioRecordingPaused"), status: "Warning" });
      logDevEvent("Paused recording due to audio playback");
    }
  });

  useEffect(() => {
    if (lessonId) {
      getPersistentAudioRecordings({ lessonId }).then((savedRecordings) => {
        if (savedRecordings.length > 0) {
          recordings = savedRecordings;
          handleStatusChange("paused");
          console.log("Restored recordings", savedRecordings);
          logDevEvent("Restored saved recording fragments", {
            fragments: savedRecordings.length,
          });
        }
      });
    }
    return () => {
      cutRecording().then(() => {
        if (recordings.length === 0) return;
        logDevEvent("Prompting user to discard pending recordings on exit", {
          fragments: recordings.length,
        });
        Alert.alert(
          t("recordingScreen.discardRecording"),
          t("recordingScreen.discardRecordingDescription"),
          [
            {
              text: t("cancel"),
              style: "cancel",
              onPress: () => {
                recordings = [];
              },
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

  const handleDiscard = () => {
    logDevEvent("User initiated discard confirmation");
    pauseRecording();
    Alert.alert(
      t("recordingScreen.discardRecording"),
      t("recordingScreen.discardRecordingDescription"),
      [
        {
          text: t("cancel"),
          style: "cancel",
          onPress: () => {
            logDevEvent("User cancelled discard dialog");
            startRecording();
          },
        },
        {
          text: t("discard"),
          style: "destructive",
          onPress: () => {
            logDevEvent("User confirmed discard dialog");
            discardRecording();
          },
        },
      ]
    );
  };

  if (recordingState === "submitting")
    return (
      <Stack>
        <ActivityIndicator />
      </Stack>
    );

  return (
    <View style={styles.wrapper}>
      <DevLogOverlay style={styles.devLogOverlay} />
      <XStack jc="center" ai="center" gap="$8">
        <View>
          {recordingState !== "idle" && (
            <IconButton size="sm" bg={Colors.Black[2]} icon={<CrossIcon />} onPress={handleDiscard} />
          )}
        </View>

        <TouchableOpacity
          onPress={
            recordingState === "recording"
              ? () => {
                  if (IS_IOS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  pauseRecording();
                }
              : startRecording
          }
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
    </View>
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
    Math.round(recordings.reduce((acc, { durationInMs }) => acc + durationInMs, 0) / 1000)
  );

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setSeconds(
          Math.round(
            (recordings.reduce((acc, { durationInMs }) => acc + durationInMs, 0) +
              +currentRecordingDurationMillis) /
              1000
          )
        );
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
  wrapper: {
    width: "100%",
    position: "relative",
    alignItems: "center",
  },
  devLogOverlay: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    right: 0,
    marginBottom: 12,
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
