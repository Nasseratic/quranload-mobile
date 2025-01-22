import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Typography from "./Typography";
import { Stack } from "tamagui";
import { Colors } from "constants/Colors";
import { IS_ANDROID, SCREEN_WIDTH } from "constants/GeneralConstants";
import { XStack } from "tamagui";
import { CrossIcon } from "./icons/CrossIcon";
import { TouchableOpacity } from "react-native";
import { t } from "locales/config";
import { Sentry } from "utils/sentry";

type StatusNotificationParams = {
  title: string;
  subTitle?: string;
  status: "Success" | "Error" | "Warning";
  duration?: number;
};

export const toast = {
  show: () => {},
  reportError: (err) => {
    toast.show({
      status: "Error",
      subTitle: `id: ${Sentry.captureException(err)}`,
      title: t("defaultError"),
    });
  },
} as {
  show: (params: StatusNotificationParams) => void;
  reportError: (error: unknown) => void;
};

let currentTimeout: NodeJS.Timeout | null = null;

export const RootToastContainer = () => {
  const { bottom } = useSafeAreaInsets();
  const [currentParams, setCurrentParams] = useState<StatusNotificationParams | null>(null);
  const progress = useSharedValue(200);

  const hide = () => {
    progress.value = withTiming(200, { duration: 300 }, () => {
      runOnJS(setCurrentParams)(null);
    });
  };
  useEffect(() => {
    toast.show = (params: StatusNotificationParams) => {
      setCurrentParams(params);
      progress.value = withTiming(-bottom);
      if (currentTimeout) clearTimeout(currentTimeout);
      currentTimeout = setTimeout(hide, params.duration ?? 4500);
    };
  }, [bottom]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: progress.value,
        },
      ],
    }),
    [progress]
  );

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: SCREEN_WIDTH,
        zIndex: 1000,
      }}
    >
      <Animated.View style={animatedStyle}>
        {currentParams && (
          <Stack
            bg={Colors[currentParams.status][1]}
            p="$4"
            borderRadius="$4"
            mx={16}
            my={IS_ANDROID ? 16 : 4}
          >
            <XStack jc="space-between" ai="flex-start" gap={8}>
              <Stack jc="center" h="100%" fs={1}>
                <Typography type="BodyHeavy" style={{ color: "white" }}>
                  {currentParams.title}
                </Typography>
                {currentParams.subTitle && (
                  <Typography type="BodyLight" style={{ color: "white" }}>
                    {currentParams.subTitle}
                  </Typography>
                )}
              </Stack>
              <TouchableOpacity activeOpacity={0.7} onPress={hide}>
                <CrossIcon color="white" width={20} />
              </TouchableOpacity>
            </XStack>
          </Stack>
        )}
      </Animated.View>
    </Animated.View>
  );
};
