import { useState } from "react";
import { ImageProps, Spinner, Stack, Image } from "tamagui";

// ImageWithAuth component for displaying images
// With Convex storage, images are served via signed URLs and don't need auth headers
export const ImageWithAuth = (props: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Stack f={1}>
      <Image {...props} onLoad={() => setIsLoaded(true)} />
      {isLoaded ? null : (
        <Stack w="100%" h="100%" position="absolute" justifyContent="center" alignItems="center">
          <Spinner size="small" />
        </Stack>
      )}
    </Stack>
  );
};
