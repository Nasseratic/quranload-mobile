import * as Sentry from "@sentry/react-native";
import { OTA_VERSION } from "components/Version";
import { isDevelopmentBuild } from "expo-dev-client";

const isDevelopment = isDevelopmentBuild();
Sentry.init({
  dsn: isDevelopment
    ? undefined
    : "https://5e1f5499270d4c15963ae5f9daff4640@o4506168696307712.ingest.sentry.io/4506168893505536",
  release: OTA_VERSION,
});

export { Sentry };
