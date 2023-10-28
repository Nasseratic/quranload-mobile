import Typography from "components/Typography";
import ChevronRight from "components/icons/ChevronRight";
import { Colors } from "constants/Colors";
import { format } from "date-fns";
import { useMemo } from "react";
import { Card, Stack } from "tamagui";
import { diffInDays } from "utils/formatTime";
import { TouchableOpacity } from "react-native";
import { Assignment } from "hooks/queries/assignments";
import { t } from "locales/config";

interface Props {
  homework: Assignment;
  onPress?: () => void;
}

const TeacherHomeworkItem = ({ homework, onPress }: Props) => {
  console.log(homework);
  console.log(homework.endDate);
  const dateString = useMemo(() => {
    const end = homework.endDate ? new Date(homework.endDate) : new Date();
    const diff = diffInDays(new Date(), end);

    switch (diff) {
      case 1:
        return "Tomorrow";
      case 0:
        return "Today";
      case -1:
        return "Yesterday";
      default:
        return format(end, "dd-MM-yyyy");
    }
  }, [homework]);

  const handedInColor = useMemo(() => {
    if (!homework) return Colors.Error[1];
    if (homework.totalSubmittedStudents === homework.totalRegisteredStudents)
      return Colors.Success[1];
    if ((homework.totalSubmittedStudents ?? 0) > 0) return Colors.Warning[1];
    return Colors.Error[1];
  }, [homework]);

  return (
    <TouchableOpacity onPress={onPress}>
      <Card
        padding="$2.5"
        backgroundColor="$backgroundTransparent"
        borderColor="$gray5"
        borderWidth={1}
        gap="$2"
      >
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          {homework.startPage && homework.endPage ? (
            <Typography type="BodyHeavy">
              {t("read")}: {homework.startPage} - {homework.endPage}
            </Typography>
          ) : (
            <Typography type="BodyHeavy">{homework.description}</Typography>
          )}
          <Stack flexDirection="row" gap="$2">
            <Typography type="CaptionLight" style={{ color: Colors.Black[2] }}>
              {dateString}
            </Typography>
            <ChevronRight color={Colors.Primary[1]} />
          </Stack>
        </Stack>
        {homework && (
          <Stack flexDirection="row" gap="$1" alignItems="center">
            <Typography type="CaptionHeavy" style={{ color: handedInColor }}>
              Handed in {homework.totalSubmittedStudents}/{homework.totalRegisteredStudents}
            </Typography>
            <Typography type="CaptionHeavy" style={{ color: Colors.Primary[1] }}>
              {" "}
              ·{" "}
            </Typography>
            <Typography type="CaptionHeavy" style={{ color: Colors.Primary[1] }}>
              Feedback {homework.totalFeedbackStudents}/{homework.totalRegisteredStudents}
            </Typography>
          </Stack>
        )}
      </Card>
    </TouchableOpacity>
  );
};

export default TeacherHomeworkItem;
