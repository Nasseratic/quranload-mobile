import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList } from "react-native";
import { Spinner, XStack } from "tamagui";
import { Colors } from "constants/Colors";
import TeacherHomeworkItem from "components/teacher/TeacherHomeworkItem";
import { useAssignments } from "hooks/queries/assignments";
import { RootStackParamList } from "navigation/navigation";
import PersonsIcon from "components/icons/PersonsIcon";
import { IconButton } from "components/buttons/IconButton";
import PlusIcon from "components/icons/PlusIcon";
import { SafeView } from "components/SafeView";
import { AppBar } from "components/AppBar";
import { t } from "locales/config";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherHomework">;

export const TeacherHomeworkScreen: FunctionComponent<Props> = ({ navigation, route }) => {
  const { assignments, isAssignmentsLoading } = useAssignments({ status: null });

  const currentTeamAssignments = assignments?.[route.params.teamId];

  return (
    <SafeView>
      <AppBar
        title={t("assignmentScreen.title")}
        rightComponent={
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
        }
      />
      <FlatList
        data={currentTeamAssignments}
        renderItem={({ item }) => (
          <TeacherHomeworkItem
            homework={item}
            onPress={() => navigation.navigate("TeacherSubmissions", { homework: item })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
        ListFooterComponent={isAssignmentsLoading ? <Spinner size="large" py="$12" /> : null}
      />
    </SafeView>
  );
};
