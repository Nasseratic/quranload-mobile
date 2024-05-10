import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import AssignmentItem from "components/AssignmentItem";
import { FlatList } from "react-native";
import TabBox from "components/TabBox";
import { i18n, t } from "locales/config";
import { AssignmentStatusEnum } from "types/Lessons";
import { useAssignments } from "hooks/queries/assignments";
import { RootStackParamList } from "navigation/navigation";
import { SafeView } from "components/SafeView";
import { AppBar } from "components/AppBar";
import { Spinner } from "tamagui";
import { EmptyState } from "components/EmptyState";
const tabs = ["pending", "all"] as const;

type Props = NativeStackScreenProps<RootStackParamList, "Assignments">;
const AssignmentsScreen = ({ route, navigation }: Props) => {
  const [tabKey, setTabKey] = useState<(typeof tabs)[number]>("pending");

  const { assignments, isAssignmentsLoading } = useAssignments({
    status: tabKey === "all" ? null : AssignmentStatusEnum.pending,
  });

  const teamAssignments = assignments?.[route.params.teamId];
  return (
    <SafeView side="top" f={1}>
      <AppBar title={t("assignmentScreen.title")} />
      <FlatList
        data={teamAssignments}
        renderItem={({ item }) => (
          <AssignmentItem
            assignment={item}
            onPress={() => navigation.navigate("Record", { assignment: item })}
          />
        )}
        ListEmptyComponent={
          isAssignmentsLoading ? null : (
            <EmptyState
              title={t("assignmentScreen.empty")}
              description={t("assignmentScreen.emptyDescriptionStudent")}
            />
          )
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
        ListHeaderComponent={
          <TabBox
            list={[i18n.t("assignmentScreen.pending"), i18n.t("assignmentScreen.all")]}
            index={tabs.indexOf(tabKey)}
            setIndex={(index) => setTabKey(tabs[index] ?? "pending")}
          />
        }
        ListFooterComponent={isAssignmentsLoading ? <Spinner py="$12" size="large" /> : null}
      />
    </SafeView>
  );
};

export default AssignmentsScreen;
