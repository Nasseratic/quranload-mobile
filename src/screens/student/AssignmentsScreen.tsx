import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import AssignmentItem from "components/AssignmentItem";
import { FlatList } from "react-native";
import TabBox from "components/TabBox";
import { i18n, t } from "locales/config";
import { AssignmentStatusEnum } from "types/Lessons";
import { useAssignments } from "hooks/queries/assignments";
import { RootStackParamList } from "navigation/navigation";
import { SafeView } from "components/SafeView";
import { AppBar } from "components/AppBar";
import { Spinner, Stack } from "tamagui";
import LottieView from "lottie-react-native";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import EmptyFolderLottie from "assets/lottie/empty.json";
const tabs = ["pending", "all"] as const;

type Props = NativeStackScreenProps<RootStackParamList, "Assignments">;
const AssignmentsScreen = ({ route, navigation }: Props) => {
  const [tabKey, setTabKey] = useState<(typeof tabs)[number]>("pending");

  const { assignments, isAssignmentsLoading } = useAssignments({
    status: tabKey === "all" ? null : AssignmentStatusEnum.pending,
  });

  const teamAssignments = assignments?.[route.params.teamId];
  return (
    <SafeView>
      <AppBar title={t("assignmentScreen.title")} />
      <FlatList
        data={teamAssignments}
        renderItem={({ item }) => (
          <AssignmentItem
            assignment={item}
            onPress={() => navigation.navigate("Record", { assignment: item })}
          />
        )}
        ListEmptyComponent={
          isAssignmentsLoading ? null : (
            <Stack jc="center" ai="center">
              <LottieView
                source={EmptyFolderLottie}
                autoPlay
                loop
                style={{ width: 300, height: 300, alignSelf: "center" }}
              />
              <Typography type="SubHeaderHeavy">{t("assignmentScreen.empty")}</Typography>
              <Typography
                type="CaptionLight"
                style={{ width: "80%", textAlign: "center", color: Colors.Black[2] }}
              >
                {t("assignmentScreen.emptyDescription")}
              </Typography>
            </Stack>
          )
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 16,
        }}
        ListHeaderComponent={
          <TabBox
            list={[i18n.t("assignmentScreen.pending"), i18n.t("assignmentScreen.all")]}
            index={tabs.indexOf(tabKey)}
            setIndex={(index) => setTabKey(tabs[index])}
          />
        }
        ListFooterComponent={isAssignmentsLoading ? <Spinner py="$12" size="large" /> : null}
      />
    </SafeView>
  );
};

export default AssignmentsScreen;
