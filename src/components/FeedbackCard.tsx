import { Linking } from "react-native";
import { Card, Button, XStack, YStack } from "tamagui";
import Typography from "components/Typography";
import { t } from "locales/config";

const FeedbackCard = () => {
  return (
    <Card padding={16} margin={16} borderRadius={8} backgroundColor="#FF8C00">
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
          onPress={() =>
            Linking.openURL(
              "https://copper-periwinkle-fd2.notion.site/1a93683870a381c0968cd712a2798ea4"
            )
          }
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
