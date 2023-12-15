import { FunctionComponent, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Form, Input, Label, View, XGroup } from "tamagui";
import ActionButton from "components/buttons/ActionBtn";
import LetterCheckbox from "components/forms/LetterCheckbox";
import { RootStackParamList } from "navigation/navigation";
import { i18n } from "locales/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "api/apiClient";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBar } from "components/AppBar";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherAutoHomework">;

const calculateDaysRef = (
  weekDays: {
    day: string;
    hasHomeWork: boolean;
  }[]
) => {
  // sun = 1; mon = 2; tue = 4; wed = 8; thu = 16; fri = 32; sat = 64;
  const weightsArray = [2, 4, 8, 16, 32, 64, 1];
  let daysRef = 0;
  weekDays.forEach((day, index) => day.hasHomeWork && (daysRef += weightsArray[index]));
  return daysRef;
};

export const TeacherAutoHomeworkScreen: FunctionComponent<Props> = ({ route }) => {
  const { weekDays, startFromPage, pagesPerDay, teamId, assignmentId } = route.params;
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [pagesPerDayInput, setPagesPerDayInput] = useState<number | null>(pagesPerDay);
  const [startFromPageInput, setStartFromPageInput] = useState<number | null>(startFromPage);
  const [weekDaysInput, setWeekDaysInput] = useState(weekDays ?? []);

  const { mutate, isLoading } = useMutation({
    mutationKey: ["PostAutoAssignmentKey"],
    mutationFn: async () => {
      if (assignmentId == "")
        // create a new auto assignment
        await apiClient.post("Assignments", {
          pagesPerDay: pagesPerDayInput,
          startFromPage: startFromPageInput,
          typeId: 1, // typeId 1 is the auto assignment
          days: calculateDaysRef(weekDaysInput),
          teamId: teamId,
        });
      // edit the existing auto assignment
      else
        await apiClient.put("Assignments", {
          id: assignmentId,
          pagesPerDay: pagesPerDayInput,
          startFromPage: startFromPageInput,
          typeId: 1, // typeId 1 is the auto assignment
          days: calculateDaysRef(weekDaysInput),
          teamId: teamId,
        });
      queryClient.refetchQueries(["auto-assignment"]);
      navigation.goBack();
    },
  });

  return (
    <SafeAreaView>
      <AppBar title={i18n.t("teacherAutoHW.updateAutoHW")} />
      <Form
        onSubmit={() => {
          mutate();
        }}
        gap="$3.5"
        marginHorizontal={16}
      >
        <View gap="$2">
          <Label htmlFor="pagesPerDay" unstyled>
            {i18n.t("teacherAutoHW.pagesPerDay")}
          </Label>
          <Input
            id="pagesPerDay"
            value={pagesPerDayInput?.toString()}
            keyboardType="number-pad" // TODO: Add min 1 & max 604
            borderWidth={0}
            placeholder={i18n.t("teacherAutoHW.pagesPerDay")}
            onChangeText={(input) => {
              setPagesPerDayInput(input ? Number(input) : null);
            }}
          />
        </View>
        <View gap="$2">
          <Label htmlFor="startPage" unstyled>
            {i18n.t("teacherAutoHW.startPage")}
          </Label>
          <Input
            id="startPage"
            value={startFromPageInput?.toString()}
            keyboardType="number-pad" // TODO: Add min 1 & max 604
            borderWidth={0}
            placeholder={i18n.t("teacherAutoHW.startPage")}
            onChangeText={(input) => {
              setStartFromPageInput(input ? Number(input) : null);
            }}
          />
        </View>
        <View gap="$2">
          <Label unstyled>{i18n.t("teacherAutoHW.chooseDays")}</Label>
          <XGroup backgroundColor="$backgroundTransparent" justifyContent="space-between">
            {weekDays?.map((day, index) => {
              return (
                <LetterCheckbox
                  letter={day.day}
                  key={index}
                  checked={day.hasHomeWork}
                  onChange={() => {
                    weekDaysInput[index].hasHomeWork = !weekDaysInput[index].hasHomeWork;
                    setWeekDaysInput(weekDaysInput);
                  }}
                />
              );
            })}
          </XGroup>
        </View>
        <Form.Trigger asChild disabled={!startFromPageInput || !pagesPerDayInput}>
          <ActionButton title={i18n.t("save")} isLoading={isLoading} />
        </Form.Trigger>
      </Form>
    </SafeAreaView>
  );
};
