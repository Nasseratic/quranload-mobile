import { FunctionComponent, useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TeacherSubmissionItem } from "components/teacher/TeacherSubmissionItem";
import { RootStackParamList } from "navigation/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLessonDetails } from "services/lessonsService";
import { t } from "locales/config";
import { Spinner } from "tamagui";
import { AppBar } from "components/AppBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Lessons_Dto_LessonSubmissionDto } from "__generated/apiTypes";
import { FlatList } from "react-native";
import { IconButton } from "components/buttons/IconButton";
import { BinIcon } from "components/icons/BinIcon";
import { Colors } from "constants/Colors";
import { deleteAssignment } from "services/assigmentService";
import { toast } from "components/Toast";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherSubmissions">;
export const LESSON_DETAILS_QUERY_KEY = "lessonDetails";

export const TeacherSubmissionsScreen: FunctionComponent<Props> = ({ route, navigation }) => {
  const { homework } = route.params;
  const { data, isLoading } = useQuery([LESSON_DETAILS_QUERY_KEY, homework.id], () =>
    fetchLessonDetails({ lessonId: homework.id })
  );

  const { mutateAsync } = useMutation(deleteAssignment);

  const queryClient = useQueryClient();

  const submissions: Lessons_Dto_LessonSubmissionDto[] = useMemo(() => {
    if (data?.lessonSubmissions) {
      return data.lessonSubmissions?.sort((s) => (s.recording?.uri ? -1 : 1));
    }

    return [];
  }, [data?.lessonSubmissions]);

  return (
    <SafeAreaView>
      <AppBar
        title={
          (homework.startPage && homework.endPage
            ? `${t("read")}: ${homework.startPage} - ${homework.endPage}`
            : homework.description) ?? ""
        }
        rightComponent={
          <IconButton
            size="md"
            icon={<BinIcon size={20} color={Colors.Black[2]} />}
            onPress={async () => {
              try {
                await mutateAsync(homework.assignmentId);
                queryClient.refetchQueries(["assignments"]);
              } catch (e) {
                toast.reportError(e);
              }
            }}
          />
        }
      />
      {isLoading || !data ? (
        <Spinner py="$10" />
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={(submission, index) => submission.id ?? index.toString()}
          contentContainerStyle={{
            gap: 16,
            marginHorizontal: 16,
            paddingBottom: 16,
          }}
          renderItem={({ item }) => (
            <TeacherSubmissionItem
              submission={item}
              onPress={() =>
                navigation.navigate("Record", {
                  studentId: item?.student?.id ?? undefined,
                  assignment: {
                    ...homework,
                    recordingUrl: item.recording?.uri ?? null,
                    feedbackUrl: item.feedback?.uri ?? null,
                  },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};
