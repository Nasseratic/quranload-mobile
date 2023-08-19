import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import * as Font from "expo-font";
import React, { useCallback, useEffect, useState } from "react";
import { XSpacer } from "components/Spacer";
import verses from "assets/data/verses.json";
import chapters from "assets/data/chapters.json";
import { FontMap } from "utils/FontMap";
import { MushafPageSurahHeader } from "components/Mushaf/MushafPageSurahHeader";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { BsmlSvg } from "components/svgs/BsmlSvg";
import { match, P } from "ts-pattern";
import { Loader } from "components/Loader";

const Verses = verses as Record<
  string,
  {
    verses: {
      verse_key: string;
      words: { code_v2: string; line_number: number }[];
    }[];
  }
>;

const Chapters = chapters as { bismillah_pre: boolean }[];

const lineExtraWidthMap: Record<number, number> = {};

const QURAN_PAGE_PADDING = 12;

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

  const lines: Record<number, Array<string>> = {};

  Verses[pageNumber].verses
    .flatMap((verse) => {
      const verseKey = verse["verse_key"].split(":");
      const surahNumber = parseInt(verseKey[0]);
      const isFirstAyahInSurah = verseKey[1] === "1";
      const bismillahPre = Chapters[surahNumber - 1].bismillah_pre && isFirstAyahInSurah;
      const beginnings = [];
      if (bismillahPre) {
        beginnings.push({
          code_v2: `SURH-${surahNumber}`,
          line_number: verse.words[0].line_number - 2,
        });
        beginnings.push({
          code_v2: "BSML",
          line_number: verse.words[0].line_number - 1,
        });
      } else if (isFirstAyahInSurah) {
        beginnings.push({
          code_v2: `SURH-${surahNumber}`,
          line_number: verse.words[0].line_number - 1,
        });
      }
      return [...beginnings, ...verse.words];
    })
    .forEach((word) => {
      if (!lines[word.line_number]) lines[word.line_number] = [];
      lines[word.line_number].push(word.code_v2);
    });

  return (
    <>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          paddingHorizontal: QURAN_PAGE_PADDING,
          width: SCREEN_WIDTH,
        }}
        onLayout={onLayoutRootView}
      >
        {Object.values(lines).map((line, i) => {
          return (
            <Text
              key={i}
              style={{
                fontFamily: `page${pageNumber}`,
                fontSize: 30,
                lineHeight: 45,
                paddingHorizontal: 3,
                width: QURAN_PAGE_WIDTH,
              }}
              adjustsFontSizeToFit
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
      <Text
        style={{
          marginRight: isLast ? 0 : 2,
          marginLeft: isMiddle || isLast ? 0 : lineExtraWidthMap[index] ?? 0,
        }}
      >
        {word}
      </Text>
    );
  },
  () => true
);
