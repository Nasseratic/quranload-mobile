import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://5e1f5499270d4c15963ae5f9daff4640@o4506168696307712.ingest.sentry.io/4506168893505536",
  debug: true,
});

export { Sentry };
