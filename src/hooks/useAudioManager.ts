import { setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import { useEffect, useState } from "react";

let activeSound: AudioPlayer | null = null;

const audioListeners = new Set<() => void>();

/**
 * Safely call a method on an audio player, catching errors that occur
 * when the native player object has been deallocated.
 */
const safePlayerCall = <T>(fn: () => T): T | undefined => {
  try {
    return fn();
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("NativeSharedObjectNotFoundException") ||
        error.message.includes("native shared object") ||
        error.message.includes("FunctionCallException"))
    ) {
      return undefined;
    }
    throw error;
  }
};

export const useAudioManager = (initialSound?: AudioPlayer | null) => {
  const [sound, setSound] = useState<AudioPlayer | null | undefined>(initialSound);

  const playSound = async () => {
    if (activeSound != null && activeSound !== sound) {
      safePlayerCall(() => activeSound?.pause());
    }
    if (sound) {
      audioListeners.forEach((listener) => listener());
      await setAudioModeAsync({
        allowsRecording: false,
      });
      activeSound = sound;
      safePlayerCall(() => sound.play());
    }
  };

  const pauseSound = () => {
    if (activeSound === sound) {
      activeSound = null;
    }
    safePlayerCall(() => sound?.pause());
  };

  useEffect(() => {
    return () => {
      if (activeSound === sound) {
        activeSound = null;
      }
      safePlayerCall(() => sound?.release());
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
