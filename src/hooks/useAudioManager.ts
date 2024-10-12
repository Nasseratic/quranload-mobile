import { Audio } from "expo-av";
import { useEffect, useState } from "react";

let activeSound: Audio.Sound | null = null;

const audioListeners = new Set<() => void>();

export const useAudioManager = (initialSound?: Audio.Sound | null) => {
  const [sound, setSound] = useState<Audio.Sound | null | undefined>(initialSound);

  const playSound = async () => {
    if (activeSound != null && activeSound !== sound) {
      await activeSound.pauseAsync();
    }
    if (sound) {
      audioListeners.forEach((listener) => listener());
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

export const useOnAudioPlayCallback = (onPlay: () => void) => {
  useEffect(() => {
    audioListeners.add(onPlay);
    return () => {
      audioListeners.delete(onPlay);
    };
  }, [onPlay]);
};
