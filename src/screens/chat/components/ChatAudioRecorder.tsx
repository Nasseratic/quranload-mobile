import { useState, useEffect, useRef } from "react";
import {
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import {
  useAudioRecorder,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  RecordingOptions,
  IOSOutputFormat,
  AudioQuality,
  PermissionStatus,
  AudioRecorder,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import { XStack, Stack, Text } from "tamagui";
import { formatAudioDuration } from "utils/formatAudioDuration";
import { Colors } from "constants/Colors";
import { CrossIcon } from "components/icons/CrossIcon";
import { SendIcon } from "components/icons/SendIcon";
import { StopIcon } from "components/icons/StopIcon";
import { IconButton } from "components/buttons/IconButton";
import { useAppStatusEffect } from "hooks/useAppStatusEffect";
import { IS_IOS } from "constants/GeneralConstants";
import { useOnAudioPlayCallback } from "hooks/useAudioManager";
import { t } from "locales/config";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

const AnimatedStack = Animated.createAnimatedComponent(Stack);

const MAX_RECORDING_DURATION_MS = 2 * 60 * 1000; // 2 minutes

export const ChatAudioRecorder = ({
  isVisible,
  onClose,
  onSend,
}: {
  isVisible: boolean;
  onClose: () => void;
  onSend: (params: { uri: string }) => Promise<void>;
}) => {
  const permissionStatusRef = useRef<PermissionStatus | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoStopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "stopped">("idle");
  const [durationMs, setDurationMs] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Animation for the recording dot
  const dotScale = useSharedValue(1);

  const recordingOptions: RecordingOptions = {
    extension: IS_IOS ? ".m4a" : ".mp4",
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: IS_IOS ? 128000 : 108000,
    isMeteringEnabled: false,
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

  const audioRecorder = useAudioRecorder(recordingOptions);

  const clearTimers = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (
      !permissionStatusRef.current ||
      permissionStatusRef.current === PermissionStatus.UNDETERMINED
    ) {
      const { status, granted } = await requestRecordingPermissionsAsync();
      permissionStatusRef.current = status;
      if (!granted) {
        Alert.alert(
          t("permission.required") || "Permission Required",
          t("permission.microphone.description") || "Microphone access is required to record audio messages",
          [
            {
              text: t("goToSettings") || "Go to Settings",
              onPress: () => Linking.openSettings(),
            },
            {
              text: t("cancel") || "Cancel",
            },
          ]
        );
        return false;
      }
    }

    return permissionStatusRef.current !== PermissionStatus.DENIED;
  };

  const startRecording = async () => {
    if (!await requestPermission()) {
      onClose();
      return;
    }

    try {
      // Set audio mode for iOS
      if (IS_IOS) {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      }

      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();
      audioRecorderRef.current = audioRecorder;

      setRecordingState("recording");
      setDurationMs(0);

      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Start);

      // Start duration polling
      durationIntervalRef.current = setInterval(() => {
        const status = audioRecorder.getStatus();
        setDurationMs(status.durationMillis);
      }, 100);

      // Set auto-stop timer for 2 minutes
      autoStopTimerRef.current = setTimeout(() => {
        stopRecording();
      }, MAX_RECORDING_DURATION_MS);

      // Start dot animation
      dotScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1
      );
    } catch (err) {
      Alert.alert(
        t("error") || "Error",
        t("recordingScreen.failedToStartRecording") || "Failed to start recording"
      );
      onClose();
    }
  };

  const stopRecording = async () => {
    clearTimers();
    dotScale.value = 1;

    if (!audioRecorderRef.current) return;

    try {
      const uri = audioRecorder.uri;
      await audioRecorder.stop();
      audioRecorderRef.current = null;

      // Reset audio mode for iOS
      if (IS_IOS) {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: false,
        });
      }

      if (uri) {
        setRecordedUri(uri);
        setRecordingState("stopped");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        onClose();
      }
    } catch (err) {
      Alert.alert(
        t("error") || "Error",
        t("recordingScreen.failedToStopRecording") || "Failed to stop recording"
      );
      onClose();
    }
  };

  const discardRecording = async () => {
    clearTimers();
    dotScale.value = 1;

    if (audioRecorderRef.current) {
      try {
        await audioRecorder.stop();
        audioRecorderRef.current = null;
      } catch (err) {
        // Ignore cleanup errors
      }
    }

    if (IS_IOS) {
      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: false,
        });
      } catch (err) {
        // Ignore cleanup errors
      }
    }

    setRecordingState("idle");
    setRecordedUri(null);
    setDurationMs(0);
    onClose();
  };

  const sendRecording = async () => {
    if (!recordedUri) return;

    setIsSending(true);
    try {
      await onSend({ uri: recordedUri });
    } finally {
      setIsSending(false);
    }
  };

  // Auto-start recording when component becomes visible
  useEffect(() => {
    if (isVisible) {
      startRecording();
    }
    return () => {
      clearTimers();
      if (audioRecorderRef.current) {
        audioRecorder.stop();
      }
    };
  }, [isVisible]);

  // Handle app going to background - stop recording
  useAppStatusEffect({
    onBackground: () => {
      if (recordingState === "recording") {
        stopRecording();
      }
    },
  });

  // Stop recording if other audio starts playing
  useOnAudioPlayCallback(() => {
    if (recordingState === "recording") {
      stopRecording();
    }
  });

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <XStack
      px="$3"
      py="$2"
      ai="center"
      jc="space-between"
      bg="white"
      minHeight={50}
      borderTopWidth={1}
      borderTopColor="$gray4"
    >
      {/* Recording State */}
      {recordingState === "recording" && (
        <>
          {/* Cancel Button */}
          <IconButton
            icon={<CrossIcon color="#666" />}
            size="xs"
            bg={Colors.Black[4]}
            onPress={discardRecording}
          />

          {/* Timer Display with Animated Dot */}
          <XStack ai="center" gap="$2" flex={1} jc="center">
            <AnimatedStack
              w={8}
              h={8}
              bg={Colors.Error[1]}
              borderRadius={4}
              style={dotAnimatedStyle}
            />
            <Text fontSize={16} fontWeight="600" color="$gray12">
              {formatAudioDuration(Math.floor(durationMs / 1000))}
            </Text>
            <Text fontSize={14} color="$gray9">
              / 02:00
            </Text>
          </XStack>

          {/* Stop Button */}
          <IconButton
            icon={<StopIcon color="#fff" size={18} />}
            size="xs"
            bg={Colors.Error[1]}
            onPress={stopRecording}
          />
        </>
      )}

      {/* Stopped State */}
      {recordingState === "stopped" && (
        <>
          {/* Discard Button */}
          <IconButton
            icon={<CrossIcon color="#666" />}
            size="xs"
            bg={Colors.Black[4]}
            onPress={discardRecording}
          />

          {/* Duration Display */}
          <Text fontSize={16} fontWeight="600" color="$gray12">
            {formatAudioDuration(Math.floor(durationMs / 1000))}
          </Text>

          {/* Send Button */}
          {isSending ? (
            <ActivityIndicator size="small" color={Colors.Success[1]} />
          ) : (
            <IconButton
              icon={<SendIcon color="#fff" size={18} />}
              size="xs"
              bg={Colors.Success[1]}
              onPress={sendRecording}
            />
          )}
        </>
      )}
    </XStack>
  );
};
