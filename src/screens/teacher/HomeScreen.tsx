import React, { FunctionComponent, useContext } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import Typography from "components/Typography";
import ActionButton from "components/buttons/ActionBtn";
import AuthContext from "contexts/auth";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "TeacherHome">;

const HomeScreen: FunctionComponent<Props> = () => {
  const {signOut} = useContext(AuthContext);
  return (
    <QuranLoadView>
      <Typography>TEACHER HOME SCREEN</Typography>
      <ActionButton onPress={signOut} title={"Log ud"}/>
    </QuranLoadView>
  );
};

export default HomeScreen;
