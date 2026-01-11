import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Stack, Spinner, View } from "tamagui";
import { useMediaUrl } from "hooks/useMediaUrl";
import { PlayIcon } from "./icons/PlayIcon";
import { Colors } from "constants/Colors";

interface VideoPlayerProps {
  /** Direct video URL - use this for local files or already-resolved URLs */
  uri?: string;
  /** R2 media key - will be resolved to a signed URL automatically */
  mediaKey?: string;
  /** Width of the video thumbnail */
  width?: number;
  /** Height of the video thumbnail */
  height?: number;
  /** Border radius for the thumbnail */
  borderRadius?: number;
}

/**
 * Video component that shows a thumbnail and plays in fullscreen on tap.
 * Supports both direct URLs and R2 media keys.
 */
export const VideoPlayer = ({
  uri: directUri,
  mediaKey,
  width = 200,
  height = 200,
  borderRadius = 16,
}: VideoPlayerProps) => {
  const { url: resolvedUrl, isLoading: isResolvingUrl } = useMediaUrl(mediaKey);
  const videoSource = directUri || resolvedUrl || null;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);
  const fullscreenViewRef = useRef<VideoView>(null);

  // Thumbnail player - paused, just showing first frame
  const thumbnailPlayer = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.muted = true;
    player.pause();
  });

  // Fullscreen player - plays when modal opens
  const fullscreenPlayer = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.muted = false;
  });

  const handlePress = useCallback(() => {
    setIsFullscreen(true);
    // Start playing when fullscreen opens
    fullscreenPlayer.play();
  }, [fullscreenPlayer]);

  const handleCloseFullscreen = useCallback(() => {
    fullscreenPlayer.pause();
    fullscreenPlayer.currentTime = 0;
    setIsFullscreen(false);
  }, [fullscreenPlayer]);

  const handleThumbnailLoad = useCallback(() => {
    setIsThumbnailLoaded(true);
  }, []);

  const showSpinner = isResolvingUrl || !isThumbnailLoaded;

  if (!videoSource && !isResolvingUrl) {
    return null;
  }

  return (
    <>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8} disabled={!videoSource}>
        <Stack
          width={width}
          height={height}
          borderRadius={borderRadius}
          overflow="hidden"
          backgroundColor="$gray3"
        >
          {videoSource && (
            <VideoView
              player={thumbnailPlayer}
              style={styles.thumbnail}
              contentFit="cover"
              nativeControls={false}
              allowsFullscreen={false}
              onReadyForDisplay={handleThumbnailLoad}
            />
          )}
          {/* Play button overlay */}
          <View style={styles.playButtonOverlay}>
            <View style={styles.playButton}>
              <PlayIcon size={24} fill={Colors.White[1]} />
            </View>
          </View>
          {/* Loading spinner */}
          {showSpinner && (
            <Stack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              justifyContent="center"
              alignItems="center"
              backgroundColor="$gray3"
            >
              <Spinner size="small" />
            </Stack>
          )}
        </Stack>
      </TouchableOpacity>

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        animationType="fade"
        supportedOrientations={["portrait", "landscape"]}
        onRequestClose={handleCloseFullscreen}
      >
        <View style={styles.fullscreenContainer}>
          <VideoView
            ref={fullscreenViewRef}
            player={fullscreenPlayer}
            style={styles.fullscreenVideo}
            contentFit="contain"
            nativeControls={true}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
          />
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseFullscreen}>
            <View style={styles.closeButtonInner}>
              <CloseIcon />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const CloseIcon = () => (
  <View style={styles.closeIcon}>
    <View style={[styles.closeLine, { transform: [{ rotate: "45deg" }] }]} />
    <View style={[styles.closeLine, { transform: [{ rotate: "-45deg" }] }]} />
  </View>
);

const styles = StyleSheet.create({
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4, // Slight offset to center the play icon visually
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenVideo: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeLine: {
    position: "absolute",
    width: 16,
    height: 2,
    backgroundColor: "#fff",
  },
});

export default VideoPlayer;
