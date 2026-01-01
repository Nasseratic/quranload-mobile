import { useAuth } from "contexts/auth";
import { useRef, useState } from "react";
import { ImageURISource } from "react-native";
import { ImageViewer, ImageViewerRef, ImageWrapper } from "react-native-reanimated-viewer";
import { ImageProps, Spinner, Stack, Image } from "tamagui";
import { useMediaUrl } from "hooks/useMediaUrl";

export const ImageWithAuth = (props: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const { accessToken } = useAuth();
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  return (
    <Stack f={1}>
      <Image
        {...props}
        source={isImageURISource(props.source) ? { uri: props.source.uri, headers } : props.source}
        onLoad={() => setIsLoaded(true)}
      />
      {isLoaded ? null : (
        <Stack w="100%" h="100%" position="absolute" justifyContent="center" alignItems="center">
          <Spinner size="small" />
        </Stack>
      )}
    </Stack>
  );
};

const isImageURISource = (source: unknown): source is ImageURISource => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  return (source as any).uri !== undefined;
};

type MediaImageProps = Omit<ImageProps, "source"> & {
  mediaKey: string | undefined | null;
  /** Enable tap to open full-screen image viewer */
  viewerEnabled?: boolean;
};

/**
 * Image component that resolves R2 media keys to signed URLs lazily.
 * Shows a loading spinner while the URL is being resolved.
 * Optionally supports tap-to-view in a full-screen image viewer.
 */
export const MediaImage = ({ mediaKey, viewerEnabled = false, ...imageProps }: MediaImageProps) => {
  const { url, isLoading } = useMediaUrl(mediaKey);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageViewerRef = useRef<ImageViewerRef>(null);

  const showSpinner = isLoading || (url && !isImageLoaded);

  if (!mediaKey) {
    return null;
  }

  const imageElement = (
    <Image
      {...imageProps}
      source={{ uri: url ?? undefined }}
      onLoad={() => setIsImageLoaded(true)}
    />
  );

  return (
    <Stack>
      {url && (
        viewerEnabled ? (
          <>
            <ImageWrapper
              viewerRef={imageViewerRef}
              index={0}
              source={{ uri: url }}
            >
              {imageElement}
            </ImageWrapper>
            <ImageViewer
              ref={imageViewerRef}
              data={[{ key: url, source: { uri: url } }]}
            />
          </>
        ) : (
          imageElement
        )
      )}
      {showSpinner && (
        <Stack
          {...imageProps}
          position={url ? "absolute" : "relative"}
          justifyContent="center"
          alignItems="center"
          backgroundColor="$gray3"
        >
          <Spinner size="small" />
        </Stack>
      )}
    </Stack>
  );
};
