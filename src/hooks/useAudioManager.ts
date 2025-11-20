import { setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import { useEffect, useState } from "react";

let activeSound: AudioPlayer | null = null;

const audioListeners = new Set<() => void>();

export const useAudioManager = (initialSound?: AudioPlayer | null) => {
  const [sound, setSound] = useState<AudioPlayer | null | undefined>(initialSound);

  const playSound = async () => {
    if (activeSound != null && activeSound !== sound) {
      activeSound.pause();
    }
    if (sound) {
      audioListeners.forEach((listener) => listener());
      await setAudioModeAsync({
        allowsRecording: false,
      });
      activeSound = sound;
      sound.play();
    }
  };

  const pauseSound = () => {
    if (activeSound === sound) {
      activeSound = null;
    }
    sound?.pause();
  };

  useEffect(() => {
    return () => {
      if (activeSound === sound) {
        activeSound = null;
      }
      sound?.release();
    };
  }, [sound]);

  return {
    playSound,
    pauseSound,
    sound: sound as Omit<AudioPlayer, "play" | "pause">,
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
