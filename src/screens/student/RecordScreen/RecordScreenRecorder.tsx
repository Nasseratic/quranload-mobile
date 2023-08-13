import { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Audio } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RecordIcon } from "components/icons/RecordIcon";
import { RecordingIcon } from "components/icons/RecordingIcon";
import * as Linking from "expo-linking";

let currentRecording: Audio.Recording | null = null;

const recordings: string[] = [];
const RECORDING_INTERVAL = 60 * 1000 * 2;
const RECORDING_INTERVAL_TOLERANCE = 10 * 1000;
const METERING_CHECK_INTERVAL = 300;

export function RecordScreenRecorder() {
  const insets = useSafeAreaInsets();
  const [uriOutput, setUriOutput] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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
      setIsRecording(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      await startRecordingWith1MinuteInterval();
    } catch (err) {
      console.log(err);
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    if (!currentRecording) return;
    await currentRecording.stopAndUnloadAsync();
    const uri = currentRecording.getURI();
    if (uri) recordings.push(uri);
    currentRecording = null;
    setIsRecording(false);

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

  if (isSubmitted && uriOutput)
    return (
      <View
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            setIsSubmitted(false);
            setUriOutput(null);
          }}
          style={{
            padding: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
            // danger
            backgroundColor: "rgba(229, 80, 90, 1)",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#fff" }}>Delete</Text>
        </TouchableOpacity>
        <Player uri={uriOutput} />
      </View>
    );

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        {(isRecording || uriOutput) && (
          <TouchableOpacity
            style={{
              padding: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: "rgba(1, 178, 135, 1)",
            }}
            onPress={() => setIsSubmitted(true)}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}>Submit</Text>
          </TouchableOpacity>
        )}
        <RecordingTimer isRunning={isRecording} />
      </View>
      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        style={styles.recordButton}
        activeOpacity={0.9}
      >
        {isRecording ? <RecordingIcon /> : <RecordIcon />}
      </TouchableOpacity>
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
          width: 6,
          height: 6,
          borderRadius: 6,
          backgroundColor: "#E5505A",
        }}
      />
      <Text style={{ fontSize: 14, fontWeight: "600" }} adjustsFontSizeToFit>
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

const styles = StyleSheet.create({
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
  recordButton: {
    width: 50,
    height: 50,
    backgroundColor: "#E5505A",
    borderRadius: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingTimerContainer: {
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(194, 201, 209, 1)",
    width: 58,
    height: 24,
    borderRadius: 8,
  },
});

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
          }}
        >
          {isPlaying ? "Playing..." : "Play"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
