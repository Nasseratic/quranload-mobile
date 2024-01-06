import { View } from "react-native";
import React, { useMemo } from "react";
import { FontMap } from "utils/FontMap";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { Loader } from "components/Loader";
import QuranPages from "assets/data/preprocessedQuranPages.json";
import { Canvas, useFont, Text as SkText } from "@shopify/react-native-skia";

const QURAN_PAGE_PADDING = 12;

const APPBAR_HEIGHT = 54;

const QURAN_PAGE_WIDTH = SCREEN_WIDTH - QURAN_PAGE_PADDING * 2;

const fontSize = 22;
export function MushafPage({ pageNumber }: { pageNumber: number }) {
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
            height: 38 * 15.5,
          }}
        >
          {lines.map((line, i) => {
            const wordWidths = line.map((word) => skFont?.getTextWidth(word));

            const wordSpacing =
              (QURAN_PAGE_WIDTH - (wordWidths?.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0)) /
              (line.length - 1);

            return (
              <React.Fragment key={i}>
                {line.map((word, j) => (
                  <SkText
                    key={j}
                    font={skFont}
                    text={word}
                    y={(fontSize + 16) * (i + 1)}
                    x={wordWidths.slice(0, j).reduce((a, b) => a + b + wordSpacing, 0)}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </Canvas>
      </View>
    </>
  );
}
