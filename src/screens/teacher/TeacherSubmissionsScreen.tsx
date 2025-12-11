import { FunctionComponent, useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TeacherSubmissionItem } from "components/teacher/TeacherSubmissionItem";
import { RootStackParamList } from "navigation/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteLesson, fetchLessonDetails } from "services/lessonsService";
import { t } from "locales/config";
import { Spinner, XStack } from "tamagui";
import { AppBar } from "components/AppBar";
import { Lessons_Dto_LessonSubmissionDto } from "__generated/apiTypes";
import { Alert, FlatList } from "react-native";
import { Colors } from "constants/Colors";
import { deleteAssignment } from "services/assigmentService";
import { toast } from "components/Toast";
import { SafeView } from "components/SafeView";
import { IconButton } from "components/buttons/IconButton";
import { actionSheet } from "components/ActionSheet";
import { OptionsIcon } from "components/icons/OptionsIcon";
import { addIf } from "utils/addIf";
import { Enum_AssignmentType } from "__generated/apiTypes/models/Enum_AssignmentType";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherSubmissions">;
export const LESSON_DETAILS_QUERY_KEY = "lessonDetails";

export const TeacherSubmissionsScreen: FunctionComponent<Props> = ({ route, navigation }) => {
  const { homework } = route.params;
  const { data, isLoading } = useQuery({
    queryKey: [LESSON_DETAILS_QUERY_KEY, homework.id],
    queryFn: () => fetchLessonDetails({ lessonId: homework.id }),
  });

  const { mutateAsync: deleteAssignmentAsync } = useMutation({
    mutationFn: deleteAssignment,
  });
  const { mutateAsync: deleteHomeworkAsync } = useMutation({
    mutationFn: deleteLesson,
  });

  const queryClient = useQueryClient();

  const submissions: Lessons_Dto_LessonSubmissionDto[] = useMemo(() => {
    if (data?.lessonSubmissions) {
      return data.lessonSubmissions?.sort((s) => (s.recording?.uri ? -1 : 1));
    }

    return [];
  }, [data?.lessonSubmissions]);

  return (
    <SafeView side="top" f={1}>
      <AppBar
        title={
          (homework.startPage && homework.endPage
            ? `${t("read")}: ${homework.startPage} - ${homework.endPage}`
            : homework.description) ?? ""
        }
        rightComponent={
          <XStack>
            <IconButton
              size="sm"
              icon={<OptionsIcon color={Colors.Primary[1]} />}
              onPress={() => {
                actionSheet.show({
                  options: [
                    {
                      title: t("open"),
                      onPress: () => {
                        navigation.navigate("Record", {
                          readOnly: true,
                          assignment: homework,
                        });
                      },
                    },
                    ...addIf(homework.typeId === Enum_AssignmentType._2, {
                      title: t("update"),
                      onPress: () => {
                        navigation.navigate("TeacherCreateHomework", {
                          teamId: homework.teamId,
                          assignment: homework,
                        });
                      },
                    }),
                    ...addIf(homework.typeId === Enum_AssignmentType._2, {
                      title: t("delete"),
                      destructive: true,
                      onPress: () => {
                        Alert.alert(
                          t("submissionScreen.deleteAssignment"),
                          t("submissionScreen.deleteAssignmentDescription"),
                          [
                            {
                              text: t("cancel"),
                              style: "cancel",
                            },
                            {
                              text: t("delete"),
                              style: "destructive",
                              onPress: async () => {
                                try {
                                  if (homework.typeId === Enum_AssignmentType._1) {
                                    await deleteHomeworkAsync(homework.id);
                                  } else {
                                    await deleteAssignmentAsync(homework.assignmentId);
                                  }
                                  queryClient.refetchQueries({ queryKey: ["assignments"] });
                                  navigation.goBack();
                                } catch (e) {
                                  toast.reportError(e);
                                }
                              },
                            },
                          ]
                        );
                      },
                    }),
                  ],
                });
              }}
            />
          </XStack>
        }
      />
      {isLoading || !data ? (
        <Spinner py="$10" />
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={(submission, index) =>
            (submission.id ?? "") + (submission.student?.id ?? index)
          }
          contentContainerStyle={{
            gap: 16,
            marginHorizontal: 16,
            paddingBottom: 40,
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
    </SafeView>
  );
};
