import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
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
import { ActivityIndicator, FlatList } from "react-native";
import { RootStackParamList } from "navigation/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import NoClasses from "components/NoClasses";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherHome">;

export const TeacherHomeScreen: FunctionComponent<Props> = () => {
  const { user } = useAuth();
  return (
    <SafeAreaView style={{ paddingHorizontal: 16, flex: 1 }}>
      <UserHeader />
      <FlatList
        data={user?.teams}
        keyExtractor={(team) => team.id}
        ListEmptyComponent={() => <NoClasses role="teacher" />}
        contentContainerStyle={{
          gap: 16,
          paddingTop: user?.teams?.length && 12,
          paddingBottom: user?.teams?.length && 16,
        }}
        renderItem={({ item }) => (
          <Stack gap="$4">
            <TeacherLectureBox team={item} />
            <StatusSection teamId={item.id} />
          </Stack>
        )}
      />
    </SafeAreaView>
  );
};

const StatusSection = ({ teamId }: { teamId: string }) => {
  const { data, isLoading } = useQuery(["teacher-stats", teamId], () =>
    fetchTeacherStats({ teamId })
  );
  if (isLoading) return <ActivityIndicator size="small" style={{ marginTop: 40 }} />;

  return (
    <XStack gap="$3">
      <StatsBox
        icon={<ClockIcon width={40} height={40} color={Colors.Warning[5]} />}
        label={t("teacherHomeScreen.submitted")}
        value={`${data?.totalSubmissions ?? 0}`}
        backgroundColor={Colors.Primary[1]}
      />
      <StatsBox
        icon={<BookIcon width={40} height={40} color={Colors.Success[5]} />}
        label={t("teacherHomeScreen.pagesRead")}
        value={`${data?.totalApprovedPages ?? 0}`}
        backgroundColor={Colors.Success[1]}
      />
    </XStack>
  );
};
