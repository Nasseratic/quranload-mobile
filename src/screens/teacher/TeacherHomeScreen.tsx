import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import { useAuth } from "contexts/auth";
import UserHeader from "components/UserHeader";
import TeacherLectureBox from "components/teacher/TeacherLectureBox";
import { Stack, XStack } from "tamagui";
import StatsBox from "components/StatsBox";
import { BookIcon, ClockIcon } from "assets/icons";
import { Colors } from "constants/Colors";
import { t } from "locales/config";
import { fetchTeacherStats } from "services/teacherService";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator } from "react-native";
import { RootStackParamList } from "navigation/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherHome">;

export const TeacherHomeScreen: FunctionComponent<Props> = () => {
  const { user } = useAuth();

  return (
    <QuranLoadView>
      <UserHeader />
      {user?.teams.map((team, index) => (
        <Stack gap="$4" key={index}>
          <TeacherLectureBox key={index} team={team} />
          <StatusSection teamId={team.id} />
        </Stack>
      ))}
    </QuranLoadView>
  );
};

const StatusSection = ({ teamId }: { teamId: string }) => {
  const { data, isLoading } = useQuery(["teacher-stats"], () => fetchTeacherStats({ teamId }));
  if (isLoading) return <ActivityIndicator size="small" style={{ marginTop: 40 }} />;

  return (
    <XStack gap="$3">
      <StatsBox
        icon={<ClockIcon width={40} height={40} color={Colors.Warning[5]} />}
        label={t("teacherHomeScreen.submitted")}
        value={data?.totalSubmissions.toString() ?? ""}
        backgroundColor={Colors.Primary[1]}
      />
      <StatsBox
        icon={<BookIcon width={40} height={40} color={Colors.Success[5]} />}
        label={t("teacherHomeScreen.pagesRead")}
        value={data?.totalApprovedPages.toString() ?? ""}
        backgroundColor={Colors.Success[1]}
      />
    </XStack>
  );
};
