import { FunctionComponent, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Avatar, Card, Circle, Form, Label, ScrollView, TextArea, View, XStack } from "tamagui";
import ActionButton from "components/buttons/ActionBtn";
import { RootStackParamList } from "navigation/navigation";
import { DatePickerInput } from "components/DatePicker";
import PlusIcon from "components/icons/PlusIcon";
import Typography from "components/Typography";
import { CrossIcon } from "components/icons/CrossIcon";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomAssignment } from "services/assigmentService";
import { t } from "locales/config";
import { useMediaPicker } from "hooks/useMediaPicker";
import { AppBar } from "components/AppBar";
import { SafeAreaView } from "react-native-safe-area-context";

const today = new Date();

type Props = NativeStackScreenProps<RootStackParamList, "TeacherCreateHomework">;

export const TeacherCreateHomeworkScreen: FunctionComponent<Props> = ({ route, navigation }) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [description, setDescription] = useState<string>("");
  const { pickImage, images, removeImage, uploadSelectedMedia, isUploading } = useMediaPicker();
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = useMutation({
    mutationKey: ["createCustomAssignment"],
    mutationFn: createCustomAssignment,
  });

  const handleSubmit = async () => {
    const attachments = await uploadSelectedMedia();
    await mutateAsync({
      teamId: route.params.teamId,
      startDate: (startDate ?? new Date()).toISOString(),
      endDate: (endDate ?? new Date()).toISOString(),
      description,
      attachments: attachments
        .filter(({ uri }) => uri)
        .map((attachment, i) => ({
          id: attachment.id,
          uri: attachment.uri!,
          sortOrder: i,
        })),
    });
    navigation.goBack();
    queryClient.refetchQueries(["assignments"]);
  };

  const isSubmitDisabled =
    !startDate ||
    !endDate ||
    !description.trim() ||
    isUploading ||
    images.length === 0 ||
    isLoading;

  return (
    <SafeAreaView>
      <AppBar title={t("createHomework")} />
      <Form onSubmit={handleSubmit} gap="$3.5" marginHorizontal={16}>
        <View gap="$2">
          <Label htmlFor="startDate" unstyled>
            {t("startDate")}
          </Label>
          <DatePickerInput
            minDate={today}
            placeholder="Choose start date"
            value={startDate}
            onChange={(date) => {
              if (endDate && date > endDate) setEndDate(date);
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
            placeholder="Choose end date"
            value={endDate}
            onChange={setEndDate}
          />
        </View>
        <View gap="$2">
          <Label htmlFor="attachment" unstyled>
            {t("attachments")}
          </Label>
          <ScrollView
            // hack to horizontally scroll to start from the beginning of the screen
            left={-16}
            contentContainerStyle={{
              paddingHorizontal: 16,
            }}
            w={SCREEN_WIDTH}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <XStack gap="$2">
              <Card onPress={pickImage} p="$4" w="$10" h="$10" jc="center" ai="center">
                <PlusIcon color="black" />
                <Typography type="BodyLight">Add</Typography>
              </Card>
              {images?.map((image) => (
                <Avatar key={image} size="$10" borderRadius="$2">
                  <Avatar.Image source={{ uri: image }} />
                  <Circle
                    position="absolute"
                    right={4}
                    top={4}
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
                </Avatar>
              ))}
            </XStack>
          </ScrollView>
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
            placeholder="Description"
          />
        </View>
        <Form.Trigger asChild disabled={isSubmitDisabled}>
          <ActionButton title={t("create")} isLoading={isLoading || isUploading} />
        </Form.Trigger>
      </Form>
    </SafeAreaView>
  );
};
