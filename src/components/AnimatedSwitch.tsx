import { Colors } from "constants/Colors";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Circle, Stack, XStack, styled } from "tamagui";
import { BookIcon } from "components/icons/BookIcon";
import { SpeakerIcon } from "components/icons/SpeakerIcon";

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

export const Switch = ({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (change: boolean) => void;
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
        <BookIcon size={24} color={value ? Colors.Gray[1] : Colors.White[1]} />
        <Stack pr={2}>
          <SpeakerIcon size={18} color={value ? Colors.White[1] : Colors.Gray[1]} />
        </Stack>
      </XStack>
    </SwitchContainer>
  );
};
