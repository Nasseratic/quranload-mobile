import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "react-native";
import { MushafPages } from "components/Mushaf/MushafPages";
import { RecordScreenRecorder } from "./RecordScreenRecorder";
import { RootStackParamList } from "navigation/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Record">;

export const RecordScreen: FunctionComponent<Props> = ({ route }) => {
  return (
    <View style={{ flex: 1 }}>
      <MushafPages
        pageFrom={route.params.assignment.startPage}
        pageTo={route.params.assignment.endPage}
      />
      <RecordScreenRecorder
        lessonId={route.params.assignment.id}
        recordingId={route.params.assignment.recordingUrl ?? undefined}
        feedbackId={route.params.assignment.feedbackUrl ?? undefined}
      />
    </View>
  );
};
