import { CheckmarkIcon, RejectedCrossIcon } from "assets/icons";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AssignmentStatusEnum, LessonStatusFromEnumToType } from "types/Lessons";

interface Props {
  status: AssignmentStatusEnum;
}

const AssignmentStatusCheckbox = ({ status }: Props) => {
  const statusNormal = LessonStatusFromEnumToType(status);
  return (
    <View
      style={{
        height: 18.5,
        width: 18.5,
        borderRadius: GeneralConstants.BorderRadius.xxs * 1.2,
        justifyContent: "center",
        alignItems: "center",
        ...styles[statusNormal],
      }}
    >
      {statusNormal === "done" && <CheckmarkIcon color={Colors.White[1]} />}
      {statusNormal === "rejected" && <RejectedCrossIcon color={Colors.White[1]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  pending: {
    borderWidth: 1.5,
    borderColor: Colors.Success[1],
  },
  done: {
    backgroundColor: Colors.Success[1],
  },
  rejected: {
    backgroundColor: Colors.Error[1],
  },
});

export default AssignmentStatusCheckbox;
