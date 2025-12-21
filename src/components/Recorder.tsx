import { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal } from "react-native";
import {
  useAudioRecorder,
  useAudioRecorderState,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
  RecordingPresets,
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
import { throttleTrack, track } from "utils/tracking";
import { useCvxMutation, useCvxQuery } from "api/convex";
import { api } from "../../convex/_generated/api";
import { useUploadFile } from "@convex-dev/r2/react";
import { useAuth } from "contexts/auth";
import { AssignmentStatusEnum } from "types/Lessons";

let currentRecordingDurationMillis = 0;
let currentRecording: AudioRecorder | null = null;

const throttledTrack = throttleTrack(2000);

// Session management using Convex
let recordingSessionId: string | null = null;
let convexSessionDbId: string | null = null;
let chunkCounter = 0;

// Generate a unique session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

const cleanCurrentRecording = async () => {
  if (currentRecording) {
    const stopPromise = currentRecording.stop();
    currentRecording = null;
    currentRecordingDurationMillis = 0;
    await stopPromise;
  }
};

// Track total duration locally for UI purposes  
let totalRecordingDuration = 0;

const cleanRecordings = async (deleteSessionMutation?: any) => {
  if (recordingSessionId && deleteSessionMutation) {
    try {
      await deleteSessionMutation({ sessionId: recordingSessionId });
    } catch (error) {
      // Ignored
    }
  }
  totalRecordingDuration = 0;
  recordingSessionId = null;
  convexSessionDbId = null;
  chunkCounter = 0;
  await cleanCurrentRecording();
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
  onServerSubmitSuccess,
  uploadType,
  studentId,
  lessonState,
}: {
  lessonId?: string;
  onSubmit: (params: { uri: string; duration: number }) => Promise<any>;
  onFinished?: (params: { uri: string; duration: number }) => void;
  onServerSubmitSuccess?: (filename?: string) => void | Promise<void>;
  onStatusChange?: (status: RecordingState, totalRecordingDuration: number) => void;
  uploadType?: 'feedback' | 'submission';
  studentId?: string;
  lessonState?: AssignmentStatusEnum;
}) => {
  const { user } = useAuth();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const permissionStatusRef = useRef<PermissionStatus | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Convex mutations
  const createSession = useCvxMutation(api.services.recordings.createSession);
  const updateSessionStatus = useCvxMutation(api.services.recordings.updateSessionStatus);
  const addFragment = useCvxMutation(api.services.recordings.addFragment);
  const deleteSession = useCvxMutation(api.services.recordings.deleteSession);

  // Monitor session status
  const sessionData = useCvxQuery(
    api.services.recordings.getSession,
    recordingSessionId ? { sessionId: recordingSessionId } : "skip" as any
  );

  // Effect to handle session completion/failure
  useEffect(() => {
    if (recordingState === "submitting" && sessionData) {
      if (sessionData.status === "completed") {
        handleStatusChange("idle");
        cleanRecordings(); // Local cleanup
        onServerSubmitSuccess?.(sessionData.finalAudioKey);
      } else if (sessionData.status === "failed") {
        toast.show({ 
          title: "Processing failed", 
          status: "Error" 
        });
        handleStatusChange("idle");
      }
    }
  }, [sessionData, recordingState]);

  // R2 upload hook
  const uploadFile = useUploadFile(api.services.recordings);

  // Recording options configuration
  const recordingOptions: RecordingOptions = {
    extension: IS_IOS ? ".m4a" : ".mp4",
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: IS_IOS ? 128000 : 108000,
    isMeteringEnabled: true,
    web: {}, // Add web config to satisfy RecordingOptions type
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

  const recorderState = useAudioRecorderState(audioRecorder);

  const handleStatusChange = useCallback(
    (status: RecordingState) => {
      setRecordingState(status);
      onStatusChange?.(status, totalRecordingDuration);
    },
    [onStatusChange]
  );
  async function startRecording() {
    let isDenied = permissionStatusRef.current === PermissionStatus.DENIED;

    if (!permissionStatusRef.current || permissionStatusRef.current === PermissionStatus.UNDETERMINED) {
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
      // if (IS_IOS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleStatusChange("recording");

      // Only create new session if we don't have one (fresh start)
      if (!recordingSessionId) {
        recordingSessionId = generateSessionId();

        try {
          // Create session in Convex
          await createSession({
            sessionId: recordingSessionId,
            userId: user?.id || "unknown",
            uploadType,
            lessonId,
            studentId,
            lessonState,
          });
        } catch (error) {
          toast.show({
            title: "Failed to create recording session",
            status: "Error"
          });
          handleStatusChange("idle");
          return;
        }
      } else {
        // Update session status to recording
        await updateSessionStatus({
          sessionId: recordingSessionId,
          status: "recording",
        });
      }

      await startRecordingWithAutoFragmenting();
    } catch (err) {
      toast.reportError(err, t("recordingScreen.failedToStartRecording"));
      handleStatusChange("idle");
    }
  }

  const cutRecording = async () => {
    if (!audioRecorder) return;
    if (!currentRecording) return; // No active recording to cut
    
    const status = audioRecorder.getStatus();
    const durationInMs = Math.max(status.durationMillis, currentRecordingDurationMillis);
    if (status.durationMillis < currentRecordingDurationMillis) {
      Sentry.captureEvent({
        message: "Recording duration missmatch, currentRecordingDurationMillis is greater",
        extra: { durationMillis: status.durationMillis, currentRecordingDurationMillis },
      });
    }
    const uri = audioRecorder.uri;
    await audioRecorder.stop();
    currentRecording = null;
    currentRecordingDurationMillis = 0;
    
    if (uri && recordingSessionId) {
      // Update total duration for UI
      totalRecordingDuration += durationInMs;

      // Upload fragment to R2 via Convex useUploadFile hook
      try {
        // Fetch blob directly from local file URI
        const response = await fetch(uri);
        const blob = await response.blob();

        // Create a File object from the blob with proper naming
        const fileName = `fragment_${chunkCounter}.m4a`;
        const file = new File([blob], fileName, { type: "audio/x-m4a" });

        // Upload to R2 using the useUploadFile hook
        const key = await uploadFile(file);

        // Add fragment metadata to Convex database
        await addFragment({
          sessionId: recordingSessionId,
          fragmentIndex: chunkCounter,
          r2Key: key,
          duration: durationInMs,
        });

        chunkCounter++;
      } catch (error) {
        toast.show({
          title: "Fragment upload failed",
          status: "Warning"
        });
      }
    }
  };

  const pauseRecording = async () => {
    if (!audioRecorder) return;
    handleStatusChange("paused");
    await cutRecording();
    
    // Update Convex session status
    if (recordingSessionId) {
      await updateSessionStatus({
        sessionId: recordingSessionId,
        status: "paused",
      });
    }
  };

  const discardRecording = useCallback(async () => {
    await cleanRecordings(deleteSession);
    handleStatusChange("idle");
    if (IS_IOS)
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: false,
      });
  }, [deleteSession]);

  const submitRecording = async () => {
    if (IS_IOS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    try {
      handleStatusChange("submitting");
      await cutRecording();

      const durationInSec = Math.round(totalRecordingDuration / 1000) ?? 0;

      // Trigger audio server finalization with Convex session
      if (recordingSessionId) {
        try {
          // Update session status to finalizing
          // The worker will pick it up from here
          await updateSessionStatus({
            sessionId: recordingSessionId,
            status: "finalizing",
          });
          
          // We don't call finalizeRecording anymore.
          // The useEffect above will catch the status change to "completed"
        } catch (error) {
          toast.show({ 
            title: "Submit trigger failed", 
            status: "Error" 
          });
          handleStatusChange("idle");
        }
      } else {
        toast.show({ 
          title: "No recording session found", 
          status: "Error" 
        });
        handleStatusChange("idle");
      }

    } catch (error) {
      Sentry.captureException(error);
    } finally {
      handleStatusChange("idle");
      if (IS_IOS)
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: false,
        });
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
        currentRecordingDurationMillis = status.durationMillis;
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
    onBackground: pauseRecording,
  });

  useOnAudioPlayCallback(() => {
    if (recordingState === "recording") {
      pauseRecording();
      toast.show({ title: t("audioRecordingPaused"), status: "Warning" });
    }
  });

  // Initialize permission status on mount
  useEffect(() => {
    getRecordingPermissionsAsync().then(({ status }) => {
      permissionStatusRef.current = status;
    });
  }, []);

  useEffect(() => {
    // Session cleanup on unmount
    return () => {
      cutRecording().then(() => {
        if (recordingSessionId) {
          Alert.alert(
            t("recordingScreen.discardRecording"),
            t("recordingScreen.discardRecordingDescription"),
            [
              {
                text: t("cancel"),
                style: "cancel",
                onPress: () => {
                  // Keep session active
                },
              },
              {
                text: t("discard"),
                style: "destructive",
                onPress: discardRecording,
              },
            ]
          );
        }
      });
    };
  }, [discardRecording]);

  const handleDiscard = () => {
    pauseRecording();
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
    Math.round(totalRecordingDuration / 1000)
  );

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setSeconds(
          Math.round(
            (totalRecordingDuration + currentRecordingDurationMillis) / 1000
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
