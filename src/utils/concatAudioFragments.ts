import { IS_IOS } from "constants/GeneralConstants";
import { FFmpegKit, ReturnCode } from "ffmpeg-kit-react-native";

const MP3_QUALITY = IS_IOS ? 4 : 1;

export const concatAudioFragments = async (audioFiles: string[]) => {
  const audioInputFilesString = audioFiles.map((file) => `-i ${file}`).join(" ");

  const concatFilesCommand =
    audioFiles.length > 1
      ? ` -filter_complex "[0:a][1:a]concat=n=${audioFiles.length}:v=0:a=1"`
      : "";

  const outputDir = audioFiles[0]?.split("/").slice(0, -1).join("/");

  const outputFile = `${outputDir}/output_${Math.random().toString(36).substring(2, 15)}.mp3`;

  return new Promise<{
    uri: string;
    totalDuration: number | null;
  }>((resolve, reject) => {
    FFmpegKit.execute(
      `${audioInputFilesString} ${concatFilesCommand} -codec:a libmp3lame -q:a ${MP3_QUALITY} ${outputFile}`
    ).then(async (session) => {
      const returnCode = await session.getReturnCode();
      if (ReturnCode.isSuccess(returnCode)) {
        let totalDuration: null | number = null;
        try {
          const output = await session.getOutput();
          // extract total duration from output
          const durationRegex = /time=(\d+:\d+:\d+\.\d+)/g;
          const durationMatch = output.match(durationRegex)?.[0];
          if (durationMatch) {
            const timeParts = durationMatch.split("=") as [string, string];
            const time = timeParts[1].split(":") as [string, string, string];
            totalDuration = Math.round(
              parseInt(time[0]) * 3600 + parseInt(time[1]) * 60 + parseFloat(time[2])
            );
          }
        } catch (error) {
          console.error("Error extracting duration:", error);
        }
        // SUCCESS
        resolve({ uri: outputFile, totalDuration });
      } else if (ReturnCode.isCancel(returnCode)) {
        // CANCEL
      } else {
        // ERROR
        reject();
      }
    });
  });
};
