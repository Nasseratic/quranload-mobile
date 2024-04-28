import { FunctionComponent, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Form, Input, Label, View, XGroup } from "tamagui";
import ActionButton from "components/buttons/ActionBtn";
import LetterCheckbox from "components/forms/LetterCheckbox";
import { RootStackParamList } from "navigation/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { i18n, t } from "locales/config";
import apiClient from "api/apiClient";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBar } from "components/AppBar";
import { toast } from "components/Toast";

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
  weekDays.forEach((day, index) => day.hasHomeWork && (daysRef += weightsArray[index] ?? 0));
  return daysRef;
};

export const TeacherAutoHomeworkScreen: FunctionComponent<Props> = ({ route }) => {
  const { weekDays, startFromPage, pagesPerDay, teamId, assignmentId } = route.params;
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [pagesPerDayInput, setPagesPerDayInput] = useState<number | null>(pagesPerDay ?? null);
  const [startFromPageInput, setStartFromPageInput] = useState<number | null>(
    startFromPage ?? null
  );
  const [weekDaysInput, setWeekDaysInput] = useState(weekDays ?? []);

  const { mutate, isLoading } = useMutation({
    // TODO: move this to a service
    mutationFn: async () => {
      const body = {
        typeId: 1, // typeId 1 is the auto assignment
        teamId: teamId,
        pagesPerDay: pagesPerDayInput,
        startFromPage: startFromPageInput,
        days: calculateDaysRef(weekDaysInput),
      };

      try {
        if (assignmentId)
          await apiClient.put("Assignments", {
            id: assignmentId,
            ...body,
          });
        else await apiClient.post("Assignments", body);
        queryClient.refetchQueries(["auto-assignment"]);
        navigation.goBack();
        toast.show({
          status: "Success",
          title: assignmentId ? t("teacherAutoHW.updated") : t("teacherAutoHW.created"),
        });
      } catch (err) {
        toast.reportError(err);
      }
    },
  });

  return (
    <SafeAreaView>
      <AppBar title={t("teacherAutoHW.recurringHomework")} />
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
                    const day = weekDaysInput[index];
                    if (day) {
                      day.hasHomeWork = !day.hasHomeWork;
                      setWeekDaysInput(weekDaysInput);
                    }
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
