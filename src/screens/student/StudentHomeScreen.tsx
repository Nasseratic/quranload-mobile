import { useContext } from "react";
import { ActivityIndicator, Dimensions } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import StatsBox from "components/StatsBox";
import { Colors } from "constants/Colors";
import LectureBox from "components/LectureBox";
import Typography from "components/Typography";
import { BookIcon, ClockIcon } from "assets/icons";
import { Loader } from "components/Loader";
import { i18n, t } from "locales/config";
import AuthContext from "contexts/auth";
import AccountNotAssociated from "components/AccountNotAssociated";
import { useAssignments } from "hooks/queries/assignments";
import { AssignmentStatusEnum } from "types/Lessons";
import UserHeader from "components/UserHeader";
import { useQuery } from "@tanstack/react-query";
import { fetchStudentStatistics } from "services/profileService";
import { Stack, XStack, YStack } from "tamagui";
import LineChartWithTooltips from "components/LineChartWithTooltips";
import { fDateDashed, fMinutesDuration } from "utils/formatTime";
import { RootStackParamList } from "navigation/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "StudentHome">;

export const StudentHomeScreen = ({ navigation }: Props) => {
  const { user } = useContext(AuthContext);
  const { assignments, isAssignmentsLoading } = useAssignments({
    status: AssignmentStatusEnum.pending,
  });

  if (isAssignmentsLoading || !user || !assignments) return <Loader />;

  return (
    <QuranLoadView>
      <UserHeader />
      {user.teams.length > 0 ? (
        user.teams.map((team, index) => {
          const teamAssignments = assignments[team.id];
          return (
            <Stack gap="$4" key={index}>
              <LectureBox
                pendingAssignmentsCount={teamAssignments.length}
                team={team}
                latestOpenAssignment={teamAssignments[0]}
                onLecturePress={() => navigation.navigate("Assignments", { teamId: team.id })}
                onAssignmentPress={() =>
                  teamAssignments &&
                  navigation.navigate("Record", { assignment: teamAssignments[0] })
                }
              />
              <StatusSection teamId={team.id} />
            </Stack>
          );
        })
      ) : (
        <AccountNotAssociated />
      )}
    </QuranLoadView>
  );
};

const StatusSection = ({ teamId }: { teamId: string }) => {
  const { data, isLoading } = useQuery(["student-stats"], () => fetchStudentStatistics({ teamId }));

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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
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
            formatYLabel={(y: number) => y + t("time.m")}
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
