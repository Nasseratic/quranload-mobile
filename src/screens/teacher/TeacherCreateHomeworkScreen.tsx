import { FunctionComponent, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import { Form, Input, Label, TextArea, View } from "tamagui";
import ActionButton from "components/buttons/ActionBtn";
import { RootStackParamList } from "navigation/navigation";
import { DatePickerInput } from "components/DatePicker";
type Props = NativeStackScreenProps<RootStackParamList, "TeacherCreateHomework">;

//TODO: Create custom tamagui compatible button
export const TeacherCreateHomeworkScreen: FunctionComponent<Props> = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

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

          <DatePickerInput
            placeholder="Choose start date"
            value={startDate}
            onChange={setStartDate}
          />
        </View>
        <View gap="$2">
          <Label htmlFor="endDate" unstyled>
            End date
          </Label>
          <DatePickerInput placeholder="Choose end date" value={endDate} onChange={setEndDate} />
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
