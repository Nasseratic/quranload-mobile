import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import { RootStackParamList } from "navigation/navigation";
import { fetchStudentsList } from "services/teamService";
import { useQuery } from "@tanstack/react-query";
import { Card, Stack } from "tamagui";
import Typography from "components/Typography";
import GeneralConstants from "constants/GeneralConstants";
import { t } from "locales/config";
import { Colors } from "constants/Colors";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherStudentsList">;

export const TeacherStudentsListScreen: FunctionComponent<Props> = ({ route }) => {
  const { teamId } = route.params;
  const { data } = useQuery(["students-list"], () => fetchStudentsList({ teamId }));
  const students = data?.list ?? [];

  const percentageToColor = (percentage: number) => {
    if (percentage >= 80) return Colors.Success[1];
    if (percentage >= 60) return Colors.Warning[1];
    return Colors.Error[1];
  };

  return (
    <QuranLoadView
      appBar={{
        title: t("teacherStudentsListScreen.title"),
      }}
    >
      <Stack gap={GeneralConstants.Spacing.md}>
        {students.map((student) => (
          <Card
            key={student.id}
            paddingHorizontal={GeneralConstants.Spacing.md}
            paddingVertical={GeneralConstants.Spacing.sm}
            backgroundColor="$backgroundTransparent"
            borderColor="$gray5"
            borderWidth={1}
            borderRadius={GeneralConstants.BorderRadius.full}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap="$1.5"
          >
            <Typography type="Body" style={{ color: Colors.Primary[1] }}>
              {student.fullName}
            </Typography>
            <Typography
              type="Body"
              style={{ color: percentageToColor(student.percentageOfAcceptedOrSubmittedLessons) }}
            >
              {student.percentageOfAcceptedOrSubmittedLessons > 59 ? "+" : "-"}
              {` ${student.percentageOfAcceptedOrSubmittedLessons}%`}
            </Typography>
          </Card>
        ))}
      </Stack>
    </QuranLoadView>
  );
};
