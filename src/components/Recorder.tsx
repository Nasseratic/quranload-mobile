import { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import {
  useAudioRecorder,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
  RecordingOptions,
  IOSOutputFormat,
  AudioQuality,
  PermissionStatus,
  AudioRecorder,
} from "expo-audio";
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
import { t } from "locales/config";
import { useAppStatusEffect } from "hooks/useAppStatusEffect";
import { IS_IOS } from "constants/GeneralConstants";
import { toast } from "./Toast";
import { useOnAudioPlayCallback } from "hooks/useAudioManager";
import { Sentry } from "utils/sentry";
import { throttleTrack } from "utils/tracking";
import { useAuth } from "contexts/auth";
import { AssignmentStatusEnum } from "types/Lessons";
import { useRecordingSession, RecordingState } from "hooks/useRecordingSession";

// Only allowed module-level variable: reference to the active native audio recorder
let currentRecording: AudioRecorder | null = null;

const throttledTrack = throttleTrack(2000);

const cleanCurrentRecording = async () => {
  if (currentRecording) {
    const stopPromise = currentRecording.stop();
    currentRecording = null;
    await stopPromise;
  }
};

const RECORDING_INTERVAL = 60 * 1000 * 2;
const RECORDING_INTERVAL_TOLERANCE = 15 * 1000;
const METERING_CHECK_INTERVAL = 300;

export { RecordingState };

export const Recorder = ({
  lessonId,
  onStatusChange,
  onServerSubmitSuccess,
  uploadType,
  studentId,
  lessonState,
}: {
  lessonId?: string;
  onSubmit?: (params: { uri: string; duration: number }) => Promise<unknown>;
  onFinished?: (params: { uri: string; duration: number }) => void;
  onServerSubmitSuccess?: (filename?: string) => void | Promise<void>;
  onStatusChange?: (status: RecordingState, totalRecordingDuration: number) => void;
  uploadType?: "feedback" | "submission";
  studentId?: string;
  lessonState?: AssignmentStatusEnum;
}) => {
  const { user } = useAuth();
  const permissionStatusRef = useRef<PermissionStatus | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track current fragment duration locally for UI display
  const [currentFragmentDurationMs, setCurrentFragmentDurationMs] = useState(0);

  // Use the Convex-based recording session hook
  const {
    sessionId,
    status: recordingState,
    totalDuration,
    pendingUploads,
    startSession,
    pauseSession,
    resumeSession,
    submitSession,
    discardSession,
    queueFragment,
    recoverableSession,
    recoverSession,
    dismissRecovery,
  } = useRecordingSession({
    userId: user?.id || "unknown",
    lessonId,
    studentId,
    uploadType: uploadType === "feedback" ? "feedback_submission" : "lesson_submission",
    lessonState,
    onServerSubmitSuccess,
  });

  // Notify parent of status changes (since removed from hook)
  useEffect(() => {
    onStatusChange?.(recordingState, totalDuration);
  }, [recordingState, totalDuration, onStatusChange]);

  // Computed display duration (Convex total + current fragment)
  const displayDurationSeconds = Math.round((totalDuration + currentFragmentDurationMs) / 1000);

  // Recording options configuration
  const recordingOptions: RecordingOptions = {
    extension: IS_IOS ? ".m4a" : ".mp4",
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: IS_IOS ? 128000 : 108000,
    isMeteringEnabled: true,
    web: {},
    ios: {
      extension: ".m4a",
      outputFormat: IOSOutputFormat.MPEG4AAC,
      audioQuality: AudioQuality.MAX,
      sampleRate: 44100,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    android: {
      extension: ".mp4",
      outputFormat: "mpeg4",
      audioEncoder: "aac",
      sampleRate: 44100,
    },
  };

  // Create the audio recorder using the hook
  const audioRecorder = useAudioRecorder(recordingOptions);

  // Track if we've shown the recovery dialog to avoid showing it multiple times
  const hasShownRecoveryDialogRef = useRef(false);

  // Show recovery dialog if there's an incomplete session
  useEffect(() => {
    if (recoverableSession && !hasShownRecoveryDialogRef.current) {
      hasShownRecoveryDialogRef.current = true;
      Alert.alert(
        t("recordingScreen.resumeRecording"),
        t("recordingScreen.resumeRecordingDescription"),
        [
          {
            text: t("discard"),
            style: "destructive",
            onPress: dismissRecovery,
          },
          {
            text: t("resume"),
            onPress: () => {
              recoverSession();
              // Don't auto-start recording, let user press record button
            },
          },
        ]
      );
    }
  }, [recoverableSession, dismissRecovery, recoverSession]);

  async function startRecording() {
    let isDenied = permissionStatusRef.current === PermissionStatus.DENIED;

    if (
      !permissionStatusRef.current ||
      permissionStatusRef.current === PermissionStatus.UNDETERMINED
    ) {
      const { status, granted } = await requestRecordingPermissionsAsync();
      permissionStatusRef.current = status;
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
      // Start or resume session
      if (!sessionId) {
        await startSession();
      } else {
        await resumeSession();
      }

      await startRecordingWithAutoFragmenting();
    } catch (err) {
      toast.reportError(err, t("recordingScreen.failedToStartRecording"));
    }
  }

  const cutRecording = async () => {
    if (!audioRecorder) return;
    if (!currentRecording) return;

    const status = audioRecorder.getStatus();
    const durationInMs = status.durationMillis;

    if (durationInMs === 0) {
      Sentry.captureEvent({
        message: "Recording duration is 0 when cutting",
      });
    }

    const uri = audioRecorder.uri;
    await audioRecorder.stop();
    currentRecording = null;

    // Reset current fragment duration
    setCurrentFragmentDurationMs(0);

    if (uri && sessionId) {
      // Queue fragment for upload (handles offline resilience)
      queueFragment(uri, durationInMs);
    }
  };

  const handlePauseRecording = async () => {
    if (!audioRecorder) return;
    await cutRecording();
    await pauseSession();
  };

  const discardRecording = useCallback(async () => {
    await cleanCurrentRecording();
    setCurrentFragmentDurationMs(0);
    await discardSession();
    if (IS_IOS) {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: false,
      });
    }
  }, [discardSession]);

  const submitRecording = async () => {
    if (IS_IOS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    try {
      await cutRecording();
      await submitSession();
    } catch (error) {
      Sentry.captureException(error);
    } finally {
      if (IS_IOS) {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: false,
        });
      }
    }
  };

  async function startRecordingWithAutoFragmenting() {
    if (IS_IOS) {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    }

    if (currentRecording) {
      await cleanCurrentRecording();
      toast.show({ title: "want to record while having current recording", status: "Warning" });
    }

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    currentRecording = audioRecorder;

    // Poll for duration updates
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    durationIntervalRef.current = setInterval(() => {
      if (currentRecording) {
        const status = currentRecording.getStatus();
        if (status.durationMillis === 0) {
          throttledTrack("RecordingStatusChangedWith0Duration");
        }
        setCurrentFragmentDurationMs(status.durationMillis);
      }
    }, 100);

    await sleep(RECORDING_INTERVAL);

    await Promise.race([
      sleep(RECORDING_INTERVAL_TOLERANCE),
      (async () => {
        for (;;) {
          if (!currentRecording) break;
          const status = currentRecording.getStatus();
          if (!status.isRecording) break;
          if (status.metering && status.metering < -40) {
            break;
          }
          await sleep(METERING_CHECK_INTERVAL);
        }
      })(),
    ]);

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    try {
      if (currentRecording) {
        await cutRecording();
        await startRecordingWithAutoFragmenting();
      }
    } catch (err) {
      toast.reportError(err, "Error while creating extra recording fragment");
    }
  }

  useAppStatusEffect({
    onBackground: handlePauseRecording,
  });

  useOnAudioPlayCallback(() => {
    if (recordingState === "recording") {
      handlePauseRecording();
      toast.show({ title: t("audioRecordingPaused"), status: "Warning" });
    }
  });

  // Initialize permission status on mount
  useEffect(() => {
    getRecordingPermissionsAsync().then(({ status }) => {
      permissionStatusRef.current = status;
    });
  }, []);

  // Cleanup on unmount only - use ref to avoid stale closure issues
  const sessionIdRef = useRef(sessionId);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      // Only show alert if there's an active session when unmounting
      // Note: We don't auto-discard - the session will be recoverable on next mount
    };
  }, []);

  const handleDiscard = () => {
    handlePauseRecording();
    Alert.alert(
      t("recordingScreen.discardRecording"),
      t("recordingScreen.discardRecordingDescription"),
      [
        {
          text: t("cancel"),
          style: "cancel",
          onPress: startRecording,
        },
        {
          text: t("discard"),
          style: "destructive",
          onPress: discardRecording,
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
    <XStack jc="center" ai="center" gap="$8">
      {/* Pending uploads indicator */}
      {pendingUploads > 0 && (
        <XStack ai="center" gap="$2" position="absolute" top={-30} left={0} right={0} jc="center">
          <ActivityIndicator size="small" color={Colors.Primary[1]} />
          <Text fontSize={12} color="$gray10">
            {t("uploadingFragments", { count: pendingUploads })}
          </Text>
        </XStack>
      )}

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
                handlePauseRecording();
              }
            : startRecording
        }
        activeOpacity={0.9}
      >
        <RecordingButton recordingState={recordingState} durationSeconds={displayDurationSeconds} />
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

const RecordingButton = ({
  recordingState,
  durationSeconds,
}: {
  recordingState: RecordingState;
  durationSeconds: number;
}) => {
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
        {recordingState !== "idle" && <RecordingTimer seconds={durationSeconds} />}
      </Animated.View>
    </Animated.View>
  );
};

const RecordingTimer = ({ seconds }: { seconds: number }) => {
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
