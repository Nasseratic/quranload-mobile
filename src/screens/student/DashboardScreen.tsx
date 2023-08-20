import { useContext, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import StatsBox from "components/StatsBox";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import LectureBox from "components/LectureBox";
import Typography from "components/Typography";
import { BookIcon, ClockIcon, CogIcon } from "assets/icons";
import { Loader } from "components/Loader";
import { i18n } from "locales/config";
import AuthContext from "contexts/auth";
import AccountNotAssociated from "components/AccountNotAssociated";
import { useAssignments } from "hooks/queries/assigemnts";
import { AssignmentStatusEnum } from "types/Lessons";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Dashboard">;

const DashboardScreen = ({ navigation }: Props) => {
  const { user } = useContext(AuthContext);
  const { assignments, isAssignmentsLoading } = useAssignments({
    status: AssignmentStatusEnum.pending,
  });

  const stats = {
    timePerPage: 3.2,
    totalPages: 20,
  };

  if (isAssignmentsLoading || !user || !assignments) return <Loader />;

  return (
    <QuranLoadView>
      <View>
        <Typography type="BodyLight" style={{ opacity: 0.5 }}>
          Assalamu alykum,
        </Typography>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography type="HeadlineHeavy">{user?.fullName}</Typography>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <CogIcon width={18} height={18} color={Colors.Primary[1]} />
          </TouchableOpacity>
        </View>
      </View>
      {user.teams.length > 0 ? (
        user.teams.map((team, index) => {
          const teamAssignments = assignments[team.id];
          return (
            <View key={index}>
              <LectureBox
                pendingAssignmentsCount={teamAssignments.length}
                team={team}
                onLecturePress={() => navigation.navigate("Assignments", { teamId: team.id })}
                onAssignmentPress={() =>
                  teamAssignments &&
                  navigation.navigate("Record", { assignment: teamAssignments[0] })
                }
              />
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 15,
                  gap: GeneralConstants.Spacing.md,
                }}
              >
                <StatsBox
                  icon={<ClockIcon width={40} height={40} color={Colors.Warning[5]} />}
                  label={i18n.t("timePerPage")}
                  value={`${stats.timePerPage} min`}
                  backgroundColor={Colors.Primary[1]}
                />
                <StatsBox
                  icon={<BookIcon width={40} height={40} color={Colors.Success[5]} />}
                  label={i18n.t("pages")}
                  value={`${stats.totalPages}`}
                  backgroundColor={Colors.Success[1]}
                />
              </View>
            </View>
          );
        })
      ) : (
        <AccountNotAssociated />
      )}
    </QuranLoadView>
  );
};

export default DashboardScreen;
