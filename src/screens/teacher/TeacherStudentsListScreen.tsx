import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import { RootStackParamList } from "navigation/navigation";
import { fetchStudentsList } from "services/teamService";
import { useQuery } from "@tanstack/react-query";
import { Card, Stack } from "tamagui";
import Typography from "components/Typography";
import ChevronRight from "components/icons/ChevronRight";
import { Colors } from "constants/Colors";
import { TouchableOpacity } from "react-native";
import GeneralConstants from "constants/GeneralConstants";
import { t } from "locales/config";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherStudentsList">;

export const TeacherStudentsListScreen: FunctionComponent<Props> = ({ route }) => {
  const { teamId } = route.params;
  const { data } = useQuery(["students-list"], () => fetchStudentsList({ teamId }));
  const students = data?.list ?? [];

  return (
    <QuranLoadView
      appBar={{
        title: t("teacherStudentsListScreen.title"),
      }}
    >
      <Stack gap={GeneralConstants.Spacing.md}>
        {students.map((student) => (
          <TouchableOpacity key={student.id}>
            <Card
              paddingHorizontal={GeneralConstants.Spacing.md}
              paddingVertical={GeneralConstants.Spacing.sm}
              backgroundColor="$backgroundTransparent"
              borderColor="$gray5"
              borderWidth={1}
              borderRadius={GeneralConstants.BorderRadius.full}
              justifyContent="space-between"
              flexDirection="row"
              alignItems="center"
            >
              <Typography>{student.fullName}</Typography>
              <ChevronRight color={Colors.Primary[1]} />
            </Card>
          </TouchableOpacity>
        ))}
      </Stack>
    </QuranLoadView>
  );
};
