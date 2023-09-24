import { useContext } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import StatsBox from "components/StatsBox";
import { Colors } from "constants/Colors";
import LectureBox from "components/LectureBox";
import Typography from "components/Typography";
import { BookIcon, ClockIcon, CogIcon } from "assets/icons";
import { Loader } from "components/Loader";
import { i18n } from "locales/config";
import AuthContext from "contexts/auth";
import AccountNotAssociated from "components/AccountNotAssociated";
import { useAssignments } from "hooks/queries/assigemnts";
import { AssignmentStatusEnum } from "types/Lessons";
import { useQuery } from "@tanstack/react-query";
import { fetchStudentStatistics } from "services/profileService";
import { Stack, XStack } from "tamagui";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Dashboard">;

export const StudentHomeScreen = ({ navigation }: Props) => {
  const { user } = useContext(AuthContext);
  const { assignments, isAssignmentsLoading } = useAssignments({
    status: AssignmentStatusEnum.pending,
  });

  if (isAssignmentsLoading || !user || !assignments) return <Loader />;

  return (
    <QuranLoadView>
      <View>
        <Typography type="BodyLight" style={{ opacity: 0.5 }}>
          Assalamu alykum,
        </Typography>
        <XStack ai="center" jc="space-between">
          <Typography type="HeadlineHeavy">{user?.fullName}</Typography>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <CogIcon width={18} height={18} color={Colors.Primary[1]} />
          </TouchableOpacity>
        </XStack>
      </View>
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

  if (isLoading) return <ActivityIndicator size="small" style={{ marginTop: 40 }} />;

  return (
    <XStack gap="$3">
      <StatsBox
        icon={<ClockIcon width={40} height={40} color={Colors.Warning[5]} />}
        label={i18n.t("timePerPage")}
        value={`${data?.averageTimePerPage} min`}
        backgroundColor={Colors.Primary[1]}
      />
      <StatsBox
        icon={<BookIcon width={40} height={40} color={Colors.Success[5]} />}
        label={i18n.t("pages")}
        value={`${data?.totalNumberOfPagesRead}`}
        backgroundColor={Colors.Success[1]}
      />
    </XStack>
  );
};
