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
import {
  eraseAudioRecordingsFromStorage,
  getPersistentAudioRecordings,
  persistAudioRecordings,
} from "utils/persistAudioRecordings";
import { concatAudioFragments } from "utils/concatAudioFragments";
import { t } from "locales/config";
import { useAppStatusEffect } from "hooks/useAppStatusEffect";
import { IS_IOS } from "constants/GeneralConstants";
import { toast } from "./Toast";
import { useOnAudioPlayCallback } from "hooks/useAudioManager";
import { Sentry } from "utils/sentry";
import { throttleTrack, track } from "utils/tracking";
import { 
  uploadChunkToServer, 
  finalizeRecording, 
  checkServerHealth,
  UploadType 
} from "services/audioServerClient";
import { useAuth } from "contexts/auth";
import { AssignmentStatusEnum } from "types/Lessons";

let currentRecordingDurationMillis = 0;
let currentRecording: AudioRecorder | null = null;

const throttledTrack = throttleTrack(2000);

// Session management for server-based recording
let recordingSessionId: string | null = null;
let chunkCounter = 0;
let useServerForRecording = false;

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
type Recording = {
  uri: string;
  durationInMs: number;
};
let recordings: Recording[] = [];

const cleanRecordings = async ({ lessonId }: { lessonId?: string }) => {
  recordings = [];
  recordingSessionId = null;
  chunkCounter = 0;
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
  onServerSubmitSuccess,
  uploadType,
  studentId,
  lessonState,
}: {
  lessonId?: string;
  onSubmit: (params: { uri: string; duration: number }) => Promise<any>;
  onFinished?: (params: { uri: string; duration: number }) => void;
  onServerSubmitSuccess?: (filename?: string) => void | Promise<void>;
  onStatusChange?: (status: RecordingState, recordings: Recording[]) => void;
  uploadType?: UploadType;
  studentId?: string;
  lessonState?: AssignmentStatusEnum;
}) => {
  const { accessToken } = useAuth();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const permissionStatusRef = useRef<PermissionStatus | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusUpdateListenerRef = useRef<any>(null);

  // Recording options configuration
  const recordingOptions: RecordingOptions = {
    extension: IS_IOS ? ".m4a" : ".mp4",
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: IS_IOS ? 128000 : 108000,
    isMeteringEnabled: true,
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
  const audioRecorder = useAudioRecorder(recordingOptions, (status) => {
    if (status.hasError) {
      console.error("Recording error:", status.error);
    }
  });

  const recorderState = useAudioRecorderState(audioRecorder);

  const handleStatusChange = useCallback(
    (status: RecordingState) => {
      setRecordingState(status);
      onStatusChange?.(status, recordings);
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
      if (IS_IOS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleStatusChange("recording");

      // Only create new session if we don't have one (fresh start)
      if (!recordingSessionId) {
        const serverAvailable = await checkServerHealth();
        if (serverAvailable) {
          recordingSessionId = generateSessionId();
          useServerForRecording = true;
          console.log("Using server for recording, session:", recordingSessionId);
        } else {
          useServerForRecording = false;
          console.log("Server not available, using local recording");
        }
      } else {
        console.log("Resuming existing session:", recordingSessionId);
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
    
    if (uri) {
      recordings.push({
        uri,
        durationInMs,
      });
      if (lessonId) persistAudioRecordings({ lessonId, recordings });
      
      // Upload chunk to server if using server mode
      if (useServerForRecording && recordingSessionId) {
        try {
          await uploadChunkToServer({
            sessionId: recordingSessionId,
            chunkIndex: chunkCounter++,
            fileUri: uri,
            token: accessToken || undefined,
          });
          console.log(`Uploaded chunk ${chunkCounter - 1} to server`);
        } catch (error) {
          console.error("Failed to upload chunk to server:", error);
          // If upload fails, we still have local copies as fallback
          toast.show({ 
            title: "Server upload failed, will use local processing", 
            status: "Warning" 
          });
          useServerForRecording = false;
        }
      }
    }
  };

  const pauseRecording = async () => {
    if (!audioRecorder) return;
    handleStatusChange("paused");
    await cutRecording();
  };

  const discardRecording = useCallback(async () => {
    await cleanRecordings({ lessonId });
    handleStatusChange("idle");
    if (IS_IOS)
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: false,
      });
  }, [lessonId]);

  const submitRecording = async () => {
    if (IS_IOS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    try {
      handleStatusChange("submitting");
      await cutRecording();

      let uri: string;
      let durationInSec: number;

      // Always concatenate locally first to get a URI for the audio player
      const concatenatedUri = await concatAudioFragments(
        recordings.map(({ uri }) => uri)
      );
      
      if (!concatenatedUri) {
        throw new Error("Failed to concatenate audio fragments");
      }
      
      uri = concatenatedUri;
      durationInSec =
        Math.round(recordings.reduce((acc, { durationInMs }) => acc + durationInMs, 0) / 1000) ?? 0;

      // Try server-based finalization first
      if (useServerForRecording && recordingSessionId) {
        try {
          console.log("Finalizing recording on server...");
          
          const result = await finalizeRecording({ 
            sessionId: recordingSessionId,
            uploadType,
            lessonId,
            studentId,
            duration: durationInSec,
            lessonState,
          });
          console.log("Finalized recording on server, result:", result);
          
          // Server handled the complete submission flow
          await cleanRecordings({ lessonId });
          handleStatusChange("idle");
          
          // Trigger callback to let RecordScreen know submission succeeded
          await onServerSubmitSuccess?.(result.filename);
          
          return; // Exit early since server handled everything
        } catch (error) {
          console.error("Server finalization failed, falling back to local:", error);
          toast.show({ 
            title: "Server processing failed, using local processing", 
            status: "Warning" 
          });
          // Fall through to local submission
        }
      }

      // Fallback to local submission

      try {
        await cleanRecordings({ lessonId });

        await onSubmit({
          uri,
          duration: durationInSec || 0,
        });

        handleStatusChange("idle");
      } catch {
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
      console.error("Error submitting recording:", error);
      Sentry.captureException(error);
    } finally {
      handleStatusChange("paused");
      if (IS_IOS)
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: false,
        });
    }
  };

  async function startRecordingWithAutoFragmenting() {
    if (IS_IOS)
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

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
            console.log("Metering is too low, stopping recording");
            break;
          } else console.log("Metering is", status.metering);
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
