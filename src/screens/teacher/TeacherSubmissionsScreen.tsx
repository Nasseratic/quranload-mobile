import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import TeacherSubmissionItem from "components/teacher/TeacherSubmissionItem";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "TeacherSubmissions">;

export const TeacherSubmissionsScreen: FunctionComponent<Props> = ({ route }) => {
  const { homework } = route.params;
  return (
    <QuranLoadView
      appBar={{
        title: homework.description,
      }}
    >
      {homework.submissions.map((submission, index) => (
        <TeacherSubmissionItem key={index} submission={submission} />
      ))}
    </QuranLoadView>
  );
};
