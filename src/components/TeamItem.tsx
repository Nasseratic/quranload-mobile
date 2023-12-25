import { Text } from "tamagui";
import { XStack, Avatar, YStack } from "tamagui";
import { Team } from "types/User";
import Typography from "./Typography";
import { Colors } from "constants/Colors";

export const TeamItem = ({ team }: { team: Team }) => (
  <XStack gap="$4">
    <Avatar circular size="$5">
      {team.organizationLogo.includes("http") && <Avatar.Image src={team.organizationLogo} />}
      <Avatar.Fallback bc="$gray5" jc="center" ai="center">
        <Text fontWeight="bold">{team.organizationName[0]}</Text>
      </Avatar.Fallback>
    </Avatar>

    <YStack jc="center">
      <Typography type="SubHeaderHeavy">{team.name}</Typography>
      <Typography
        type="CaptionLight"
        style={{
          color: Colors.Black[2],
        }}
      >
        {team.organizationName}
      </Typography>
    </YStack>
  </XStack>
);
