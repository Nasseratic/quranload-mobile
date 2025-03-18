import { FunctionComponent, useState, useRef, useMemo, Fragment } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Alert, StyleSheet, FlatList, Modal, ActivityIndicator, Share } from "react-native";
import { RootStackParamList } from "navigation/navigation";
import { useAuth, useUser } from "contexts/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "constants/Colors";
import { AudioPlayer } from "components/AudioPlayer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteSubmission,
  fetchFeedbackUrl,
  fetchRecordingUrl,
  submitLessonRecording,
} from "services/lessonsService";
import { IconButton } from "components/buttons/IconButton";
import { BinIcon } from "components/icons/BinIcon";
import { Button, Square, Stack, XStack, Text } from "tamagui";
import { t } from "locales/config";
import { IconSwitch } from "components/IconSwitch";
import Carousel from "react-native-reanimated-carousel";
import { ICarouselInstance } from "react-native-reanimated-carousel";
import { IS_IOS, SCREEN_HEIGHT, SCREEN_WIDTH } from "constants/GeneralConstants";
import { match } from "ts-pattern";
import { deleteFeedback, submitFeedback } from "services/feedbackService";
import { isNotNullish } from "utils/notNullish";
import { Recorder } from "components/Recorder";
import { AssignmentStatusEnum } from "types/Lessons";
import { BookIcon } from "components/icons/BookIcon";
import { SpeakerIcon } from "components/icons/SpeakerIcon";
import { AssignmentTypeEnum } from "services/assigmentService";
import { MushafPages } from "components/Mushaf/MushafPages";
import { ChevronLeftIcon } from "assets/icons";
import Typography from "components/Typography";
import { getMediaUri } from "services/mediaService";
import { LESSON_DETAILS_QUERY_KEY } from "screens/teacher/TeacherSubmissionsScreen";
import { ImageWithAuth } from "components/Image";
import { useKeepAwake } from "expo-keep-awake";
import { CrossIcon } from "components/icons/CrossIcon";
import { cvx, useCvxMutation } from "api/convex";
import LottieView from "lottie-react-native";
import UploadingLottie from "assets/lottie/uploading.json";
import { Sentry } from "utils/sentry";
import { track } from "utils/tracking";

type Props = NativeStackScreenProps<RootStackParamList, "Record">;

export const RecordScreen: FunctionComponent<Props> = ({ route, navigation }) => {
  useKeepAwake();
  const queryClient = useQueryClient();
  const carouselRef = useRef<ICarouselInstance>(null);
  const insets = useSafeAreaInsets();
  const celebrateSubmission = useCvxMutation(cvx.messages.celebrateSubmission);
  const { role, isTeacher, isStudent } = useAuth();
  const user = useUser();

  const isReadOnly = route.params.readOnly;
  const assignment = route.params.assignment;
  const studentId = route.params.studentId ?? user!.id;
  const lessonId = assignment.id;
  const recordingId = assignment.recordingUrl ?? undefined;
  const feedbackId = assignment.feedbackUrl ?? undefined;

  const { data: submissionUrl, isLoading: isLoadingSubmissionUrl } = useQuery(
    ["recordingUrl", recordingId],
    () => recordingId && fetchRecordingUrl({ lessonId, recordingId, studentId }),
    { enabled: !!recordingId }
  );

  const { data: feedbackUrl, isLoading: isLoadingFeedbackUrl } = useQuery(
    ["feedbackUrl", feedbackId],
    () => feedbackId && fetchFeedbackUrl({ lessonId, feedbackId, studentId }),
    { enabled: !!feedbackId }
  );

  const attachments = useMemo(
    () => assignment.attachments?.map((attachment) => attachment.id).filter(isNotNullish),
    [assignment.attachments]
  );
  const type = route.params.assignment.typeId as unknown as AssignmentTypeEnum;
  const isCustomAssignment = type === AssignmentTypeEnum.Custom;

  const [isCustomHomeworkDetailsShown, setIsCustomHomeworkDetailsShown] = useState(
    isStudent && !recordingId && !feedbackId
  );
  const [carouselIndex, setCarouselIndex] = useState<0 | 1>(0);
  const [audio, setAudio] = useState<{
    uri: string;
    duration: number;
  } | null>(null);
  const studentSubmission = useMutation(submitLessonRecording, {
    onSuccess: () => {
      queryClient.invalidateQueries(["assignments"]);
    },
  });

  const teacherFeedback = useMutation(submitFeedback, {
    onSuccess: () => {
      queryClient.invalidateQueries(["assignments"]);
      queryClient.invalidateQueries([LESSON_DETAILS_QUERY_KEY, lessonId]);
    },
  });

  const onDelete = () => {
    match(role)
      .with("Teacher", () => deleteFeedback({ lessonId, studentId }))
      .with("Student", () => deleteSubmission({ lessonId, studentId }))
      .exhaustive()
      .then(() => {
        queryClient.invalidateQueries(["assignments"]);
        queryClient.invalidateQueries([LESSON_DETAILS_QUERY_KEY, lessonId]);
      });
    navigation.setParams({
      assignment: {
        ...route.params.assignment,
        [isTeacher ? "feedbackUrl" : "recordingUrl"]: null,
      },
    });
    setAudio(null);
    teacherFeedback.reset();
    studentSubmission.reset();
  };

  const showErrorAlert = (audio: { uri: string; duration: number }) => {
    if (!audio) {
      return;
    }
    Alert.alert(t("recordingScreen.errorModalTitle"), t("recordingScreen.errorModalMessage"), [
      {
        text: t("recordingScreen.shareToWhatsApp"),
        onPress: () => {
          track("PressedShareRecodingToWhatsApp");
          onShare(audio.uri);
        },
      },
      {
        text: t("recordingScreen.retryUpload"),
        onPress: async () => {
          try {
            track("RetriedUploadRecording");
            await handleRecordingSubmit(audio);
          } finally {
          }
        },
      },
      {
        text: t("cancel"),
        onPress: () => {
          track("DiscardedRecordingUploadErrorAlert");
        },
      },
    ]);
  };

  const handleRecordingSubmit = async ({ uri, duration }: { uri: string; duration: number }) => {
    try {
      if (duration === 0) {
        throw new Error("Duration is 0");
      }
      await match(role)
        .with("Teacher", () =>
          teacherFeedback.mutateAsync({
            uri,
            lessonId,
            studentId,
            lessonState: AssignmentStatusEnum.accepted,
          })
        )
        .with("Student", async () => {
          await studentSubmission.mutateAsync({
            uri,
            lessonId,
            duration,
          });

          try {
            const celebrateWithTeamId = user.teams.find(({ isActive }) => isActive)?.id;
            if (celebrateWithTeamId) {
              await celebrateSubmission({
                senderId: user.id,
                senderName: user.fullName,
                teamId: celebrateWithTeamId,
                submission:
                  assignment.startPage && assignment.endPage
                    ? assignment
                    : assignment.description ?? "",
              });
            }
          } catch {
            // ignore for now
          }
        })
        .exhaustive();
      track("RecordingUploaded", { duration });
    } catch (e) {
      Sentry.captureException(e, {
        tags: {
          module: "RecordScreen.handleRecordingSubmit",
        },
        extra: {
          uri,
          duration,
        },
      });
      showErrorAlert({ uri, duration });
      track("RecordingUploadFailed", { duration });
      throw e;
    }
  };

  const onShare = (uri: string) => {
    Share.share({
      message: t("recordingScreen.shareMessage"),
      url: uri,
    });
  };

  const carouselItems = useMemo(
    () =>
      [
        // if teacher show submission by default else show feedback
        match(role)
          .with("Teacher", () => submissionUrl)
          .with("Student", () => feedbackUrl)
          .exhaustive(),
        match(role)
          .with("Teacher", () => feedbackUrl ?? audio?.uri ?? "RECORDER")
          .with("Student", () => submissionUrl ?? audio?.uri ?? "RECORDER")
          .exhaustive(),
      ].filter(isNotNullish),
    [audio, submissionUrl, feedbackUrl, role]
  );

  const shouldAllowDeleteForIndex = match(role)
    .with("Teacher", () => carouselIndex === 1 && (!!feedbackId || !!audio))
    .with("Student", () => carouselIndex === carouselItems.length - 1 && (!!recordingId || !!audio))
    .exhaustive();
  if ((!!recordingId && isLoadingSubmissionUrl) || (!!feedbackId && isLoadingFeedbackUrl)) {
    return (
      <Stack f={1}>
        <XStack mt={insets.top} gap="$2" ai="center">
          <Square p="$3" px="$4" onPress={() => navigation.goBack()}>
            <ChevronLeftIcon color={Colors.Black[1]} />
          </Square>
        </XStack>
        <Square f={1}>
          <ActivityIndicator size="large" />
        </Square>
      </Stack>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {match(type)
        .with(AssignmentTypeEnum.Custom, () => (
          <Fragment>
            <XStack mt={insets.top} gap="$2" ai="center">
              <Square p="$3" px="$4" onPress={() => navigation.goBack()}>
                <ChevronLeftIcon color={Colors.Black[1]} />
              </Square>
              <Typography
                type="TitleLight"
                style={{
                  flex: 1,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {assignment.description}
              </Typography>
              {isCustomAssignment && !isCustomHomeworkDetailsShown && (
                <Square p="$3" px="$4" onPress={() => setIsCustomHomeworkDetailsShown(true)}>
                  <BookIcon color={Colors.Black[1]} />
                </Square>
              )}
            </XStack>
            <Stack f={1}>
              {attachments && <ImagePages imageIds={attachments} />}
              {isCustomAssignment && isCustomHomeworkDetailsShown && (
                <Modal visible transparent>
                  <Stack
                    backgroundColor="rgba(255, 255, 255, 0.9)"
                    f={1}
                    jc="space-between"
                    ai="center"
                    px={24}
                    pt={insets.top + 32}
                    pb={insets.bottom + 24}
                  >
                    <Stack gap={4} w={"100%"}>
                      <Typography type="TitleHeavy">{t("description")}:</Typography>
                      <Typography type="Body">{assignment.description}</Typography>
                    </Stack>
                    <IconButton
                      bg="gray"
                      icon={<CrossIcon color="white" />}
                      onPress={() => setIsCustomHomeworkDetailsShown(false)}
                    />
                  </Stack>
                </Modal>
              )}
            </Stack>
          </Fragment>
        ))
        .with(AssignmentTypeEnum.Auto, () => (
          <MushafPages
            pageFrom={route.params.assignment.startPage}
            pageTo={route.params.assignment.endPage}
          />
        ))
        .otherwise(() => null)}
      {!isReadOnly && (
        <Stack
          style={[
            styles.shadow,
            {
              backgroundColor: "#fff",
            },
          ]}
          bottom={0}
          pb={insets.bottom}
          position="absolute"
        >
          {(teacherFeedback.isError || studentSubmission.isError) && (
            <XStack
              bg="$red10"
              p={12}
              onPress={() => {
                if (audio) {
                  showErrorAlert(audio);
                }
              }}
              jc="space-between"
              pressStyle={{ opacity: 0.8 }}
            >
              <Typography
                type="Body"
                style={{
                  color: "white",
                }}
              >
                {t("recordingScreen.uploadFailed")}
              </Typography>
              <Typography
                style={{
                  color: "white",
                }}
                type="Body"
              >
                {t("retry")}
              </Typography>
            </XStack>
          )}
          <Stack pt="$3" jc="flex-end" ai="center">
            <Carousel
              data={carouselItems}
              width={SCREEN_WIDTH}
              height={(IS_IOS ? 40 : 90) + insets.bottom}
              renderItem={({ item, index }) =>
                item === "RECORDER" ? (
                  <Recorder
                    lessonId={lessonId}
                    onFinished={(audio) => setAudio(audio)}
                    onSubmit={handleRecordingSubmit}
                    onStatusChange={(status, recordings) => {
                      match(status)
                        .with("paused", () => {
                          track("RecordingPaused");
                        })
                        .with("recording", () => {
                          track(recordings.length > 0 ? "RecordingResumed" : "RecodingStarted");
                        })
                        .with("submitting", () => {
                          track("RecordingSubmitPressed", { screen: "RecordScreen" });
                        })
                        .otherwise(() => {});
                    }}
                  />
                ) : (
                  <AudioPlayer uri={item} isVisible={index === carouselIndex} />
                )
              }
              ref={carouselRef}
              scrollAnimationDuration={750}
              loop={false}
              enabled={false}
            />
            <XStack
              jc="space-between"
              pointerEvents="box-none"
              ai="flex-end"
              w="100%"
              position="absolute"
              bottom={IS_IOS ? -8 : 10}
              px="$4"
            >
              {(isTeacher ? recordingId : feedbackId) && (
                <IconSwitch
                  value={carouselIndex === 1}
                  offIcon={(val) => (
                    <SpeakerIcon size={18} color={val ? Colors.Gray[1] : Colors.White[1]} />
                  )}
                  onIcon={(val) => (
                    <BookIcon size={24} color={val ? Colors.White[1] : Colors.Gray[1]} />
                  )}
                  invertIcons={isTeacher}
                  onChange={(value) => {
                    setCarouselIndex(value ? 1 : 0);
                    carouselRef.current?.scrollTo({ index: value ? 1 : 0 });
                  }}
                />
              )}
              {shouldAllowDeleteForIndex && (
                <XStack ai="center" jc="flex-end" gap="$2" px={4} pointerEvents="box-none">
                  <IconButton
                    onPress={() =>
                      Alert.alert(
                        t("recordingScreen.deleteRecording"),
                        t("recordingScreen.deleteRecordingDescription"),
                        [
                          {
                            text: t("cancel"),
                            style: "cancel",
                          },

                          {
                            text: t("delete"),
                            style: "destructive",
                            onPress: onDelete,
                          },
                        ]
                      )
                    }
                    icon={<BinIcon size={20} color={Colors.Black[2]} />}
                    size="sm"
                  />
                </XStack>
              )}
            </XStack>
          </Stack>
        </Stack>
      )}
      {(studentSubmission.isLoading || teacherFeedback.isLoading) && (
        <Modal visible transparent>
          <Stack f={1} gap={64} jc="center" ai="center" bg="rgba(0,0,0,0.7)">
            <LottieView
              source={UploadingLottie}
              autoPlay
              loop={true}
              style={{ width: 180, height: 180 }}
            />
            <Stack gap={8} ai="center">
              <Text color="whitesmoke" fontSize={20}>
                Uploading...
              </Text>
              <Text fontSize={16} color="$gray8Light">
                Please do not close the app
              </Text>
            </Stack>
          </Stack>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 25,
  },
});

const ImagePages = ({ imageIds }: { imageIds: string[] }) => {
  const images = imageIds.map((id) => getMediaUri(id));
  const insets = useSafeAreaInsets();

  return (
    <FlatList
      style={{ flex: 1 }}
      data={images}
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      horizontal
      inverted
      renderItem={({ item }) =>
        item ? (
          <Square pb={(IS_IOS ? 40 : 90) + insets.bottom}>
            <ImageWithAuth
              objectFit="contain"
              key={item}
              bg="$colorTransparent"
              source={{
                uri: item,
              }}
              w={SCREEN_WIDTH}
              h="100%"
            />
          </Square>
        ) : null
      }
    />
  );
};
