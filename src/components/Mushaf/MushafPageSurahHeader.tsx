/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Group, Image, Text, useFont, useImage } from "@shopify/react-native-skia";
import surahHeaderImg from "assets/surahheader.png";
export function MushafPageSurahHeader({
  width,
  surahNumber,
  y,
}: {
  width: number;
  surahNumber: number;
  y: number;
}) {
  const surahName1 = useFont(require("assets/fonts/surahName1.otf"), 48);
  const surahName2 = useFont(require("assets/fonts/surahName2.otf"), 48);
  const img = useImage(surahHeaderImg);

  const height = width * 0.12;
  const surahChar = surahNameCharMap[surahNumber] ?? "";
  const surahNameWidth =
    (surahNumber > 59
      ? surahName2?.getTextWidth(surahChar)
      : surahName1?.getTextWidth(surahChar)) ?? 0;

  if (!surahName1 || !surahName2 || !img) return null;
  return (
    <Group>
      <Image y={y - 40} fit="fitHeight" image={img} width={width} height={height} />
      <Text
        y={y}
        x={(width - surahNameWidth) / 2}
        text={surahChar}
        font={surahNumber > 59 ? surahName2 : surahName1}
      />
    </Group>
  );
}

const surahNameCharMap =
  "_123456789abcdefghijklmnopqrstuvwxABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzGHIJKLMNOPQRSTUVWXYZ123456789";
