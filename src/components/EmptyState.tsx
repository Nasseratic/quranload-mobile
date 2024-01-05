import { PropsWithChildren } from "react";
import LottieView from "lottie-react-native";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import EmptyFolderLottie from "assets/lottie/empty.json";
import { Stack } from "tamagui";

export const EmptyState = ({
  title,
  description,
  children,
}: PropsWithChildren<{
  title: string;
  description: string;
}>) => (
  <Stack ai="center" gap="$2">
    <LottieView
      source={EmptyFolderLottie}
      autoPlay
      loop={false}
      style={{ width: 300, height: 300, alignSelf: "center" }}
    />
    <Typography type="SubHeaderHeavy">{title}</Typography>
    <Typography
      type="CaptionLight"
      style={{ width: "85%", textAlign: "center", color: Colors.Black[2] }}
    >
      {description}
    </Typography>
    {children}
  </Stack>
);
