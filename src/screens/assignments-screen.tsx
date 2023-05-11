import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import AssignmentItem from "components/AssignmentItem";
import { StyleSheet, View } from "react-native";
import GeneralConstants from "constants/GeneralConstants";

const mock: Frontend.Content.Assignment[] = [
  {
    status: "pending",
    deadline: "Yesterday",
    text: "Read: 100-110",
  },
  {
    status: "done",
    deadline: "13-08-2023",
    text: "Read: 100-110",
  },
  {
    status: "rejected",
    deadline: "12-08-2023",
    text: "Read: 100-110",
  },
  {
    status: "rejected",
    deadline: "11-08-2023",
    text: "Read: 100-110",
  },
  {
    status: "rejected",
    deadline: "10-08-2023",
    text: "Read: 100-110",
  },
  {
    status: "rejected",
    deadline: "09-08-2023",
    text: "Read: 100-110",
  },
  {
    status: "done",
    deadline: "08-08-2023",
    text: "Read: 100-110",
  },
  {
    status: "done",
    deadline: "07-08-2023",
    text: "Read: 100-110",
  },
  {
    status: "done",
    deadline: "06-08-2023",
    text: "Read: 100-110",
  },
  {
    status: "done",
    deadline: "05-08-2023",
    text: "Read: 100-110",
  },
  {
    status: "done",
    deadline: "04-08-2023",
    text: "Read: 100-110",
  },
  {
    status: "done",
    deadline: "03-08-2023",
    text: "Read: 100-110",
  },
  {
    status: "done",
    deadline: "02-08-2023",
    text: "Read: 100-110",
  },
];

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Assignments">;
const AssignmentsScreen = ({ navigation }: Props) => {
  return (
    <QuranLoadView appBar={{ title: "Homework" }}>
      <View style={styles.assignments}>
        {mock.map((assignment, index) => (
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
