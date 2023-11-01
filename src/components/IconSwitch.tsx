import { Colors } from "constants/Colors";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Circle, Stack, XStack, styled } from "tamagui";

const SwitchContainer = styled(Stack, {
  height: 32,
  borderRadius: 36,
  borderColor: Colors["Success"][1],
  borderWidth: 1,
  jc: "center",
  position: "relative",
});

const SwitchCircle = styled(Circle, {
  width: 34,
  height: 26,
  backgroundColor: Colors["Success"][1],
});

export const IconSwitch = ({
  value,
  onChange,
  offIcon,
  onIcon,
  invertIcons = false,
}: {
  value: boolean;
  onChange: (change: boolean) => void;
  offIcon: (val: boolean) => React.ReactNode;
  onIcon: (val: boolean) => React.ReactNode;
  invertIcons?: boolean;
}) => {
  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(value ? 35 : 3, {
          mass: 0.7,
        }),
      },
    ],
  }));

  return (
    <SwitchContainer
      onPress={() => {
        onChange(!value);
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
          },
          circleAnimatedStyle,
        ]}
      >
        <SwitchCircle />
      </Animated.View>
      <XStack jc="center" ai="center" gap={12} px={8}>
        {invertIcons ? onIcon(!value) : offIcon(value)}
        <Stack pr={2}>{invertIcons ? offIcon(!value) : onIcon(value)}</Stack>
      </XStack>
    </SwitchContainer>
  );
};
