import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import { TeacherSubmissionItem } from "components/teacher/TeacherSubmissionItem";
import { RootStackParamList } from "navigation/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchLessonDetails } from "services/lessonsService";
import { t } from "locales/config";
import { Spinner } from "tamagui";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherSubmissions">;
export const LESSON_DETAILS_QUERY_KEY = "lessonDetails";

export const TeacherSubmissionsScreen: FunctionComponent<Props> = ({ route, navigation }) => {
  const { homework } = route.params;
  const { data, isLoading } = useQuery([LESSON_DETAILS_QUERY_KEY, homework.id], () =>
    fetchLessonDetails({ lessonId: homework.id })
  );

  return (
    <QuranLoadView
      appBar={{
        title:
          (homework.startPage && homework.endPage
            ? `${t("read")}: ${homework.startPage} - ${homework.endPage}`
            : homework.description) ?? "",
      }}
    >
      {isLoading || !data ? (
        <Spinner py="$10" />
      ) : (
        data.lessonSubmissions
          ?.sort((s) => (s.recording?.uri ? -1 : 1))
          .map((submission, index) => (
            <TeacherSubmissionItem
              key={index}
              submission={submission}
              onPress={() =>
                navigation.navigate("Record", {
                  studentId: submission?.student?.id ?? undefined,
                  assignment: {
                    ...homework,
                    recordingUrl: submission.recording?.uri ?? null,
                    feedbackUrl: submission.feedback?.uri ?? null,
                  },
                })
              }
            />
          ))
      )}
    </QuranLoadView>
  );
};
