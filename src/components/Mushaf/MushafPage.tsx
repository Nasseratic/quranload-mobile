import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import * as Font from "expo-font";
import { useCallback, useState } from "react";
import { XSpacer } from "components/Spacer";
import verses from "assets/data/verses.json";
import chapters from "assets/data/chapters.json";
import { FontMap } from "utils/FontMap";
import { MushafPageSurahHeader } from "components/Mushaf/MushafPageSurahHeader";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import Bsml from "assets/bsml.svg";
import { BsmlSvg } from "components/svgs/BsmlSvg";

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

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          width: SCREEN_WIDTH,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

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
            {line.map((word, j) => {
              const isLast = line.length - 1 === j;
              const isMiddle = Math.round((line.length - 1) / 2) === j;
              if (word.startsWith("SURH")) {
                const surahNumber = parseInt(word.split("-")[1]);
                return (
                  <MushafPageSurahHeader
                    key={j}
                    width={QURAN_PAGE_WIDTH}
                    surahNumber={surahNumber}
                  />
                );
              } else if (word == "BSML") {
                return (
                  <View
                    style={{
                      paddingTop: 5,
                      width: QURAN_PAGE_WIDTH,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <BsmlSvg key={j} width={QURAN_PAGE_WIDTH / 2} />
                  </View>
                );
              } else {
                return (
                  <Text key={j}>
                    {(isMiddle || isLast) && <XSpacer space={lineExtraWidthMap[i] ?? 0} />}
                    {word}
                    {isLast ? null : <XSpacer space={2} />}
                  </Text>
                );
              }
            })}
          </Text>
        );
      })}
      {!isLayoutReady && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "white",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}
