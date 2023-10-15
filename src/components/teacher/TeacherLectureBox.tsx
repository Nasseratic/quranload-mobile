import { EditIcon } from "assets/icons";
import { TeamItem } from "components/TeamItem";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import { Card, Circle, Separator, Stack, XStack } from "tamagui";
import { Team } from "types/User";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

interface Props {
  team: Team;
}

const TeacherLectureBox = ({ team }: Props) => {
  const navigation = useNavigation();
  const weekDays = new Array(7).fill(0).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      day: date.toLocaleString("default", { weekday: "long" })[0],
      hasHomeWork: Math.floor(Math.random() * 2),
    };
  });

  return (
    <TouchableOpacity onPress={() => navigation.navigate("TeacherHomework", { teamId: team.id })}>
      <Card bg="white" borderWidth={1} borderColor="$gray5">
        <Stack p="$3" gap="$3">
          <XStack jc="space-between" ai="flex-start">
            <Stack>
              <Typography style={{ color: Colors.Primary[1] }}>Pages:1</Typography>
              <Typography style={{ color: Colors.Primary[1] }}>
                Next homework: læs side 11-12
              </Typography>
            </Stack>
            <TouchableOpacity onPress={() => navigation.navigate("TeacherAutoHomework")}>
              <EditIcon color={Colors.Black[2]} />
            </TouchableOpacity>
          </XStack>
          <XStack gap="$2" jc="space-between">
            {weekDays.map((day, index) => (
              <Circle
                key={index}
                bw={2}
                size="$3.5"
                borderColor={day.hasHomeWork ? Colors.Success[1] : Colors.Black[3]}
              >
                <Typography
                  key={index}
                  type="SubHeaderHeavy"
                  style={{ color: day.hasHomeWork ? Colors.Primary[1] : Colors.Black[3] }}
                >
                  {day.day}
                </Typography>
              </Circle>
            ))}
          </XStack>
        </Stack>
        <Separator />
        <Stack p="$3">
          <TeamItem team={team} onPress={() => {}} />
        </Stack>
      </Card>
    </TouchableOpacity>
  );
};

export default TeacherLectureBox;
