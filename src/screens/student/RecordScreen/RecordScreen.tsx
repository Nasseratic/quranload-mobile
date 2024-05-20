import { FunctionComponent, useState, useRef, useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Alert, StyleSheet, FlatList } from "react-native";
import { RootStackParamList } from "navigation/navigation";
import { useAuth } from "contexts/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "constants/Colors";
import { AudioPlayer } from "components/AudioPlayer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteSubmission,
  getFeedbackUrl,
  getRecordingUrl,
  submitLessonRecording,
} from "services/lessonsService";
import { IconButton } from "components/buttons/IconButton";
import { BinIcon } from "components/icons/BinIcon";
import { Square, Stack, XStack } from "tamagui";
import { t } from "locales/config";
import { IconSwitch } from "components/IconSwitch";
import Carousel from "react-native-reanimated-carousel";
import { ICarouselInstance } from "react-native-reanimated-carousel";
import { IS_IOS, SCREEN_WIDTH } from "constants/GeneralConstants";
import { match } from "ts-pattern";
import { deleteFeedback, submitFeedback } from "services/feedbackService";
import { isNotNullish } from "utils/notNullish";
import { RecordingScreenRecorder } from "screens/student/RecordScreen/RecordScreenRecorder";
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

type Props = NativeStackScreenProps<RootStackParamList, "Record">;

export const RecordScreen: FunctionComponent<Props> = ({ route, navigation }) => {
  const queryClient = useQueryClient();

  const carouselRef = useRef<ICarouselInstance>(null);
  const insets = useSafeAreaInsets();

  const { user, role, isTeacher } = useAuth();

  const isReadOnly = route.params.readOnly;
  const assignment = route.params.assignment;
  const studentId = route.params.studentId ?? user!.id;
  const lessonId = assignment.id;
  const recordingId = assignment.recordingUrl ?? undefined;
  const feedbackId = assignment.feedbackUrl ?? undefined;
  const attachments = useMemo(
    () => assignment.attachments?.map((attachment) => attachment.id).filter(isNotNullish),
    [assignment.attachments]
  );
  const type = route.params.assignment.typeId;

  const [carouselIndex, setCarouselIndex] = useState<0 | 1>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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
    setAudioUrl(null);
  };

  const feedbackUrl = feedbackId && getFeedbackUrl({ lessonId, feedbackId, studentId });
  const submissionUrl = recordingId && getRecordingUrl({ lessonId, recordingId, studentId });

  const carouselItems = useMemo(
    () =>
      [
        // if teacher show submission by default else show feedback
        match(role)
          .with("Teacher", () => submissionUrl)
          .with("Student", () => feedbackUrl)
          .exhaustive(),
        match(role)
          .with("Teacher", () => feedbackUrl ?? audioUrl ?? "RECORDER")
          .with("Student", () => submissionUrl ?? audioUrl ?? "RECORDER")
          .exhaustive(),
      ].filter(isNotNullish),
    [audioUrl, submissionUrl, feedbackUrl, role]
  );

  const shouldAllowDeleteForIndex = match(role)
    .with("Teacher", () => carouselIndex === 1 && (!!feedbackId || !!audioUrl))
    .with(
      "Student",
      () => carouselIndex === carouselItems.length - 1 && (!!recordingId || !!audioUrl)
    )
    .exhaustive();

  return (
    <View style={{ flex: 1 }}>
      {match(type as unknown as AssignmentTypeEnum)
        .with(AssignmentTypeEnum.Custom, () => (
          <>
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
            </XStack>
            {attachments && <ImagePages imageIds={attachments} />}
          </>
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
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <Stack pt="$3" px="$4" jc="flex-end" ai="center">
            <Carousel
              data={carouselItems}
              width={SCREEN_WIDTH}
              height={(IS_IOS ? 40 : 90) + insets.bottom}
              renderItem={({ item, index }) =>
                item === "RECORDER" ? (
                  <RecordingScreenRecorder
                    lessonId={lessonId}
                    onSubmit={({ uri, duration }) => {
                      setAudioUrl(uri);
                      return match(role)
                        .with("Teacher", () =>
                          teacherFeedback.mutateAsync({
                            uri,
                            lessonId,
                            studentId,
                            lessonState: AssignmentStatusEnum.accepted,
                          })
                        )
                        .with("Student", () =>
                          studentSubmission.mutateAsync({
                            uri,
                            lessonId,
                            duration,
                          })
                        )
                        .exhaustive();
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
              bottom={IS_IOS ? -4 : 10}
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
              )}
            </XStack>
          </Stack>
        </Stack>
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
          <ImageWithAuth
            resizeMode="contain"
            key={item}
            bg="$background"
            source={{
              uri: item,
            }}
            w={SCREEN_WIDTH}
            h="100%"
          />
        ) : null
      }
    />
  );
};
