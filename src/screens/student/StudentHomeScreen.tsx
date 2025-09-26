import { useContext, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Linking } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import StatsBox from "components/StatsBox";
import { Colors } from "constants/Colors";
import LectureBox from "components/LectureBox";
import Typography from "components/Typography";
import { BookIcon, ClockIcon } from "assets/icons";
import { Loader } from "components/Loader";
import { i18n, t } from "locales/config";
import AuthContext from "contexts/auth";
import { useAssignments, useLatestAssignmentForTeam } from "hooks/queries/assignments";
import { AssignmentStatusEnum } from "types/Lessons";
import UserHeader from "components/UserHeader";
import { useQuery } from "@tanstack/react-query";
import { fetchStudentStatistics } from "services/profileService";
import { Button, Card, Separator, Square, Stack, XStack, YStack } from "tamagui";
import LineChartWithTooltips from "components/LineChartWithTooltips";
import { fDateDashed, fMinutesDuration } from "utils/formatTime";
import { RootStackParamList } from "navigation/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import NoClasses from "components/NoClasses";
import { Team } from "types/User";
import { useNavigation } from "@react-navigation/native";
import FeedbackCard from "components/FeedbackCard";

type Props = NativeStackScreenProps<RootStackParamList, "StudentHome">;

export const StudentHomeScreen = ({ navigation }: Props) => {
  const { user } = useContext(AuthContext);
  const [isShowingInactive, setIsShowingInactive] = useState(false);

  if (!user) return <Loader />;

  const teams = user.teams.filter((team) => isShowingInactive || team.isActive);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <UserHeader />

      <FlatList
        data={teams}
        ListEmptyComponent={user.teams.length === 0 ? <NoClasses role="student" /> : undefined}
        contentContainerStyle={{
          gap: 16,
          paddingTop: 12,
          paddingBottom: 16,
          paddingHorizontal: 16,
        }}
        renderItem={({ item }) => {
          return <StudentTeamOverview team={item} />;
        }}
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

const StudentTeamOverview = ({ team }: { team: Team }) => {
  const latestTeamAssignment = useLatestAssignmentForTeam(team.id);
  const navigation = useNavigation();
  return (
    <Stack gap="$4" key={team.id}>
      <LectureBox
        pendingAssignments={!!latestTeamAssignment}
        team={team}
        latestOpenAssignment={latestTeamAssignment}
        onLecturePress={() => navigation.navigate("Assignments", { teamId: team.id })}
      />
      <StatusSection teamId={team.id} />
    </Stack>
  );
};

const StatusSection = ({ teamId }: { teamId: string }) => {
  const { data, isLoading, error } = useQuery(["student-stats", teamId], () =>
    fetchStudentStatistics({ teamId })
  );

  if (error)
    return (
      <Card p={16} bg={Colors["Error"][1]}>
        <Typography style={{ color: "white" }}>{t("defaultError")}</Typography>
      </Card>
    );

  if (isLoading || !data) return <ActivityIndicator size="small" style={{ marginTop: 40 }} />;

  return (
    <YStack>
      <XStack gap="$3">
        <StatsBox
          icon={<ClockIcon width={40} height={40} color={Colors.Warning[5]} />}
          label={i18n.t("timePerPage")}
          value={fMinutesDuration({
            mins: data.averageTimePerPage,
          })}
          backgroundColor={Colors.Primary[1]}
        />
        <StatsBox
          icon={<BookIcon width={40} height={40} color={Colors.Success[5]} />}
          label={i18n.t("pages")}
          value={`${data.totalNumberOfPagesRead}`}
          backgroundColor={Colors.Success[1]}
        />
      </XStack>
      {data.assignmentVelocities && data.assignmentVelocities.length > 2 && (
        <>
          <Typography style={{ opacity: 0.5, marginTop: 16 }}>
            {i18n.t("homeScreen.readingTime")}
          </Typography>
          <LineChartWithTooltips
            data={{
              labels: data.assignmentVelocities.map((a) => fDateDashed(a.submissionDate)),
              datasets: [
                {
                  data:
                    data.assignmentVelocities?.map((a) =>
                      Number(a.averagePageDuration.toFixed(2))
                    ) ?? [],
                },
              ],
            }}
            width={Dimensions.get("window").width - 32} // from react-native
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 1, // optional, defaults to 2dp
              color: (opacity = 0.9) => `rgba(1, 178, 135, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "3",
                strokeWidth: "0",
                stroke: "#fff",
              },
              propsForLabels: {
                fontSize: 11,
              },
            }}
            formatYLabel={(y) => `${Number(y)}${t("time.m")}`}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLabels={false}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </>
      )}
    </YStack>
  );
};
