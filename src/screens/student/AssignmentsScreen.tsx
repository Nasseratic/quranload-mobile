import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import AssignmentItem from "components/AssignmentItem";
import { StyleSheet, View } from "react-native";
import GeneralConstants from "constants/GeneralConstants";
import Paginated from "types/Paginated";
import { fetchUserLessons } from "services/lessonsService";
import { Loader } from "components/Loader";
import TabBox from "components/TabBox";
import { i18n } from "locales/config";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { AssignmentStatusEnum } from "types/Lessons";
import { useAssignments } from "hooks/queries/assigemnts";

const tabs = ["pending", "all"] as const;

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Assignments">;
const AssignmentsScreen = ({ route, navigation }: Props) => {
  const [tabKey, setTabKey] = useState<(typeof tabs)[number]>("pending");

  const { assignments, isAssignmentsLoading } = useAssignments({
    status: tabKey === "all" ? null : AssignmentStatusEnum.pending,
  });

  const teamAssignments = assignments?.[route.params.teamId];

  return (
    <QuranLoadView appBar={{ title: i18n.t("assignmentScreen.title") }}>
      <TabBox
        list={[i18n.t("assignmentScreen.pending"), i18n.t("assignmentScreen.all")]}
        index={tabs.indexOf(tabKey)}
        setIndex={(index) => setTabKey(tabs[index])}
      />
      {isAssignmentsLoading ? (
        <Loader />
      ) : (
        teamAssignments && (
          <View style={styles.assignments}>
            {teamAssignments.map((assignment, index) => (
              <AssignmentItem
                key={index}
                assignment={assignment}
                onPress={() => navigation.navigate("Record", { assignment })}
              />
            ))}
          </View>
        )
      )}
    </QuranLoadView>
  );
};

const styles = StyleSheet.create({
  assignments: {
    gap: GeneralConstants.Spacing.md,
  },
});

export default AssignmentsScreen;
