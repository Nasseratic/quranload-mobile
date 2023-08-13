import { CheckmarkIcon, RejectedCrossIcon } from "assets/icons";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { StyleSheet, View } from "react-native";
import { AssignmentStatusEnum, LessonStatusFromEnumToType } from "types/Lessons";

interface Props {
  status: AssignmentStatusEnum;
}

const AssignmentStatusCheckbox = ({ status }: Props) => {
  return (
    <View
      style={{
        height: 18.5,
        width: 18.5,
        borderRadius: GeneralConstants.BorderRadius.xxs * 1.2,
        justifyContent: "center",
        alignItems: "center",
        ...styles[LessonStatusFromEnumToType(status) as Frontend.Content.AssignmentStatus],
      }}
    >
      {(status === AssignmentStatusEnum.submitted || status == AssignmentStatusEnum.accepted) && (
        <CheckmarkIcon color={Colors.White[1]} />
      )}
      {status == AssignmentStatusEnum.rejected && <RejectedCrossIcon color={Colors.White[1]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  pending: {
    borderWidth: 1.5,
    borderColor: Colors.Success[1],
  },
  submitted: {
    backgroundColor: Colors.Success[1],
  },
  rejected: {
    backgroundColor: Colors.Error[1],
  },
});

export default AssignmentStatusCheckbox;
