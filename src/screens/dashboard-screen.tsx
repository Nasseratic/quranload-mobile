import React from "react";
import { View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import StatsBox from "components/StatsBox";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import LectureBox from "components/LectureBox";
import Typography from "components/Typography";
import { BookIcon, ClockIcon, CogIcon } from "assets/icons";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Dashboard">;

const Dashboard = ({ navigation }: Props) => {
  return (
    <QuranLoadView>
      <View>
        <Typography type="BodyLight">As salam aleykum,</Typography>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography type="HeadlineHeavy">Matin Kacar</Typography>
          <CogIcon width={18} height={18} color={Colors.Primary[1]} />
        </View>
      </View>
      <LectureBox />
      <View
        style={{
          flexDirection: "row",
          gap: GeneralConstants.Spacing.md,
        }}
      >
        <StatsBox
          icon={<ClockIcon width={40} height={40} color={Colors.Warning[5]} />}
          label="Time pr page"
          value="2.5 min"
          backgroundColor={Colors.Primary[1]}
        />
        <StatsBox
          icon={<BookIcon width={40} height={40} color={Colors.Success[5]} />}
          label="Pages"
          value="193"
          backgroundColor={Colors.Success[1]}
        />
      </View>
    </QuranLoadView>
  );
};

export default Dashboard;
