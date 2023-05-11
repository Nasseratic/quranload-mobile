import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Typography from "components/Typography";
import { ChevronRightIcon } from "assets/icons";
import AssignmentStatusCheckbox from "./AssignmentStatusCheckbox";

interface Props {
  assignment: Frontend.Content.Assignment;
  onPress: () => void;
}

const AssignmentItem = ({ assignment, onPress }: Props) => {
  const styles = StyleSheet.create({
    assignmentItem: {
      paddingHorizontal: GeneralConstants.Spacing.md,
      paddingVertical: GeneralConstants.Spacing.sm,
      borderWidth: 1,
      borderColor: Colors.Gray[1],
      borderRadius: GeneralConstants.BorderRadius.full,
      flexDirection: "row",
      alignItems: "center",
      gap: GeneralConstants.Spacing.md,
    },
    assignmentText: {
      color: Colors.Primary[1],
    },
    deadline: {
      color: Colors.Black[2],
      marginLeft: "auto",
    },
  });

  return (
    <TouchableOpacity style={styles.assignmentItem} onPress={onPress}>
      <AssignmentStatusCheckbox status={assignment.status} />
      <Typography style={styles.assignmentText} type="BodyHeavy">
        {assignment.text}
      </Typography>
      <Typography style={styles.deadline} type="CaptionLight">
        {assignment.deadline}
      </Typography>
      <ChevronRightIcon color={Colors.Primary[1]} />
    </TouchableOpacity>
  );
};

export default AssignmentItem;
