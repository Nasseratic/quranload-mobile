import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useCallback, useRef } from "react";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from "expo-audio";
import Typography from "./Typography";
import { AnimatedText } from "./AnimatedText";
import Slider from "./Slider";
import { PlayIcon } from "./icons/PlayIcon";
import { RecordingPauseIcon } from "./icons/RecordingPauseIcon";
import { Colors } from "constants/Colors";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { useOnAudioPlayCallback } from "hooks/useAudioManager";
import { useMediaUrl } from "hooks/useMediaUrl";

interface AudioPlayerProps {
  /** Direct audio URL - use this for local files or already-resolved URLs */
  uri?: string;
  /** R2 media key - will be resolved to a signed URL automatically */
  mediaKey?: string;
  isVisible?: boolean;
  isCompact?: boolean;
  width?: number;
}

const COLLAPSED_HEIGHT = 54;
const EXPANDED_HEIGHT = 70;
const PADDING = 16;
const ICON_WIDTH = 36;
const DEFAULT_WIDTH = SCREEN_WIDTH;
const ADJUSTMENT = 11;

export function AudioPlayer({
  uri: directUri,
  mediaKey,
  isVisible = true,
  isCompact = false,
  width = DEFAULT_WIDTH,
}: AudioPlayerProps) {
  // Resolve mediaKey to URL if provided, otherwise use direct URI
  const { url: resolvedUrl, isLoading: isResolvingUrl } = useMediaUrl(mediaKey);
  const audioSource = directUri || resolvedUrl || null;

  const EXPANDED_SLIDER_WIDTH = width - 2 * PADDING - ADJUSTMENT;
  const SLIDER_WIDTH = EXPANDED_SLIDER_WIDTH - 2 * ICON_WIDTH + ADJUSTMENT;

  // Track if audio mode has been set
  const audioModeSetRef = useRef(false);

  // Create audio player - will be null until we have a valid URL
  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);

  // Convert duration and currentTime from seconds to milliseconds
  const durationMs = (status.duration || 0) * 1000;
  const currentTimeMs = (status.currentTime || 0) * 1000;

  // Shared values for UI animations
  const value = useSharedValue(0);
  const pressed = useSharedValue(false);
  const scrubbing = useSharedValue(false);
  const expanded = useSharedValue(false);
  const lastValueOnPress = useSharedValue(0);
  const playing = useSharedValue(false);
  const previousPlaying = useSharedValue(false);

  // Ref to track if we're currently seeking
  const isSeekingRef = useRef(false);

  // Wrapper functions for player methods (needed for runOnJS)
  const pausePlayer = useCallback(() => {
    player.pause();
  }, [player]);

  const playPlayer = useCallback(async () => {
    // Ensure audio mode is set before playing
    if (!audioModeSetRef.current) {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      audioModeSetRef.current = true;
    }
    player.play();
  }, [player]);

  // Pause this player when another audio starts playing
  useOnAudioPlayCallback(
    useCallback(() => {
      if (status.playing) {
        player.pause();
      }
    }, [player, status.playing])
  );

  // Sync playing state with actual player status
  useEffect(() => {
    if (!isSeekingRef.current) {
      playing.value = status.playing;
    }
  }, [status.playing, playing]);

  // Sync slider value with audio position when not scrubbing
  useEffect(() => {
    if (!scrubbing.value && !pressed.value && !isSeekingRef.current && durationMs > 0) {
      value.value = currentTimeMs;
    }
  }, [currentTimeMs, scrubbing, pressed, value, durationMs]);

  // Pause when component becomes invisible
  useEffect(() => {
    if (!isVisible && status.playing) {
      player.pause();
    }
  }, [isVisible, status.playing, player]);

  // Resume playback after seeking
  const resumeAfterSeek = useCallback(
    (shouldPlay: boolean, positionMs: number) => {
      const duration = status.duration || 0;
      const positionSec = Math.max(0, Math.min(positionMs / 1000, duration));
      isSeekingRef.current = true;
      player.seekTo(positionSec);
      setTimeout(() => {
        isSeekingRef.current = false;
        if (shouldPlay) {
          playPlayer();
        }
      }, 100);
    },
    [player, status.duration, playPlayer]
  );

  const valueToTime = useDerivedValue(() => {
    const totalMilliseconds = value.value;
    const minutes = Math.floor(
      (totalMilliseconds % (60 * 60 * 1000)) / (60 * 1000)
    );
    const seconds = Math.floor((totalMilliseconds % (60 * 1000)) / 1000);
    const milliseconds = totalMilliseconds % 1000;

    const minStr = minutes.toString().padStart(2, "0");
    const secStr = seconds.toString().padStart(2, "0");
    const msStr = `.${Math.floor(milliseconds / 10)
      .toString()
      .padStart(2, "0")}`;

    return `${minStr}:${secStr}${msStr}`;
  }, [value]);

  const remainingTime = useDerivedValue(() => {
    const remainingMilliseconds = Math.max(0, durationMs - value.value);
    const minutes = Math.floor(remainingMilliseconds / (60 * 1000));
    const seconds = Math.floor((remainingMilliseconds % (60 * 1000)) / 1000);

    const minStr = minutes.toString().padStart(2, "0");
    const secStr = seconds.toString().padStart(2, "0");

    return `-${minStr}:${secStr}`;
  }, [value, durationMs]);

  // Handle user interaction with slider
  useAnimatedReaction(
    () => ({ pressed: pressed.value, scrubbing: scrubbing.value }),
    ({ pressed: p, scrubbing: s }, prev) => {
      // Handle pressed changes
      if (prev && p !== prev.pressed) {
        if (p) {
          // User started pressing - expand and pause
          expanded.value = true;
          lastValueOnPress.value = value.value;
          previousPlaying.value = playing.value;
          if (playing.value) {
            runOnJS(pausePlayer)();
          }
          playing.value = false;
        } else {
          // User stopped pressing
          if (
            value.value === 0 ||
            value.value >= durationMs ||
            value.value === lastValueOnPress.value
          ) {
            expanded.value = false;
          }
        }
      }
      // Handle scrubbing end - seek to new position and optionally resume
      if (prev && prev.scrubbing && !s) {
        runOnJS(resumeAfterSeek)(previousPlaying.value, value.value);
        if (!p && value.value !== 0 && value.value < durationMs) {
          expanded.value = false;
        }
      }
    }
  );

  // Collapse when reaching boundaries
  useAnimatedReaction(
    () => value.value,
    (v) => {
      if (pressed.value) return;
      if (v === 0 || v >= durationMs) {
        expanded.value = false;
      }
    }
  );

  const controlAnimatedStyle = useAnimatedStyle(() => {
    const isExpanded = expanded.value;

    return {
      height: withSpring(isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT),
    };
  });

  const sliderAnimatedStyle = useAnimatedStyle(() => {
    const isExpanded = expanded.value;
    return {
      width: withSpring(isExpanded ? EXPANDED_SLIDER_WIDTH : SLIDER_WIDTH),
      transform: [
        {
          translateY: withSpring(isExpanded ? ADJUSTMENT : 0),
        },
      ],
    };
  });

  const topAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withSpring(expanded.value ? -ADJUSTMENT : 0),
        },
      ],
    };
  });

  const getOpacityStyle = (value: boolean, delay: number = 0, config = {}) => {
    "worklet";
    return {
      opacity: withDelay(
        delay,
        withTiming(value ? 1 : 0, {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          ...config,
        })
      ),
    };
  };

  const buttonsAnimatedStyle = useAnimatedStyle(() => {
    return {
      pointerEvents: expanded.value ? "none" : "auto",
      ...getOpacityStyle(!expanded.value),
    };
  });

  const timeAnimatedStyle = useAnimatedStyle(() =>
    getOpacityStyle(expanded.value, expanded.value ? 120 : 0, {})
  );

  const playAnimatedStyle = useAnimatedStyle(() =>
    getOpacityStyle(!playing.value, pressed.value ? 500 : 0, { duration: 0 })
  );

  const pauseAnimatedStyle = useAnimatedStyle(() =>
    getOpacityStyle(playing.value, pressed.value ? 500 : 0, { duration: 0 })
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      player.pause();
    };
  }, [player]);

  const onPausePress = useCallback(async () => {
    // Don't try to play if audio isn't loaded yet
    if (!status.isLoaded) {
      return;
    }

    if (status.playing) {
      player.pause();
      // Optimistic UI update
      playing.value = false;
    } else {
      // Ensure audio mode is set before playing
      if (!audioModeSetRef.current) {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
        audioModeSetRef.current = true;
      }

      // If at the end, restart from beginning
      if (status.currentTime >= (status.duration || 0) - 0.1) {
        player.seekTo(0);
      }
      player.play();
      // Optimistic UI update
      playing.value = true;
    }
  }, [player, status.playing, status.currentTime, status.duration, status.isLoaded, playing]);

  // Show loading state while resolving URL or loading audio
  const isLoading = isResolvingUrl || (!status.isLoaded && audioSource !== null);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { width },
        controlAnimatedStyle,
      ]}
    >
      <Animated.View
        style={[
          styles.buttons,
          styles.timeContainer,
          timeAnimatedStyle,
          topAnimatedStyle,
        ]}
      >
        <Typography>
          <AnimatedText text={valueToTime} style={styles.time} />
        </Typography>
        <Typography>
          <AnimatedText
            text={remainingTime}
            style={[
              styles.time,
              {
                textAlign: "right",
              },
            ]}
          />
        </Typography>
      </Animated.View>
      <Animated.View
        style={[styles.buttons, buttonsAnimatedStyle, topAnimatedStyle]}
      >
        <TouchableOpacity
          onPress={onPausePress}
          style={styles.toggleButton}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.Black[1]} />
          ) : (
            <>
              <Animated.View style={[styles.toggleIcon, pauseAnimatedStyle]}>
                <RecordingPauseIcon size={26} fill={Colors.Black[1]} />
              </Animated.View>
              <Animated.View style={[styles.toggleIcon, playAnimatedStyle]}>
                <PlayIcon size={22} fill={Colors.Black[1]} />
              </Animated.View>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={[styles.slider, sliderAnimatedStyle]}>
        <Slider
          value={value}
          max={durationMs || 1}
          trackColor="#00000050"
          thumbColor="#000000"
          pressed={pressed}
          scrubbing={scrubbing}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    borderCurve: "continuous",
    justifyContent: "center",
    alignItems: "center",
  },
  slider: {},
  buttons: {
    position: "absolute",
    right: PADDING,
    left: PADDING,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: ICON_WIDTH,
  },
  timeContainer: {
    paddingHorizontal: 6,
    pointerEvents: "none",
  },
  time: {
    fontVariant: ["tabular-nums"],
    fontSize: 13.5,
    maxWidth: 70,
    color: Colors.Black[1],
  },
  toggleButton: {
    justifyContent: "center",
    alignItems: "center",
    width: ICON_WIDTH - 6,
  },
  toggleIcon: {
    position: "absolute",
  },
});

export default AudioPlayer;
