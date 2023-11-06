import { Text, View } from "react-native";
import * as Font from "expo-font";
import React, { useCallback, useState } from "react";
import { FontMap } from "utils/FontMap";
import { MushafPageSurahHeader } from "components/Mushaf/MushafPageSurahHeader";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { BsmlSvg } from "components/svgs/BsmlSvg";
import { match, P } from "ts-pattern";
import { Loader } from "components/Loader";
import QuranPages from "assets/data/preprocessedQuranPages.json";
import { XSpacer } from "components/Spacer";

const lineExtraWidthMap: Record<number, number> = {};

const QURAN_PAGE_PADDING = 12;

const APPBAR_HEIGHT = 54;

const QURAN_PAGE_WIDTH = SCREEN_WIDTH - QURAN_PAGE_PADDING * 2;

export function MushafPage({ pageNumber }: { pageNumber: number }) {
  const [fontsLoaded] = Font.useFonts({
    [`page${pageNumber}`]: FontMap[`${pageNumber}` as keyof typeof FontMap],
  });

  const [isLayoutReady, setIsLayoutReady] = useState(false);

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      setTimeout(() => {
        setIsLayoutReady(true);
      }, 200);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return <Loader />;

  const lines = QuranPages[`${pageNumber}` as keyof typeof QuranPages];

  return (
    <>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          paddingHorizontal: QURAN_PAGE_PADDING,
          width: SCREEN_WIDTH,
          paddingTop: APPBAR_HEIGHT,
        }}
        onLayout={onLayoutRootView}
      >
        {Object.values(lines).map((line, i) => {
          return (
            <Text
              key={i}
              style={{
                fontFamily: `page${pageNumber}`,
                fontSize: 20,
                lineHeight: pageNumber == 1 || pageNumber == 2 ? 48 : 40,
                paddingHorizontal: 3,
                width: QURAN_PAGE_WIDTH,
                textAlign: "center",
              }}
              adjustsFontSizeToFit
              allowFontScaling={false}
              numberOfLines={1}
              onLayout={(e) => {
                if (lineExtraWidthMap[i]) return;
                const lineWidth = e.nativeEvent.layout.width;
                lineExtraWidthMap[i] = (QURAN_PAGE_WIDTH - lineWidth) / 2;
              }}
            >
              {line.map((word, j) =>
                match(word)
                  .with(P.string.startsWith("SURH"), () => (
                    <MushafPageSurahHeader
                      key={j}
                      width={QURAN_PAGE_WIDTH}
                      surahNumber={parseInt(word.split("-")[1])}
                    />
                  ))
                  .with("BSML", () => (
                    <View
                      key={j}
                      style={{
                        paddingTop: 5,
                        width: QURAN_PAGE_WIDTH,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <BsmlSvg width={QURAN_PAGE_WIDTH / 2} />
                    </View>
                  ))
                  .otherwise(() => {
                    const isLast = line.length - 1 === j;
                    const isMiddle = Math.round((line.length - 1) / 2) === j;
                    return (
                      <Word isMiddle={isMiddle} isLast={isLast} word={word} key={j} index={i} />
                    );
                  })
              )}
            </Text>
          );
        })}
      </View>
      {!isLayoutReady && <Loader />}
    </>
  );
}

const Word = React.memo(
  function Word({
    word,
    index,
    isLast,
    isMiddle,
  }: {
    word: string;
    index: number;
    isLast: boolean;
    isMiddle: boolean;
  }) {
    return (
      <Text>
        {(isMiddle || isLast) && <XSpacer space={lineExtraWidthMap[index] ?? 0} />}
        {word}
        {isLast ? null : <XSpacer space={2} />}
      </Text>
    );
  },
  () => true
);
