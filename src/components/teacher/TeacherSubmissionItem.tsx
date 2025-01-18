import Typography from "components/Typography";
import ChevronRight from "components/icons/ChevronRight";
import { Colors } from "constants/Colors";
import { useMemo } from "react";
import { Card, Stack } from "tamagui";
import { TouchableOpacity } from "react-native";
import { Lessons_Dto_LessonSubmissionDto } from "__generated/apiTypes/models/Lessons_Dto_LessonSubmissionDto";
import { t } from "locales/config";

interface Props {
  submission: Lessons_Dto_LessonSubmissionDto;
  onPress?: () => void;
}

export const TeacherSubmissionItem = ({ submission, onPress }: Props) => {
  const handedInColor = useMemo(() => {
    if (submission.recording?.uri) return Colors.Success[1];
    return Colors.Error[1];
  }, [submission]);
  const isSubmitted = !!submission.recording?.uri;
  const isFeedbackGiven = !!submission.feedback?.uri;

  return (
    <TouchableOpacity onPress={onPress} disabled={!isSubmitted}>
      <Card
        padding="$2.5"
        backgroundColor="$white1"
        borderColor="$gray5"
        borderWidth={1}
        gap="$2"
        opacity={isSubmitted ? 1 : 0.6}
      >
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          <Typography type="BodyHeavy" style={{ color: Colors.Primary[1] }}>
            {submission.student?.fullName}
          </Typography>
          <Stack flexDirection="row" gap="$2">
            {/* {submission.submittedAtDate && (
              <Typography type="CaptionLight" style={{ color: Colors.Black[2] }}>
                {format(submission.submittedAtDate, "dd-MM-yyyy")}
              </Typography>
            )} */}
            <ChevronRight color={Colors.Primary[1]} />
          </Stack>
        </Stack>
        <Stack flexDirection="row" gap="$1" alignItems="center">
          <Typography type="CaptionHeavy" style={{ color: handedInColor }}>
            {isSubmitted ? t("handedIn") : t("notHandedIn")}
          </Typography>
          {isSubmitted && (
            <>
              <Typography type="CaptionHeavy" style={{ color: Colors.Primary[1] }}>
                {" "}
                ·{" "}
              </Typography>
              <Typography
                type="CaptionHeavy"
                style={{
                  color: isFeedbackGiven ? Colors.Success[1] : Colors.Error[1],
                }}
              >
                {t("feedback")}
              </Typography>
            </>
          )}
        </Stack>
      </Card>
    </TouchableOpacity>
  );
};
