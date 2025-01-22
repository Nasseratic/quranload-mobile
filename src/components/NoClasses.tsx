import { Colors } from "constants/Colors";
import GeneralConstants, { SCREEN_WIDTH } from "constants/GeneralConstants";
import { StyleSheet, View } from "react-native";
import Typography from "components/Typography";
import { t } from "locales/config";
import { EmptySvg } from "components/svgs/EmptySvg";
import ActionButton from "./buttons/ActionBtn";
import * as Linking from "expo-linking";
import { useMemo } from "react";
import { useOrganizations } from "hooks/queries/useOrganizations";
import { Avatar, Card, Separator, Stack, Text, XStack } from "tamagui";
import { useFeatureFlags } from "hooks/queries/useFeatureFlags";

const NoClasses = ({ role }: { role: "teacher" | "student" }) => {
  const { ff } = useFeatureFlags();
  const text = useMemo(
    () =>
      role === "teacher" ? t("teacherHomeScreen.noClasses") : t("studentDashboard.notEnrolled"),
    [role]
  );
  return ff?.inAppEnrolment && role === "student" ? (
    <Schools />
  ) : (
    <View style={styles.container}>
      {ff?.inAppEnrolment ? (
        <Schools />
      ) : (
        <Stack gap={GeneralConstants.Spacing.xl}>
          <EmptySvg size={SCREEN_WIDTH * 0.5} />
          <View style={styles.errorDetail}>
            <Typography
              type="TitleLight"
              style={{
                color: Colors.Black[2],
                textAlign: "center",
                width: 280,
              }}
            >
              {text}
            </Typography>
          </View>
          {role === "student" && (
            <View>
              <ActionButton
                title={t("studentDashboard.enroll")}
                onPress={() => Linking.openURL("https://www.quranload.com")}
              />
            </View>
          )}
        </Stack>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 124,
  },
  errorWrapper: {
    padding: GeneralConstants.Spacing.lg,
    flexDirection: "row",
    gap: GeneralConstants.Spacing.sm,
    alignItems: "center",
  },
  errorDetail: {
    flex: 1,
    flexDirection: "column",
  },
});

export default NoClasses;

const Schools = () => {
  const { organizations } = useOrganizations();

  return (
    <Stack gap={16} f={1}>
      {organizations
        ?.filter((org) => org.isActive)
        ?.map((org) => (
          <Card
            bg="$gray1"
            shadowColor="#000"
            elevation={15}
            key={org.id}
            w="100%"
            ai="center"
            p={24}
          >
            <Avatar br={100}>
              {org.logo && <Avatar.Image source={{ uri: org.logo }} />}
              <Avatar.Fallback jc="center" ai="center" bg="lightgrey">
                <Text textTransform="uppercase">{org.fullName?.slice(0, 2)}</Text>
              </Avatar.Fallback>
            </Avatar>
            <Typography type="BodyLight" style={{ color: Colors.Black[2] }}>
              {org.fullName}
            </Typography>
            <Separator />
            <Typography type="BodyLight" style={{ color: Colors.Black[2] }}>
              Phone: {org.phoneNumber}
            </Typography>
          </Card>
        ))}
    </Stack>
  );
};
