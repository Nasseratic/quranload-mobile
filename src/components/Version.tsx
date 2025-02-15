import { Pressable } from "react-native";
import { t } from "locales/config";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import * as Updates from "expo-updates";
import { isDevelopmentBuild } from "expo-dev-client";
import { format } from "date-fns";
import { toast } from "components/Toast";

export const AppVersion = () => {
  return (
    <Pressable
      hitSlop={20}
      onPress={async () => {
        try {
          const { isNew } = await Updates.fetchUpdateAsync();
          if (isNew) await Updates.reloadAsync();
          else toast.show({ status: "Success", title: t("you_are_on_latest_version") });
        } catch (e) {
          if (!isDevelopmentBuild()) toast.reportError(e);
          else toast.show({ status: "Error", title: "Updates are not available in dev mode" });
        }
      }}
    >
      <Typography
        style={{
          alignSelf: "center",
          fontSize: 10,
          color: Colors.Black[2],
          paddingRight: 10,
        }}
      >
        Version:{" "}
        {(Updates.createdAt ? format(Updates.createdAt, "yy-MM-dd (HH)") : "N/A") +
          (isDevelopmentBuild() ? " ( DEV )" : "")}
      </Typography>
    </Pressable>
  );
};
