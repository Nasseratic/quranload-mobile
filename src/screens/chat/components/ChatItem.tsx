import { Avatar, Card, Separator, Stack, Text, XStack, View, Square } from "tamagui";
import { Colors } from "constants/Colors";
import Typography from "components/Typography";
import ChevronRight from "components/icons/ChevronRight";

export const ChatItem = ({
  name,
  message,
  avatar,
  isMultiLine,
  onPress,
}: {
  name: string;
  message?: string;
  avatar?: string;
  isMultiLine?: boolean;
  onPress: () => void;
}) => {
  return (
    <>
      <Card pressStyle={{ opacity: 0.8 }} bg="white" p={4} onPress={onPress}>
        <XStack jc="space-between" ai="center" gap={10} px={6}>
          {avatar ? (
            <Avatar size={42}>
              <Avatar.Image br={8} source={{ uri: avatar }} />
              <Avatar.Fallback br={8} bc={Colors.Gray[1]} delayMs={600} />
            </Avatar>
          ) : (
            <Square w={42} h={42} br={8} bg="$gray8">
              <Text color="white" fontSize={16}>
                {name.split(" ").map((word) => word[0])}
              </Text>
            </Square>
          )}
          <Stack gap={2} flex={1} jc="center">
            <Typography type="BodyHeavy">{name}</Typography>
            {message != null && (
              <Typography
                type="BodyLight"
                style={{
                  color: Colors.Black[2],
                }}
                {...(isMultiLine ? {} : { numberOfLines: 1 })}
              >
                {message || "..."}
              </Typography>
            )}
          </Stack>
          <ChevronRight color={Colors.Black[1]} size={24} />
        </XStack>
      </Card>
      <Separator />
    </>
  );
};
