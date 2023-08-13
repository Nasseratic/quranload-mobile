import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import AssignmentItem from "components/AssignmentItem";
import { StyleSheet, View } from "react-native";
import GeneralConstants from "constants/GeneralConstants";
import Paginated from "types/Paginated";
import { GetUserLesson } from "services/lessonsService";
import Loader from "components/Loader";
import TabBox from "components/TabBox";
import { i18n } from "locales/config";
import { useNavigation } from "@react-navigation/native";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Assignments">;
const AssignmentsScreen = ({ route, navigation }: Props) => {
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [assignments, setAssignments] = useState<Paginated<Frontend.Content.Assignment>>();
  const getUserAssignmentList = () => {
    setLoading(true);
    GetUserLesson({ teamId: route.params.teamId, lessonState: index == 0 ? undefined : 0 })
      .then((res) => {
        setAssignments(res);
        console.log(res.list);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getUserAssignmentList();
  }, [index]);

  return (
    <QuranLoadView appBar={{ title: i18n.t("assignmentScreen.title") }}>
      <TabBox
        list={[i18n.t("assignmentScreen.all"), i18n.t("assignmentScreen.pending")]}
        index={index}
        setIndex={setIndex}
      />
      {loading ? (
        <Loader light />
      ) : (
        assignments && (
          <View style={styles.assignments}>
            {assignments.list.map((assignment, index) => (
              <AssignmentItem
                key={index}
                assignment={assignment}
                onPress={() => navigation.navigate("Record")}
              />
            ))}
          </View>
        )
      )}
    </QuranLoadView>
  );
};

const styles = StyleSheet.create({
  assignments: {
    gap: GeneralConstants.Spacing.md,
  },
});

export default AssignmentsScreen;
