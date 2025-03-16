import PostHog from "posthog-react-native";

export const posthog = new PostHog("phc_NyrqpdlwWyfpNiwGzvU8yyVQ0ipyfNuH1NybvWeKmHC", {
  host: "https://eu.i.posthog.com",
});

type Events =
  | "RetriedUploadRecording"
  | "DiscardedRecordingUploadErrorAlert"
  | "PressedShareRecodingToWhatsApp";

export const track = (event: Events, properties?: Record<string, any>) => {
  posthog.capture(event, properties);
};
