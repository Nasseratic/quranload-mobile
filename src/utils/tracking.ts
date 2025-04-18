import { OTA_VERSION } from "components/Version";
import { t } from "locales/config";
import PostHog from "posthog-react-native";

export const posthog = new PostHog("phc_NyrqpdlwWyfpNiwGzvU8yyVQ0ipyfNuH1NybvWeKmHC", {
  host: "https://eu.i.posthog.com",
});

posthog.register({
  otaVersion: OTA_VERSION,
});

type Event =
  | "RetriedUploadRecording"
  | "DiscardedRecordingUploadErrorAlert"
  | "PressedShareRecodingToWhatsApp"
  | "RecodingStarted"
  | "RecordingPaused"
  | "RecordingResumed"
  | "RecordingDiscarded"
  | "RecordingSubmitPressed"
  | "RecordingUploaded"
  | "RecordingUploadFailed"
  | "RecordingStatusChangedWith0Duration";

type Properties = {
  [key: string]: any;
  screen?: string;
  duration?: number;
};

export const track = (event: Event, properties?: Properties) => {
  posthog.capture(event, properties);
};

export const throttleTrack = (throttleTime: number) => {
  let lastTrackTime = 0;

  return (event: Event, properties?: { [key: string]: any }) => {
    const now = Date.now();
    if (now - lastTrackTime > throttleTime) {
      track(event, properties);
      lastTrackTime = now;
    }
  };
};
