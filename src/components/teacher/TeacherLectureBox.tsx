import { EditIcon } from "assets/icons";
import { TeamItem } from "components/TeamItem";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import { Card, Circle, Separator, Stack, XStack } from "tamagui";
import { Team } from "types/User";
import { ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { dateNfsLocale, i18n, t } from "locales/config";
import { useQuery } from "@tanstack/react-query";
import { fetchAutoAssignment } from "services/assignmentService";
import { startOfWeek } from "date-fns";

interface Props {
  team: Team;
}

const TeacherLectureBox = ({ team }: Props) => {
  const navigation = useNavigation();

  const { data, isLoading } = useQuery(
    ["auto-assignment"],
    () => fetchAutoAssignment({ teamId: team.id, typeId: 1 }) // typeId 1 is the auto assignment
  );

  if (isLoading) return <ActivityIndicator size="small" style={{ marginTop: 40 }} />;

  const resolveDaysRefToHasHomeWorkArray = (days: number) => {
    // Weights: sun = 1; mon = 2; tue = 4; wed = 8; thu = 16; fri = 32; sat = 64;
    // Indexes: 0) mon, 1) tues, 2) wed, 3) thu, 4) fri, 5) sat, 6) sun
    const hasHomeWorkArray = new Array(7).fill(false) as boolean[];

    if (days >= 64) {
      // 5) sat
      days -= 64;
      hasHomeWorkArray[5] = true;
    }
    if (days >= 32) {
      // 4) fri
      days -= 32;
      hasHomeWorkArray[4] = true;
    }
    if (days >= 16) {
      // 3) thu
      days -= 16;
      hasHomeWorkArray[3] = true;
    }
    if (days >= 8) {
      // 2) wed
      days -= 8;
      hasHomeWorkArray[2] = true;
    }
    if (days >= 4) {
      // 1) tue
      days -= 4;
      hasHomeWorkArray[1] = true;
    }
    if (days >= 2) {
      // 0) mon
      days -= 2;
      hasHomeWorkArray[0] = true;
    }
    if (days == 1) {
      // 6) sun
      days -= 1;
      hasHomeWorkArray[6] = true;
    }
    return hasHomeWorkArray;
  };

  const hasHomeWorkArray = resolveDaysRefToHasHomeWorkArray(data?.list[0]?.days ?? 0);

  const weekDays = new Array(7).fill(0).map((_, index) => {
    const date = startOfWeek(new Date(), { locale: dateNfsLocale });
    date.setDate(date.getDate() + index);

    return {
      day: date.toLocaleString(i18n.locale, { weekday: "narrow" })[0],
      hasHomeWork: hasHomeWorkArray[index],
    };
  });

  return (
    <Card bg="white" borderWidth={1} borderColor="$gray5">
      <Stack
        p="$3"
        gap="$3"
        onPress={() =>
          navigation.navigate("TeacherAutoHomework", {
            assignmentId: data?.list[0]?.id || "",
            teamId: team.id,
            weekDays,
            pagesPerDay: data?.list[0]?.pagesPerDay || 0,
            startFromPage: data?.list[0]?.startFromPage || 0,
          })
        }
      >
        <XStack jc="space-between" ai="flex-start">
          <Stack>
            <Typography style={{ color: Colors.Primary[1] }}>
              {t("teacherAutoHW.pagesPerDay")}: {data?.list[0]?.pagesPerDay}
            </Typography>
            <Typography style={{ color: Colors.Primary[1] }}>
              {t("teacherAutoHW.nextHW")} 11-12
            </Typography>
          </Stack>

          <EditIcon color={Colors.Black[2]} />
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
        <TeamItem
          team={team}
          onPress={() => navigation.navigate("TeacherHomework", { teamId: team.id })}
        />
      </Stack>
    </Card>
  );
};

export default TeacherLectureBox;
