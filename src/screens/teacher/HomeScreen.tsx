import React, { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import Typography from "components/Typography";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "TeacherHome">;

const HomeScreen: FunctionComponent<Props> = () => {
  return (
    <QuranLoadView>
      <Typography>TEACHER HOME SCREEN</Typography>
    </QuranLoadView>
  );
};

export default HomeScreen;
