import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import { Form, Input, Label, View, XGroup } from "tamagui";
import ActionButton from "components/buttons/ActionBtn";
import LetterCheckbox from "components/forms/LetterCheckbox";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "TeacherAutoHomework">;

//TODO: Create custom tamagui compatible button
export const TeacherAutoHomeworkScreen: FunctionComponent<Props> = () => {
  return (
    <QuranLoadView
      appBar={{
        title: "Update auto homework",
      }}
    >
      <Form onSubmit={() => null} gap="$3.5">
        <View gap="$2">
          <Label htmlFor="pagesPerDay" unstyled>
            Pages per day
          </Label>
          <Input id="pagesPerDay" borderWidth={0} placeholder="Pages per day" />
        </View>
        <View gap="$2">
          <Label htmlFor="startPage" unstyled>
            Start page
          </Label>
          <Input id="startPage" borderWidth={0} placeholder="Start page" />
        </View>
        <View gap="$2">
          <Label unstyled>Choose days</Label>
          <XGroup backgroundColor="$backgroundTransparent" justifyContent="space-between">
            <LetterCheckbox letter="M" />
            <LetterCheckbox letter="T" />
            <LetterCheckbox letter="W" />
            <LetterCheckbox letter="T" />
            <LetterCheckbox letter="F" />
            <LetterCheckbox letter="S" />
            <LetterCheckbox letter="S" />
          </XGroup>
        </View>
        <ActionButton title="Create" />
      </Form>
    </QuranLoadView>
  );
};
