import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import { TeacherSubmissionItem } from "components/teacher/TeacherSubmissionItem";
import { RootStackParamList } from "navigation/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchLessonDetails } from "services/lessonsService";
import { Loader } from "components/Loader";
import { t } from "locales/config";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherSubmissions">;

export const TeacherSubmissionsScreen: FunctionComponent<Props> = ({ route, navigation }) => {
  const { homework } = route.params;
  const { data, isLoading } = useQuery(["lesson-details", homework.id], () =>
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
        <Loader />
      ) : (
        data.lessonSubmissions?.map((submission, index) => (
          <TeacherSubmissionItem
            key={index}
            submission={submission}
            onPress={() => navigation.navigate("Record", { assignment: homework })}
          />
        ))
      )}
    </QuranLoadView>
  );
};
