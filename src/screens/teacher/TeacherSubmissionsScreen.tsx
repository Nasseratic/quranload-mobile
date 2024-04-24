import { FunctionComponent, useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TeacherSubmissionItem } from "components/teacher/TeacherSubmissionItem";
import { RootStackParamList } from "navigation/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLessonDetails } from "services/lessonsService";
import { t } from "locales/config";
import { Spinner, Text, XStack } from "tamagui";
import { AppBar } from "components/AppBar";
import { Lessons_Dto_LessonSubmissionDto } from "__generated/apiTypes";
import { Alert, FlatList } from "react-native";
import { BinIcon } from "components/icons/BinIcon";
import { OpenLinkIcon } from "components/icons/OpenLinkIcon";
import { Colors } from "constants/Colors";
import { deleteAssignment } from "services/assigmentService";
import { toast } from "components/Toast";
import { SafeView } from "components/SafeView";

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
    <SafeView side="top" f={1}>
      <AppBar
        title={
          (homework.startPage && homework.endPage
            ? `${t("read")}: ${homework.startPage} - ${homework.endPage}`
            : homework.description) ?? ""
        }
        // Old implementation of the delete option in the header
        /*    rightComponent={
              <IconButton
                size="md"
                icon={<BinIcon size={20} color={Colors.Black[2]} />}
                onPress={async () => {
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
                            await mutateAsync(homework.assignmentId);
                            queryClient.refetchQueries(["assignments"]);
                          } catch (e) {
                            toast.reportError(e);
                          }
                        },
                      },
                    ],
                    "default"
                  );
                }}
              />
            }
        */
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
            paddingBottom: 40,
          }}
          // View and delete homework options
          ListHeaderComponent={
            <XStack ai="center" jc="flex-end" mb={20} gap={20}>
              <XStack
                gap={10}
                pressStyle={{ opacity: 0.6 }}
                onPress={async () => {
                  navigation.navigate("Record", {
                    readOnly: true,
                    assignment: {
                      ...homework,
                    },
                  });
                }}
              >
                <Text>{t("view")}</Text>
                <OpenLinkIcon size={20} color={Colors.Black[2]} />
              </XStack>
              <XStack
                gap={10}
                pressStyle={{ opacity: 0.6 }}
                onPress={async () => {
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
                            await mutateAsync(homework.assignmentId);
                            queryClient.refetchQueries(["assignments"]);
                          } catch (e) {
                            toast.reportError(e);
                          }
                        },
                      },
                    ],
                    "default"
                  );
                }}
              >
                <Text>{t("delete")}</Text>
                <BinIcon size={20} color={Colors.Black[2]} />
              </XStack>
            </XStack>
          }
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
