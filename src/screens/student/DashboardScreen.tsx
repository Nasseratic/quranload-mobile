import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import StatsBox from "components/StatsBox";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import LectureBox from "components/LectureBox";
import Typography from "components/Typography";
import { BookIcon, ClockIcon, CogIcon } from "assets/icons";
import { StatusBar } from "expo-status-bar";
import Loader from "components/Loader";
import { i18n } from "locales/config";
import AuthContext from "contexts/auth";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Dashboard">;

const DashboardScreen = ({ navigation }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const getData = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  if (isLoading) return <Loader />;

  return (
    <QuranLoadView>
      <View>
        <Typography type="BodyLight" style={{ opacity: 0.5 }}>
          As salam aleykum,
        </Typography>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography type="HeadlineHeavy">{user!.name}</Typography>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <CogIcon width={18} height={18} color={Colors.Primary[1]} />
          </TouchableOpacity>
        </View>
      </View>
      <LectureBox onLecturePress={() => navigation.navigate("Assignments")} />
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
