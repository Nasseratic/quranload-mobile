import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { StyleSheet, TouchableOpacity } from "react-native";
import Typography from "components/Typography";
import { ChevronRightIcon } from "assets/icons";
import AssignmentStatusCheckbox from "./AssignmentStatusCheckbox";
import { intlFormat } from "utils/formatTime";
import { t } from "locales/config";
import { Assignment } from "hooks/queries/assignments";
import { endOfDay, isPast } from "date-fns";

interface Props {
  assignment: Assignment;
  onPress: () => void;
}

const AssignmentItem = ({ assignment, onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.assignmentItem} onPress={onPress} activeOpacity={0.65}>
      <AssignmentStatusCheckbox
        status={assignment.status}
        isDue={assignment.endDate != null && isPast(endOfDay(new Date(assignment.endDate)))}
      />
      {assignment.startPage && assignment.endPage ? (
        <Typography style={styles.assignmentText} type="Body">
          {t("read")}: {assignment.startPage} - {assignment.endPage}
        </Typography>
      ) : (
        <Typography style={styles.assignmentText} type="Body">
          {assignment.description}
        </Typography>
      )}

      {assignment.feedbackUrl && (
        <Typography style={{ color: Colors.Success[1] }} type="CaptionHeavy">
          {t("feedback")}
        </Typography>
      )}
      {assignment.endDate && (
        <Typography style={styles.deadline} type="CaptionLight">
          Due: {intlFormat(new Date(assignment.endDate), "date-short")}
        </Typography>
      )}
      <ChevronRightIcon color={Colors.Primary[1]} />
    </TouchableOpacity>
  );
};

export default AssignmentItem;

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
