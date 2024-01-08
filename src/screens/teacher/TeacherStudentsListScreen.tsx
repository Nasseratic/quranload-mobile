import { FunctionComponent, useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/navigation";
import { fetchStudentsList } from "services/teamService";
import { useQuery } from "@tanstack/react-query";
import { Card, Spinner } from "tamagui";
import Typography from "components/Typography";
import GeneralConstants from "constants/GeneralConstants";
import { t } from "locales/config";
import { Colors } from "constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBar } from "components/AppBar";
import { User } from "types/User";
import { FlatList } from "react-native";
import { EmptyState } from "components/EmptyState";

type Props = NativeStackScreenProps<RootStackParamList, "TeacherStudentsList">;

export const TeacherStudentsListScreen: FunctionComponent<Props> = ({ route }) => {
  const { teamId } = route.params;
  const { data, isLoading } = useQuery(["students-list"], () => fetchStudentsList({ teamId }));

  const students: User[] = useMemo(() => {
    return (
      data?.list?.sort(
        (a, b) =>
          b.percentageOfAcceptedOrSubmittedLessons - a.percentageOfAcceptedOrSubmittedLessons
      ) ?? []
    );
  }, [data?.list]);

  const percentageToColor = (percentage: number) => {
    if (percentage >= 80) return Colors.Success[1];
    if (percentage >= 60) return Colors.Warning[1];
    return Colors.Error[1];
  };

  return (
    <SafeAreaView>
      <AppBar title={t("teacherStudentsListScreen.title")} />
      <FlatList
        data={students}
        keyExtractor={(student) => student.id}
        contentContainerStyle={{
          gap: 16,
          marginHorizontal: 16,
          paddingBottom: 16,
        }}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              title={t("teacherStudentsListScreen.empty")}
              description={t("teacherStudentsListScreen.emptyDescription")}
            />
          )
        }
        ListFooterComponent={isLoading ? <Spinner py="$12" size="large" /> : null}
        renderItem={({ item }) => (
          <Card
            key={item.id}
            paddingHorizontal={GeneralConstants.Spacing.md}
            paddingVertical={GeneralConstants.Spacing.sm}
            backgroundColor="$backgroundTransparent"
            borderColor="$gray5"
            borderWidth={1}
            borderRadius={GeneralConstants.BorderRadius.full}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap="$1.5"
          >
            <Typography type="Body" style={{ color: Colors.Primary[1] }}>
              {item.fullName ?? item.username ?? item.emailAddress}
            </Typography>
            <Typography
              type="Body"
              style={{ color: percentageToColor(item.percentageOfAcceptedOrSubmittedLessons) }}
            >
              {`${item.percentageOfAcceptedOrSubmittedLessons}%`}
            </Typography>
          </Card>
        )}
      />
    </SafeAreaView>
  );
};
