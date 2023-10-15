import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import { Form, Input, Label, TextArea, View } from "tamagui";
import ActionButton from "components/buttons/ActionBtn";

type Props = NativeStackScreenProps<
  Frontend.Navigation.RootStackParamList,
  "TeacherCreateHomework"
>;

//TODO: Create custom tamagui compatible button
export const TeacherCreateHomeworkScreen: FunctionComponent<Props> = () => {
  return (
    <QuranLoadView
      appBar={{
        title: "Create homework",
      }}
    >
      <Form onSubmit={() => null} gap="$3.5">
        <View gap="$2">
          <Label htmlFor="startDate" unstyled>
            Start date
          </Label>
          <Input id="startDate" borderWidth={0} placeholder="Start date" />
        </View>
        <View gap="$2">
          <Label htmlFor="endDate" unstyled>
            End date
          </Label>
          <Input id="endDate" borderWidth={0} placeholder="End date" />
        </View>
        <View gap="$2">
          <Label htmlFor="attachment" unstyled>
            Attachment
          </Label>
          <Input id="attachment" borderWidth={0} placeholder="Attachment" />
        </View>
        <View gap="$2">
          <Label htmlFor="description" unstyled>
            Description
          </Label>
          <TextArea id="description" borderWidth={0} placeholder="Description" />
        </View>
        <ActionButton title="Create" />
      </Form>
    </QuranLoadView>
  );
};
