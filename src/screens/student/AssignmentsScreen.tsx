import React, { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import AssignmentItem from "components/AssignmentItem";
import { StyleSheet, View } from "react-native";
import GeneralConstants from "constants/GeneralConstants";
import Paginated from "types/Paginated";
import { GetUserLesson } from "services/lessonsService";
import Loader from "components/Loader";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Assignments">;
const AssignmentsScreen = ({ route }: Props) => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Paginated<Frontend.Content.Assignment>>();

  useEffect(() => {
    const getUserAssignmentList = () => {
      GetUserLesson({ teamId: route.params.teamId })
        .then((res) => {
          setAssignments(res);
          console.log(res.list);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    void getUserAssignmentList();
  }, []);

  return (
    <QuranLoadView appBar={{ title: "Homework" }}>
      <View style={styles.assignments}>
        {loading && <Loader light />}
        {assignments &&
          assignments.list.map((assignment, index) => (
            <AssignmentItem key={index} assignment={assignment} onPress={() => null} />
          ))}
      </View>
    </QuranLoadView>
  );
};

const styles = StyleSheet.create({
  assignments: {
    gap: GeneralConstants.Spacing.md,
  },
});

export default AssignmentsScreen;
