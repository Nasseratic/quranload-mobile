import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList } from "react-native";
import { Button, Spinner, XStack } from "tamagui";
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
import { EmptyState } from "components/EmptyState";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherHomework">;

export const TeacherHomeworkScreen: FunctionComponent<Props> = ({ navigation, route }) => {
  const { assignments, isAssignmentsLoading } = useAssignments({ status: null });
  const teamId = route.params.teamId;

  const currentTeamAssignments = assignments?.[teamId];

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
              onPress={() => navigation.navigate("TeacherCreateHomework", { teamId })}
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
        ListEmptyComponent={
          isAssignmentsLoading ? null : (
            <EmptyState
              title={t("assignmentScreen.empty")}
              description={t("assignmentScreen.emptyDescriptionTeacher")}
            >
              <Button
                m={16}
                size="$4"
                fontWeight="500"
                onPress={() => navigation.navigate("TeacherCreateHomework", { teamId })}
              >
                {t("createHomework")}
              </Button>
            </EmptyState>
          )
        }
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
