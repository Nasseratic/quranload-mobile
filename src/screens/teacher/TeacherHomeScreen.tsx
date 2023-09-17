import { FunctionComponent, useContext } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import Typography from "components/Typography";
import AuthContext from "contexts/auth";
import { TeamItem } from "components/TeamItem";
import { Card, Circle, Separator, Stack, XStack } from "tamagui";
import { TouchableOpacity, View } from "react-native";
import { Colors } from "constants/Colors";
import { CogIcon } from "assets/icons";
import { useNavigation } from "@react-navigation/native";
import { useAssignments } from "hooks/queries/assigemnts";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "TeacherHome">;

const weekDays = new Array(7).fill(0).map((_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index);
  return date.toLocaleString("default", { weekday: "long" })[0];
});

export const TeacherHomeScreen: FunctionComponent<Props> = () => {
  const { user } = useContext(AuthContext);
  const d = useAssignments({ status: null });
  const navigation = useNavigation();

  return (
    <QuranLoadView>
      <View>
        <Typography type="BodyLight" style={{ opacity: 0.5 }}>
          Assalamu alykum,
        </Typography>
        <XStack jc="space-between" ai="center">
          <Typography type="HeadlineHeavy">{user?.fullName}</Typography>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <CogIcon width={18} height={18} color={Colors.Primary[1]} />
          </TouchableOpacity>
        </XStack>
      </View>
      {user?.teams.map((team, index) => (
        <Card bg="white" borderWidth={1} borderColor="$gray5">
          <Stack p="$3" gap="$3">
            <XStack jc="space-between" ai="center">
              <Stack>
                <Typography>Pages:1</Typography>
                <Typography>Next homework: læs side 11-12</Typography>
              </Stack>
              {/* TODO: add correct icon */}
              {/* <IconButton icon={<CrossIcon color="#000" />} /> */}
            </XStack>
            <XStack gap="$2" jc="center">
              {weekDays.map((day, index) => (
                <Circle bw={1} size="$3.5">
                  <Typography key={index} type="BodyLight">
                    {day}
                  </Typography>
                </Circle>
              ))}
            </XStack>
          </Stack>
          <Separator />
          <Stack p="$3">
            <TeamItem key={index} team={team} onPress={() => {}} />
          </Stack>
        </Card>
      ))}
    </QuranLoadView>
  );
};
