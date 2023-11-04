import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import { ActivityIndicator } from "react-native";
import { Stack, XStack } from "tamagui";
import { Colors } from "constants/Colors";
import TeacherHomeworkItem from "components/teacher/TeacherHomeworkItem";
import { useAssignments } from "hooks/queries/assignments";
import { RootStackParamList } from "navigation/navigation";
import PersonsIcon from "components/icons/PersonsIcon";
import { IconButton } from "components/buttons/IconButton";
import PlusIcon from "components/icons/PlusIcon";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherHomework">;

export const TeacherHomeworkScreen: FunctionComponent<Props> = ({ navigation, route }) => {
  const { assignments, isAssignmentsLoading } = useAssignments({ status: null });

  const currentTeamAssignments = assignments?.[route.params.teamId];

  return (
    <QuranLoadView
      appBar={{
        title: "Homework",
        rightComponent: (
          <XStack>
            <IconButton
              icon={<PersonsIcon color={Colors.Primary[1]} />}
              onPress={() =>
                navigation.navigate("TeacherStudentsList", { teamId: route.params.teamId })
              }
            />
            <IconButton
              icon={<PlusIcon color={Colors.Primary[1]} />}
              onPress={() =>
                navigation.navigate("TeacherCreateHomework", { teamId: route.params.teamId })
              }
            />
          </XStack>
        ),
      }}
    >
      {isAssignmentsLoading || !currentTeamAssignments ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <Stack gap={"$3.5"}>
          {currentTeamAssignments.map(
            (homework, index) =>
              homework && (
                <TeacherHomeworkItem
                  key={index}
                  homework={homework}
                  onPress={() => navigation.navigate("TeacherSubmissions", { homework })}
                />
              )
          )}
        </Stack>
      )}
    </QuranLoadView>
  );
};
