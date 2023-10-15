import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import { ActivityIndicator } from "react-native";
import { Stack } from "tamagui";
import PlusIcon from "components/icons/PlusIcon";
import { Colors } from "constants/Colors";
import TeacherHomeworkItem from "components/teacher/TeacherHomeworkItem";
import { add, sub } from "date-fns";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "TeacherHomework">;

const data: Frontend.Content.Homework[] = [
  {
    description: "Read: 160-170",
    teamId: "1asd1",
    totalRegisteredStudents: 12,
    totalSubmittedStudents: 0,
    feedbackGivenCount: 0,
    startDate: new Date(),
    endDate: add(new Date(), { days: 1 }),
    submissions: [],
  },
  {
    description: "Read: 150-160",
    teamId: "1asd1",
    totalRegisteredStudents: 12,
    totalSubmittedStudents: 10,
    feedbackGivenCount: 7,
    startDate: new Date(),
    endDate: new Date(),
    submissions: [
      {
        fullname: "Engin Kacar",
        isFeedbackGiven: true,
        submittedAtDate: new Date(),
      },
      {
        fullname: "Yunus Yüksel",
        isFeedbackGiven: false,
        submittedAtDate: new Date(),
      },
      {
        fullname: "Matin Kacar",
        isFeedbackGiven: false,
      },
    ],
  },
  {
    description: "Read: 140-150",
    teamId: "1asd1",
    totalRegisteredStudents: 12,
    totalSubmittedStudents: 12,
    feedbackGivenCount: 12,
    startDate: sub(new Date(), { days: 2 }),
    endDate: sub(new Date(), { days: 1 }),
    submissions: [],
  },
  {
    description: "Read: 120-130",
    teamId: "1asd1",
    totalRegisteredStudents: 12,
    totalSubmittedStudents: 8,
    feedbackGivenCount: 8,
    startDate: new Date("2023-09-15"),
    submissions: [],
    endDate: new Date("2023-09-22"),
  },
  {
    description: "Read: 110-120",
    teamId: "1asd1",
    totalRegisteredStudents: 12,
    totalSubmittedStudents: 12,
    feedbackGivenCount: 12,
    startDate: new Date("2023-09-08"),
    endDate: new Date("2023-09-15"),
    submissions: [],
  },
  {
    description: "Read: 100-110",
    teamId: "1asd1",
    totalRegisteredStudents: 12,
    totalSubmittedStudents: 7,
    feedbackGivenCount: 4,
    startDate: new Date("2023-09-01"),
    endDate: new Date("2023-09-08"),
    submissions: [],
  },
];

export const TeacherHomeworkScreen: FunctionComponent<Props> = ({ navigation }) => {
  const isLoading = false;
  return (
    <QuranLoadView
      appBar={{
        title: "Homework",
        action: {
          icon: <PlusIcon color={Colors.Primary[1]} />,
          onPress: () => navigation.navigate("TeacherCreateHomework"),
        },
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <Stack gap={"$3.5"}>
          {data.map((homework, index) => (
            <TeacherHomeworkItem
              key={index}
              homework={homework}
              onPress={() => navigation.navigate("TeacherSubmissions", { homework })}
            />
          ))}
        </Stack>
      )}
    </QuranLoadView>
  );
};
