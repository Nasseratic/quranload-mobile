import { LinkPreview, PreviewData } from "@flyerhq/react-native-link-preview";
import { Colors } from "constants/Colors";
import * as Linking from "expo-linking";
import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { Image, Stack, Text } from "tamagui";

interface ChatLinkPreviewProps {
  text: string;
  isCurrentUser: boolean;
}

// URL regex pattern to detect links in text
const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

/**
 * Extracts the first URL from a text string
 */
export const extractFirstUrl = (text: string): string | null => {
  const matches = text.match(URL_REGEX);
  return matches?.[0] ?? null;
};

/**
 * A component that renders a link preview card for URLs in chat messages
 */
export const ChatLinkPreview = ({ text, isCurrentUser }: ChatLinkPreviewProps) => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const url = extractFirstUrl(text);

  const handlePreviewDataFetched = useCallback((data: PreviewData) => {
    setPreviewData(data);
  }, []);

  const handlePress = useCallback(() => {
    if (url) {
      Linking.openURL(url);
    }
  }, [url]);

  if (!url) {
    return null;
  }

  const backgroundColor = isCurrentUser ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.05)";
  const textColor = isCurrentUser ? Colors.White[1] : Colors.Black[1];
  const descriptionColor = isCurrentUser ? Colors.White[2] : Colors.Black[2];

  return (
    <LinkPreview
      text={url}
      onPreviewDataFetched={handlePreviewDataFetched}
      renderLinkPreview={({ previewData: data }) => {
        if (!data?.title && !data?.description && !data?.image) {
          return null;
        }

        return (
          <Stack
            backgroundColor={backgroundColor}
            borderRadius={8}
            marginTop={8}
            marginHorizontal={4}
            overflow="hidden"
            pressStyle={{ opacity: 0.8 }}
            onPress={handlePress}
          >
            {data?.image?.url && (
              <Image
                source={{ uri: data.image.url }}
                width="100%"
                height={120}
                resizeMode="cover"
              />
            )}
            <Stack padding={10} gap={4}>
              {data?.title && (
                <Text
                  color={textColor}
                  fontWeight="600"
                  fontSize={14}
                  numberOfLines={2}
                >
                  {data.title}
                </Text>
              )}
              {data?.description && (
                <Text
                  color={descriptionColor}
                  fontSize={12}
                  numberOfLines={3}
                >
                  {data.description}
                </Text>
              )}
              <Text
                color={Colors.Primary[4]}
                fontSize={11}
                numberOfLines={1}
              >
                {new URL(url).hostname}
              </Text>
            </Stack>
          </Stack>
        );
      }}
    />
  );
};
