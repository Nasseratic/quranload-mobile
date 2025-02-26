import Typography from "components/Typography";
import ChevronRight from "components/icons/ChevronRight";
import { Colors } from "constants/Colors";
import { format } from "date-fns";
import { useMemo } from "react";
import { Card, Stack, XStack } from "tamagui";
import { diffInDays } from "utils/formatTime";
import { TouchableOpacity } from "react-native";
import { Assignment } from "hooks/queries/assignments";
import { t } from "locales/config";

interface Props {
  homework: Assignment;
  onPress?: () => void;
}

const TeacherHomeworkItem = ({ homework, onPress }: Props) => {
  const dateString = useMemo(() => {
    const end = homework.endDate ? new Date(homework.endDate) : new Date();
    const diff = diffInDays(new Date(), end);

    switch (diff) {
      case 1:
        return t("relativeDays.tomorrow");
      case 0:
        return t("relativeDays.today");
      case -1:
        return t("relativeDays.yesterday");
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
      <Card padding="$2.5" bg="$white1" borderColor="$gray5" borderWidth={1} gap="$2">
        <XStack jc="space-between" alignItems="center" f={1}>
          {homework.startPage && homework.endPage ? (
            <Typography type="BodyHeavy">
              {t("read")}: {homework.startPage} - {homework.endPage}
            </Typography>
          ) : (
            <Typography
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                flexGrow: 1,
                flexShrink: 1,
              }}
              type="BodyHeavy"
            >
              {homework.description}
            </Typography>
          )}
          <Stack flexDirection="row" gap="$2">
            <Typography type="CaptionLight" style={{ color: Colors.Black[2] }}>
              {dateString}
            </Typography>
            <ChevronRight color={Colors.Primary[1]} />
          </Stack>
        </XStack>
        {homework && (
          <Stack flexDirection="row" gap={5} alignItems="center">
            <Typography type="CaptionHeavy" style={{ color: handedInColor }}>
              {t("handedIn")} {homework.totalSubmittedStudents}/{homework.totalRegisteredStudents}
            </Typography>
            <Typography type="CaptionHeavy" style={{ color: Colors.Primary[1] }}>
              ·
            </Typography>
            <Typography type="CaptionHeavy" style={{ color: Colors.Primary[1] }}>
              {t("feedback")} {homework.totalFeedbackStudents}/{homework.totalRegisteredStudents}
            </Typography>
          </Stack>
        )}
      </Card>
    </TouchableOpacity>
  );
};

export default TeacherHomeworkItem;
