import { useAuth } from "contexts/auth";
import { useState } from "react";
import { ImageURISource } from "react-native";
import { ImageProps, Spinner, Stack, Image } from "tamagui";

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
