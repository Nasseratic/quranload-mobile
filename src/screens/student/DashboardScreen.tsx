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

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Dashboard">;

const DashboardScreen = ({ navigation }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState<Frontend.Content.Team>();
  const [latestOpenAssignment, setLatestOpenAssignment] = useState<Frontend.Content.Assignment>();
  const { user } = useContext(AuthContext);

  const getData = () => {
    setIsLoading(false);

    if (user?.teams && user.teams.length > 0) {
      GetUserLesson({
        teamId: user.teams[0].id,
        lessonState: 0,
      })
        .then((res) => {
          setTeam({
            id: user.teams[0].id,
            title: user.teams[0].name,
            institution: user.teams[0].description,
            assignments: 50,
            image:
              "https://s3-alpha-sig.figma.com/img/3569/704f/4eadebbdb061c627ee3560b99fccffcc?Expires=1684108800&Signature=kWeltpIz8rXtqGjmlmtXM6YT287tuDwqUhxAolPLMajP5iNP2566ZIMk1PcdGw80M80-oi4PG3kr8~lWTUifYcH4GYQxSqp2C36P81vRKp-05nM4V1CySHDWRYXfaiPrqO6rTS-fR7es5X6I9IPBwYxkPleufxL~Gi5dzHfhki0d~qEfJ2xeNsAOfin6aSWvT~E8Eumi7pbFbCW1QlliKtS2yfg9mIlbGc3bqFUIgZf1WbR-ybLqIxXq-M0AGi50TSsaJGU5GLQIKo04BuqmZFmo5KK0z2oJIHRE3k0Afo3QjAGkgD0ADyIdo739LqdgJDfY~Hd4LQXRAex17cs6~A__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4",
          });

          if (res.list.length > 0) {
            console.log(res.list[0]);
            setLatestOpenAssignment(res.list[0]);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (isLoading) return <Loader />;

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
          <Typography type="HeadlineHeavy">{user!.fullName}</Typography>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <CogIcon width={18} height={18} color={Colors.Primary[1]} />
          </TouchableOpacity>
        </View>
      </View>
      {team && (
        <LectureBox
          team={team}
          latestOpenAssignment={latestOpenAssignment}
          onLecturePress={() => navigation.navigate("Assignments", {teamId: team.id})}
        />
      )}
      <View
        style={{
          flexDirection: "row",
          gap: GeneralConstants.Spacing.md,
        }}
      >
        <StatsBox
          icon={<ClockIcon width={40} height={40} color={Colors.Warning[5]} />}
          label={i18n.t("hoursPerPage")}
          value="2.5 min"
          backgroundColor={Colors.Primary[1]}
        />
        <StatsBox
          icon={<BookIcon width={40} height={40} color={Colors.Success[5]} />}
          label={i18n.t("pages")}
          value="193"
          backgroundColor={Colors.Success[1]}
        />
      </View>
    </QuranLoadView>
  );
};

export default DashboardScreen;
