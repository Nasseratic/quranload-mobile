import { View } from "react-native";
import { useMemo } from "react";
import { FontMap } from "utils/FontMap";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { Loader } from "components/Loader";
import QuranPages from "assets/data/preprocessedQuranPages.json";
import { Canvas, useFont, Text as SkText, Group } from "@shopify/react-native-skia";
import { P, match } from "ts-pattern";
import { BsmlSvg } from "components/svgs/BsmlSvg";
import { MushafPageSurahHeader } from "./MushafPageSurahHeader";

const QURAN_PAGE_PADDING = 24;

const APPBAR_HEIGHT = 54;

const QURAN_PAGE_WIDTH = SCREEN_WIDTH - QURAN_PAGE_PADDING * 2;

const fontSize = 22;

// WIP experimental mushaf page renderer using skia
export function SkiaMushafPage({ pageNumber }: { pageNumber: number }) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const skFont = useFont(FontMap[`${pageNumber}` as keyof typeof FontMap], fontSize);

  const lines = useMemo(
    () =>
      Object.values(QuranPages[`${pageNumber}` as keyof typeof QuranPages]).map(
        // reverse the lines to make it RTL
        (line) => line.slice().reverse()
      ),
    [pageNumber]
  );

  if (!skFont) return <Loader />;
  console.log(lines.length);
  const BSMLHeight = (QURAN_PAGE_WIDTH / 2) * 0.14 + 12;
  const SURHHeight = QURAN_PAGE_WIDTH * 0.12 + 12;
  // TODO: refactor this to make more sense
  const getLineHeight = (line: string[]) =>
    match(line[0])
      .with("BSML", () => BSMLHeight)
      .with(P.string.startsWith("SURH"), () => SURHHeight)
      .otherwise(() => fontSize + 16);

  const lineYSpacing = lines.map((_, index) =>
    lines.slice(0, index + 1).reduce((a, line) => a + getLineHeight(line), 0)
  );

  return (
    <>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: QURAN_PAGE_PADDING,
          paddingTop: APPBAR_HEIGHT,
        }}
      >
        <Canvas
          style={{
            width: QURAN_PAGE_WIDTH,
            height: lines.reduce((a, line) => a + getLineHeight(line), 32),
          }}
        >
          {lines.map((line, i) => {
            const wordWidths = line.map((word) => skFont?.getTextWidth(word));

            const wordSpacing =
              (QURAN_PAGE_WIDTH - (wordWidths?.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0)) /
              (line.length - 1);

            return (
              <Group key={i}>
                {line.map((word, j) =>
                  match(word)
                    .with(P.string.startsWith("SURH"), () => (
                      <Group key={j}>
                        <MushafPageSurahHeader
                          y={lineYSpacing[i]!}
                          width={QURAN_PAGE_WIDTH}
                          surahNumber={parseInt(word.split("-")[1]!)}
                        />
                      </Group>
                    ))
                    .with("BSML", () => (
                      <Group key={j} transform={[{ translateX: QURAN_PAGE_WIDTH / 4 }]}>
                        <BsmlSvg y={lineYSpacing[i]!} width={QURAN_PAGE_WIDTH / 2} />
                      </Group>
                    ))

                    .otherwise(() => (
                      <SkText
                        key={j}
                        font={skFont}
                        text={word}
                        y={lineYSpacing[i]}
                        x={wordWidths.slice(0, j).reduce((a, b) => a + b + wordSpacing, 0)}
                      />
                    ))
                )}
              </Group>
            );
          })}
        </Canvas>
      </View>
    </>
  );
}
