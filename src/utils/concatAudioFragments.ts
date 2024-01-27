import { IS_IOS } from "constants/GeneralConstants";
import { FFmpegKit, ReturnCode } from "ffmpeg-kit-react-native";

const MP3_QUALITY = IS_IOS ? 5 : 2;

export const concatAudioFragments = async (audioFiles: string[]) => {
  const audioInputFilesString = audioFiles.map((file) => `-i ${file}`).join(" ");

  const concatFilesCommand =
    audioFiles.length > 1
      ? ` -filter_complex "[0:a][1:a]concat=n=${audioFiles.length}:v=0:a=1"`
      : "";

  const outputDir = audioFiles[0]?.split("/").slice(0, -1).join("/");

  const outputFile = `${outputDir}/output_${Math.random().toString(36).substring(2, 15)}.mp3`;

  return new Promise<string>((resolve, reject) => {
    FFmpegKit.execute(
      `${audioInputFilesString} ${concatFilesCommand} -codec:a libmp3lame -q:a ${MP3_QUALITY} ${outputFile}`
    ).then(async (session) => {
      const returnCode = await session.getReturnCode();
      if (ReturnCode.isSuccess(returnCode)) {
        // SUCCESS
        resolve(outputFile);
      } else if (ReturnCode.isCancel(returnCode)) {
        // CANCEL
      } else {
        // ERROR
        reject();
      }
    });
  });
};
