import { Linking } from "react-native";
import { Card, Button, XStack, YStack } from "tamagui";
import Typography from "components/Typography";
import { t } from "locales/config";
import { cvx, useCvxMutation } from "api/convex";
import { useUser } from "contexts/auth";
import { OTA_VERSION } from "components/Version";
import { Sentry } from "utils/sentry";

const FeedbackCard = () => {
  const { emailAddress, fullName, phoneNumber } = useUser();
  const saveContactSupportInfo = useCvxMutation(cvx.support.saveContactSupportInfo);

  return (
    <Card padding={16} borderRadius={8} backgroundColor="#FF8C00">
      <XStack justifyContent="space-between" alignItems="center" gap="$1">
        <YStack flex={1} gap={"$1"}>
          <Typography type="BodyHeavy" style={{ color: "white" }}>
            {t("feedbackCard.newAppVersion")}
          </Typography>
          <Typography type="BodyLight" style={{ color: "white" }}>
            {t("feedbackCard.shareFeedback")}
          </Typography>
        </YStack>
        <Button
          backgroundColor="white"
          onPress={async () => {
            try {
              await saveContactSupportInfo({
                email: emailAddress,
                name: fullName,
                phone: phoneNumber,
                otaVersion: OTA_VERSION,
              });
            } catch (e) {
              console.error(e);
              Sentry.captureException("Failed to save contact info");
            }
            Linking.openURL(
              "https://copper-periwinkle-fd2.notion.site/1a93683870a381c0968cd712a2798ea4"
            );
          }}
        >
          <Typography type="SmallHeavy" style={{ color: "#333333" }}>
            {t("feedbackCard.contactUs")}
          </Typography>
        </Button>
      </XStack>
    </Card>
  );
};

export default FeedbackCard;
