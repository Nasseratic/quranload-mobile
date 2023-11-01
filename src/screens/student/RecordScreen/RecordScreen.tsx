import { FunctionComponent, useState, useRef, useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Alert, StyleSheet } from "react-native";
import { MushafPages } from "components/Mushaf/MushafPages";
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
import { Stack, XStack } from "tamagui";
import { t } from "locales/config";
import { IconSwitch } from "components/IconSwitch";
import Carousel from "react-native-reanimated-carousel";
import { ICarouselInstance } from "react-native-reanimated-carousel";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { match } from "ts-pattern";
import { deleteFeedback, submitFeedback } from "services/feedbackService";
import { isNotNullish } from "utils/notNullish";
import { RecordingScreenRecorder } from "screens/student/RecordScreen/RecordScreenRecorder";
import { AssignmentStatusEnum } from "types/Lessons";
import { BookIcon } from "components/icons/BookIcon";
import { SpeakerIcon } from "components/icons/SpeakerIcon";

type Props = NativeStackScreenProps<RootStackParamList, "Record">;

export const RecordScreen: FunctionComponent<Props> = ({ route, navigation }) => {
  const carouselRef = useRef<ICarouselInstance>(null);
  const insets = useSafeAreaInsets();

  const { user, role, isTeacher } = useAuth();

  const studentId = route.params.studentId ?? user!.id;
  const lessonId = route.params.assignment.id;
  const recordingId = route.params.assignment.recordingUrl ?? undefined;
  const feedbackId = route.params.assignment.feedbackUrl ?? undefined;

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
    },
  });

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
  console.log(carouselItems);
  const queryClient = useQueryClient();

  const shouldAllowDeleteForIndex = match(role)
    .with("Teacher", () => carouselIndex === 1 && (!!feedbackId || !!audioUrl))
    .with(
      "Student",
      () => carouselIndex === carouselItems.length - 1 && (!!recordingId || !!audioUrl)
    )
    .exhaustive();

  return (
    <View style={{ flex: 1 }}>
      <MushafPages
        pageFrom={route.params.assignment.startPage}
        pageTo={route.params.assignment.endPage}
      />
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
            height={40 + insets.bottom}
            renderItem={({ item }) =>
              item === "RECORDER" ? (
                <RecordingScreenRecorder
                  lessonId={lessonId}
                  onSubmit={({ uri, duration }) => {
                    setAudioUrl(uri);
                    match(role)
                      .with("Teacher", () => {
                        teacherFeedback.mutateAsync({
                          uri,
                          lessonId,
                          studentId,
                          lessonState: AssignmentStatusEnum.accepted,
                        });
                      })
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
                <AudioPlayer uri={item} />
              )
            }
            ref={carouselRef}
            scrollAnimationDuration={750}
            loop={false}
            enabled={false}
          />
          <XStack jc="space-between" pointerEvents="box-none" position="absolute" w="100%">
            <View>
              {(isTeacher || (feedbackId && recordingId)) && (
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
            </View>
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
                        onPress: () => {
                          match(role)
                            .with("Teacher", () => deleteFeedback({ lessonId, studentId }))
                            .with("Student", () => deleteSubmission({ lessonId, studentId }))
                            .exhaustive();
                          navigation.setParams({
                            assignment: {
                              ...route.params.assignment,
                              [isTeacher ? "feedbackUrl" : "recordingUrl"]: null,
                            },
                          });
                          setAudioUrl(null);
                        },
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
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});
