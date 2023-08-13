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
import Loader from "components/Loader";
import { i18n } from "locales/config";
import AuthContext from "contexts/auth";
import { GetUserLesson } from "services/lessonsService";
import AccountNotAssociated from "components/AccountNotAssociated";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Dashboard">;

interface DashboardTeams {
  team: Frontend.Content.Team;
  latestOpenAssignment?: Frontend.Content.Assignment;
  stats: {
    timePerPage: number;
    totalPages: number;
  };
}

const DashboardScreen = ({ navigation }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<DashboardTeams[]>([]);
  const { user } = useContext(AuthContext);

  const getData = () => {
    const toAddTeams: DashboardTeams[] = [];
    if (user?.teams != undefined) {
      for (let i = 0; i < user.teams.length; i++) {
        console.log(user.teams[i]);
        GetUserLesson({
          teamId: user.teams[0].id,
        })
          .then((res) => {
            toAddTeams.push({
              team: {
                id: user.teams[i].id,
                title: user.teams[i].name,
                organizationName: user.teams[i].organizationName,
                assignments: res.list.length,
                image:
                  "https://quranload-lp-dev-app.azurewebsites.net/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmosque.d8bc985e.jpg&w=384&q=75",
              },
              latestOpenAssignment: res.list.length > 0 ? res.list[0] : undefined,
              stats: {
                totalPages: 10,
                timePerPage: 2.5,
              },
            });
            setTeams([...teams, ...toAddTeams]);
          })
          .catch(() => null)
          .finally(() => setIsLoading(false));
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (isLoading)
    return (
      <QuranLoadView>
        <Loader light />
      </QuranLoadView>
    );

  return (
    <QuranLoadView>
      <View>
        <Typography type="BodyLight" style={{ opacity: 0.5 }}>
          As-salamu aleykum,
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
      {teams.length > 0 ? (
        teams.map((item, index) => (
          <View key={index}>
            <LectureBox
              team={item.team}
              latestOpenAssignment={item.latestOpenAssignment}
              onLecturePress={() => navigation.navigate("Assignments", { teamId: item.team.id })}
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
                label={i18n.t("hoursPerPage")}
                value={`${item.stats.timePerPage} min`}
                backgroundColor={Colors.Primary[1]}
              />
              <StatsBox
                icon={<BookIcon width={40} height={40} color={Colors.Success[5]} />}
                label={i18n.t("pages")}
                value={`${item.stats.totalPages}`}
                backgroundColor={Colors.Success[1]}
              />
            </View>
          </View>
        ))
      ) : (
        <AccountNotAssociated />
      )}
    </QuranLoadView>
  );
};

export default DashboardScreen;
