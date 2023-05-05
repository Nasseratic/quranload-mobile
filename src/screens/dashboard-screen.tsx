import React from "react";
import { View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import StatsBox from "components/StatsBox";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import LectureBox from "components/LectureBox";
import Typography from "components/Typography";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Dashboard">;

const Dashboard = ({ navigation }: Props) => {
  return (
    <QuranLoadView>
      <View>
        <Typography type="BodyLight">As salam aleykum,</Typography>
        <View>
          <Typography type="HeadlineHeavy">As salam aleykum,</Typography>
        </View>
      </View>
      <LectureBox />
      <View
        style={{
          flexDirection: "row",
          gap: GeneralConstants.Spacing.md,
          marginTop: GeneralConstants.Spacing.md,
        }}
      >
        <StatsBox
          icon=""
          label="Time pr page"
          value="2.5 min"
          backgroundColor={Colors.Primary[1]}
        />
        <StatsBox
          icon=""
          label="Time pr page"
          value="2.5 min"
          backgroundColor={Colors.Success[1]}
        />
      </View>
    </QuranLoadView>
  );
};

export default Dashboard;
