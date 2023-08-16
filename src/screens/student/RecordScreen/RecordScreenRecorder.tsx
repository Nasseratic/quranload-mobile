import { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Audio } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RecordIcon } from "components/icons/RecordIcon";
import { RecordingIcon } from "components/icons/RecordingIcon";
import * as Linking from "expo-linking";
import Animated, {
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { IconButton } from "components/buttons/IconButton";
import { Colors } from "constants/Colors";
import { Checkmark } from "components/icons/CheckmarkIcon";
import { CrossIcon } from "components/icons/CrossIcon";
import * as Haptics from "expo-haptics";

let currentRecording: Audio.Recording | null = null;

const recordings: string[] = [];
const RECORDING_INTERVAL = 60 * 1000 * 2;
const RECORDING_INTERVAL_TOLERANCE = 10 * 1000;
const METERING_CHECK_INTERVAL = 300;

type RecordingState = "idle" | "recording" | "paused";

export function RecordScreenRecorder() {
  const insets = useSafeAreaInsets();
  const [uriOutput, setUriOutput] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");

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

      await startRecordingWith1MinuteInterval();
    } catch (err) {
      console.log(err);
      setRecordingState("idle");
    }
  }

  async function stopRecording({ isEnding } = { isEnding: false }) {
    setRecordingState(isEnding ? "idle" : "paused");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (!currentRecording) return;
    currentRecording.pauseAsync;
    await currentRecording.stopAndUnloadAsync();
    const uri = currentRecording.getURI();
    if (uri) recordings.push(uri);
    currentRecording = null;

    // TODO: concat and compress audio files
    setUriOutput(recordings[0]);
  }

  async function startRecordingWith1MinuteInterval() {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY
      );
      currentRecording = recording;

      await new Promise((resolve) => setTimeout(resolve, RECORDING_INTERVAL));

      await Promise.race([
        new Promise((resolve) => setTimeout(resolve, RECORDING_INTERVAL_TOLERANCE)),
        (async () => {
          while (true) {
            const status = await recording.getStatusAsync();
            if (!status.isRecording) break;
            if (status.metering && status.metering < -40) {
              console.log("Metering is too low, stopping recording");
              break;
            } else console.log("Metering is", status.metering);
            await new Promise((resolve) => setTimeout(resolve, METERING_CHECK_INTERVAL));
          }
        })(),
      ]);

      const status = await recording.getStatusAsync();

      if (status.isRecording) {
        await recording.stopAndUnloadAsync();
        startRecordingWith1MinuteInterval();
        const uri = recording.getURI();
        if (uri) recordings.push(uri);
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  useEffect(() => {
    return () => {
      if (currentRecording) {
        currentRecording.stopAndUnloadAsync();
      }
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View>
        {recordingState !== "idle" && (
          <IconButton
            bg={Colors.Black[2]}
            icon={<CrossIcon />}
            onPress={() => {
              stopRecording({ isEnding: true });
              setUriOutput(null);
            }}
          />
        )}
      </View>

      <TouchableOpacity
        onPress={recordingState === "recording" ? () => stopRecording() : startRecording}
        activeOpacity={0.9}
      >
        <RecordingButton recordingState={recordingState} />
      </TouchableOpacity>
      <View>
        {recordingState !== "idle" && (
          <IconButton
            bg={Colors.Success[1]}
            icon={<Checkmark />}
            onPress={() => {
              stopRecording({ isEnding: true });
            }}
          />
        )}
      </View>
    </View>
  );
}

const RecordingTimer = ({ isRunning }: { isRunning: boolean }) => {
  const [seconds, setSeconds] = useState(0);

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
        {formatDuration(seconds)}
      </Text>
    </View>
  );
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;
  return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
};

const Player = ({ uri }: { uri: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function playSound() {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync({
      uri,
    });
    setSound(sound);

    console.log("Playing Sound");
    sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.isPlaying) {
        setIsPlaying(true);
      } else setIsPlaying(false);
    });
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity
        style={{
          padding: 6,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: isPlaying ? "gray" : "rgba(1, 178, 135, 1)",
        }}
        disabled={isPlaying}
        onPress={isPlaying ? undefined : playSound}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "500",
            textAlign: "center",
            flex: 1,
          }}
          numberOfLines={1}
        >
          {isPlaying ? "Playing..." : "Play"}
        </Text>
      </TouchableOpacity>
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
      {recordingState === "recording" ? <RecordingIcon /> : <RecordIcon />}

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
    padding: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
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
