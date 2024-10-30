import { useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import AssignmentItem from "components/AssignmentItem";
import { FlatList } from "react-native";
import { t } from "locales/config";
import { AssignmentStatusEnum } from "types/Lessons";
import { useAssignments } from "hooks/queries/assignments";
import { RootStackParamList } from "navigation/navigation";
import { SafeView } from "components/SafeView";
import { AppBar } from "components/AppBar";
import { Spinner } from "tamagui";
import { EmptyState } from "components/EmptyState";
import PillGroup from "components/pillGroup/PillGroup";

const options: Frontend.Content.Option<AssignmentStatusEnum | null>[] = [
  {
    label: t("assignmentScreen.all"),
    value: null,
  },
  {
    label: t("assignmentScreen.pending"),
    value: AssignmentStatusEnum.pending,
  },
  {
    label: t("assignmentScreen.submitted"),
    value: AssignmentStatusEnum.submitted,
  },
  {
    label: t("assignmentScreen.accepted"),
    value: AssignmentStatusEnum.accepted,
  },
  {
    label: t("assignmentScreen.rejected"),
    value: AssignmentStatusEnum.rejected,
  },
] as const;

type Props = NativeStackScreenProps<RootStackParamList, "Assignments">;
const AssignmentsScreen = ({ route, navigation }: Props) => {
  const [selectedFilter, setSelectedFilter] = useState<AssignmentStatusEnum | null>(null);

  const { assignments, isAssignmentsLoading } = useAssignments({
    status: selectedFilter,
  });

  const emptyeStateDescription = useMemo(() => {
    switch (selectedFilter) {
      case AssignmentStatusEnum.pending:
        return t("assignmentScreen.emptyDescriptionStudentPending");
      case AssignmentStatusEnum.submitted:
        return t("assignmentScreen.emptyDescriptionStudentSubmitted");
      case AssignmentStatusEnum.accepted:
        return t("assignmentScreen.emptyDescriptionStudentAccepted");
      case AssignmentStatusEnum.rejected:
        return t("assignmentScreen.emptyDescriptionStudentRejected");
      default:
        return t("assignmentScreen.emptyDescriptionStudent");
    }
  }, [selectedFilter]);

  const teamAssignments = assignments?.[route.params.teamId];
  return (
    <SafeView side="top" f={1}>
      <AppBar title={t("assignmentScreen.title")} />
      <PillGroup
        options={options}
        selected={selectedFilter}
        onChange={(value) => setSelectedFilter(value)}
      />
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
            <EmptyState title={t("assignmentScreen.empty")} description={emptyeStateDescription} />
          )
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
        ListFooterComponent={isAssignmentsLoading ? <Spinner py="$12" size="large" /> : null}
      />
    </SafeView>
  );
};

export default AssignmentsScreen;
