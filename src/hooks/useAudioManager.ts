import { Audio } from "expo-av";
import { useEffect, useState } from "react";

let activeSound: Audio.Sound | null = null;

export const useAudioManager = (initialSound?: Audio.Sound | null) => {
  const [sound, setSound] = useState<Audio.Sound | null | undefined>(initialSound);

  const playSound = async () => {
    if (activeSound != null && activeSound !== sound) {
      await activeSound.pauseAsync();
    }
    if (sound) {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      activeSound = sound;
      await sound.playAsync();
    }
  };

  const pauseSound = async () => {
    if (activeSound === sound) {
      activeSound = null;
    }
    sound?.pauseAsync();
  };

  useEffect(() => {
    return () => {
      if (activeSound === sound) {
        activeSound = null;
      }
      sound?.unloadAsync();
    };
  }, [sound]);

  return {
    playSound,
    pauseSound,
    sound: sound as Omit<Audio.Sound, "playAsync" | "pauseAsync">,
    setSound,
  };
};
