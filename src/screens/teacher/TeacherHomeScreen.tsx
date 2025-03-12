import { FunctionComponent, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth, useUser } from "contexts/auth";
import UserHeader from "components/UserHeader";
import TeacherLectureBox from "components/teacher/TeacherLectureBox";
import { Stack, XStack, Button, Separator, Square } from "tamagui";
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
import Typography from "components/Typography";
import FeedbackCard from "components/FeedbackCard";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherHome">;

export const TeacherHomeScreen: FunctionComponent<Props> = () => {
  const user = useUser();

  const [isShowingInactive, setIsShowingInactive] = useState(false);
  const teams = user.teams.filter((team) => isShowingInactive || team.isActive);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <UserHeader />

      <FlatList
        data={teams}
        keyExtractor={(team) => team.id}
        ListEmptyComponent={user.teams.length === 0 ? <NoClasses role="teacher" /> : undefined}
        contentContainerStyle={{
          gap: 16,
          paddingTop: user?.teams?.length && 12,
          paddingBottom: user?.teams?.length && 16,
          paddingHorizontal: 16,
        }}
        renderItem={({ item }) => (
          <Stack gap="$4">
            <TeacherLectureBox team={item} />
            <StatusSection teamId={item.id} />
          </Stack>
        )}
        ListHeaderComponent={
          <>
            <FeedbackCard />
            {teams.length === 0 && user.teams.length !== 0 ? (
              <Square gap="$4" borderRadius={8}>
                {/* TODO: Add enroll? */}
                <Typography type="BodyLight">{t("noActiveTeams")}</Typography>
                <Separator w="100%" bg="$accentBackground" />
              </Square>
            ) : undefined}
          </>
        }
        ListFooterComponent={
          user.teams.length != teams.length || isShowingInactive ? (
            <Button
              alignSelf="center"
              size="$3"
              onPress={() => setIsShowingInactive(!isShowingInactive)}
            >
              <Typography type="SmallHeavy">
                {isShowingInactive ? t("homeScreen.hideInactive") : t("homeScreen.showInactive")}
              </Typography>
            </Button>
          ) : undefined
        }
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
