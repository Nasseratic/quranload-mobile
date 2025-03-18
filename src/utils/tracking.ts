import { t } from "locales/config";
import PostHog from "posthog-react-native";

export const posthog = new PostHog("phc_NyrqpdlwWyfpNiwGzvU8yyVQ0ipyfNuH1NybvWeKmHC", {
  host: "https://eu.i.posthog.com",
});

type Events =
  | "RetriedUploadRecording"
  | "DiscardedRecordingUploadErrorAlert"
  | "PressedShareRecodingToWhatsApp"
  | "RecodingStarted"
  | "RecordingPaused"
  | "RecordingResumed"
  | "RecordingDiscarded"
  | "RecordingSubmitPressed"
  | "RecordingUploaded"
  | "RecordingUploadFailed";

type Properties = {
  [key: string]: any;
  screen?: string;
  duration?: number;
};

export const track = (event: Events, properties?: Properties) => {
  posthog.capture(event, properties);
};
