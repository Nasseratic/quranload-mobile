import { FunctionComponent, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card, Circle, Form, Label, ScrollView, Stack, TextArea, View, XStack } from "tamagui";
import ActionButton from "components/buttons/ActionBtn";
import { RootStackParamList } from "navigation/navigation";
import { DatePickerInput } from "components/DatePicker";
import PlusIcon from "components/icons/PlusIcon";
import Typography from "components/Typography";
import { CrossIcon } from "components/icons/CrossIcon";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomAssignment, updateCustomAssignment } from "services/assigmentService";
import { t } from "locales/config";
import { useMediaUploader } from "hooks/useMediaPicker";
import { AppBar } from "components/AppBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "components/Toast";
import { ImageViewer, ImageViewerRef, ImageWrapper } from "react-native-reanimated-viewer";
import { isNotNullish } from "utils/notNullish";
import { useAuth } from "contexts/auth";
import { ImageWithAuth } from "components/Image";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherCreateHomework">;

export const TeacherCreateHomeworkScreen: FunctionComponent<Props> = ({ route, navigation }) => {
  const isEditing = !!route.params.assignment;

  const [startDate, setStartDate] = useState<Date | undefined>(
    route.params.assignment?.startDate ? new Date(route.params.assignment.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    route.params.assignment?.endDate ? new Date(route.params.assignment.endDate) : undefined
  );
  const [description, setDescription] = useState<string>(
    route.params.assignment?.description ?? ""
  );
  const imageViewerRef = useRef<ImageViewerRef>(null);
  const { accessToken } = useAuth();
  const { pickImage, images, removeImage, uploadSelectedMedia, isUploading } = useMediaUploader({
    initialRemoteMedia: route.params.assignment?.attachments ?? undefined,
  });
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["createCustomAssignment"],
    mutationFn: async () => {
      const attachments = await uploadSelectedMedia();
      const deletedAttachments = route.params.assignment?.attachments
        ?.filter(isNotNullish)
        .filter((attachment) => !attachments.find((a) => a?.id === attachment.id));
      const assignment = {
        teamId: route.params.teamId,
        startDate: (startDate ?? new Date()).toISOString(),
        endDate: (endDate ?? new Date()).toISOString(),
        description,
        attachments: [
          ...attachments
            .filter(isNotNullish)
            .filter(({ uri }) => uri)
            .map((attachment, i) => ({
              id: attachment.id,
              uri: attachment.uri,
              sortOrder: i,
              isActive: true,
            })),
          ...(deletedAttachments?.map((attachment, i) => ({
            id: attachment.id,
            uri: attachment.uri,
            sortOrder: attachments.length + i,
            isDeleted: true,
          })) ?? []),
        ],
      };
      return isEditing
        ? updateCustomAssignment({
            id: route.params.assignment.assignmentId,
            ...assignment,
          })
        : createCustomAssignment(assignment);
    },
  });

  const handleSubmit = async () => {
    try {
      await mutateAsync();
      navigation.goBack();
      navigation.goBack();
      queryClient.refetchQueries({ queryKey: ["assignments"] });
    } catch (e) {
      toast.reportError(e);
    }
  };

  const isSubmitDisabled =
    !startDate ||
    !endDate ||
    !description.trim() ||
    isUploading ||
    images.length === 0 ||
    isPending;

  return (
    <SafeAreaView>
      <AppBar title={t("createHomework")} />
      <ImageViewer
        ref={imageViewerRef}
        data={images.map((image) => ({
          key: image,
          source: {
            uri: image,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        }))}
      />
      <Form onSubmit={handleSubmit} gap="$3.5" marginHorizontal={16}>
        <View gap="$2">
          <Label htmlFor="startDate" unstyled>
            {t("startDate")}
          </Label>
          <DatePickerInput
            minDate={new Date()}
            placeholder={t("chooseStartDate")}
            value={startDate}
            onChange={(date) => {
              if (!endDate || date > endDate) setEndDate(date);
              setStartDate(date);
            }}
          />
        </View>
        <View gap="$2">
          <Label htmlFor="endDate" unstyled>
            {t("endDate")}
          </Label>
          <DatePickerInput
            minDate={startDate}
            placeholder={t("chooseEndDate")}
            value={endDate}
            onChange={setEndDate}
          />
        </View>
        <View gap="$2">
          <Label htmlFor="attachment" unstyled>
            {t("attachments")}
          </Label>
          <View gap="$2" marginBottom={5} marginStart={5}>
            <ScrollView
              // hack to horizontally scroll to start from the beginning of the screen
              left={-16}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 10,
                paddingLeft: 10,
              }}
              w={SCREEN_WIDTH}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <XStack gap="$2">
                {/* Allow adding images to the homework when editing, when backend supports it */}
                {!isEditing && (
                  <Card onPress={pickImage} h={104} w={104} jc="center" ai="center">
                    <PlusIcon color="black" />
                    <Typography type="BodyLight">{t("add")}</Typography>
                  </Card>
                )}
                {images?.map((image, index) => (
                  <Stack ov="visible" key={index}>
                    <ImageWrapper
                      viewerRef={imageViewerRef}
                      index={index}
                      source={{
                        uri: image,
                        headers: {
                          Authorization: `Bearer ${accessToken}`,
                        },
                      }}
                      style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#e5e5e5",
                        height: 100,
                        width: 100,
                      }}
                    >
                      <ImageWithAuth
                        source={{
                          uri: image,
                        }}
                        borderRadius="$2"
                        height="100%"
                        width="100%"
                      />
                    </ImageWrapper>
                    <Circle
                      position="absolute"
                      right={-5}
                      top={-5}
                      bg="black"
                      p={4}
                      zIndex={1}
                      pressStyle={{
                        opacity: 0.5,
                      }}
                      onPress={() => removeImage(image)}
                    >
                      <CrossIcon width={16} height={16} />
                    </Circle>
                  </Stack>
                ))}
              </XStack>
            </ScrollView>
          </View>
        </View>
        <View gap="$2">
          <Label htmlFor="description" unstyled>
            {t("description")}
          </Label>
          <TextArea
            value={description}
            onChangeText={setDescription}
            height={100}
            id="description"
            borderWidth={0}
            placeholder={t("description")}
          />
        </View>
        <Form.Trigger asChild disabled={isSubmitDisabled}>
          <ActionButton
            title={t(isEditing ? "update" : "create")}
            isLoading={isPending || isUploading}
          />
        </Form.Trigger>
      </Form>
    </SafeAreaView>
  );
};
