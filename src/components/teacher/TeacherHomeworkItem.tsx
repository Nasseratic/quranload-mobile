import Typography from "components/Typography";
import ChevronRight from "components/icons/ChevronRight";
import { Colors } from "constants/Colors";
import { format } from "date-fns";
import { useMemo } from "react";
import { Card, Stack } from "tamagui";
import { diffInDays } from "utils/formatTime";
import { TouchableOpacity } from "react-native";

interface Props {
  homework: Frontend.Content.Homework;
  onPress?: () => void;
}

const TeacherHomeworkItem = ({ homework, onPress }: Props) => {
  const dateString = useMemo(() => {
    const diff = diffInDays(new Date(), homework.endDate);

    switch (diff) {
      case 1:
        return "Tomorrow";
      case 0:
        return "Today";
      case -1:
        return "Yesterday";
      default:
        return format(homework.endDate, "dd-MM-yyyy");
    }
  }, [homework]);

  const handedInColor = useMemo(() => {
    if (homework.totalSubmittedStudents === homework.totalRegisteredStudents)
      return Colors.Success[1];
    if (homework.totalSubmittedStudents > 0) return Colors.Warning[1];
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
          <Typography type="BodyHeavy" style={{ color: Colors.Primary[1] }}>
            {homework.description}
          </Typography>
          <Stack flexDirection="row" gap="$2">
            <Typography type="CaptionLight" style={{ color: Colors.Black[2] }}>
              {dateString}
            </Typography>
            <ChevronRight color={Colors.Primary[1]} />
          </Stack>
        </Stack>
        <Stack flexDirection="row" gap="$1" alignItems="center">
          <Typography type="CaptionHeavy" style={{ color: handedInColor }}>
            Handed in {homework.totalSubmittedStudents}/{homework.totalRegisteredStudents}
          </Typography>
          <Typography type="CaptionHeavy" style={{ color: Colors.Primary[1] }}>
            {" "}
            ·{" "}
          </Typography>
          <Typography type="CaptionHeavy" style={{ color: Colors.Primary[1] }}>
            Feedback {homework.feedbackGivenCount}/{homework.totalRegisteredStudents}
          </Typography>
        </Stack>
      </Card>
    </TouchableOpacity>
  );
};

export default TeacherHomeworkItem;
