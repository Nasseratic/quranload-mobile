import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MushafPagesHeader } from "./MushafPagesHeader";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { useState } from "react";
import Chapters from "assets/data/chapters.json";
import { ImageMushafPage } from "components/Mushaf/MushafPage";

export function MushafPages({ pageFrom, pageTo }: { pageFrom: number; pageTo: number }) {
  const findSurahNameOfPage = (pageNumber: number) => {
    const chapter = Chapters.find((chapter) => {
      const { pages } = chapter;
      if (!Array.isArray(pages)) {
        return false;
      }

      const [startPage, endPage] = pages;
      return (
        typeof startPage === "number" &&
        typeof endPage === "number" &&
        pageNumber >= startPage &&
        pageNumber <= endPage
      );
    });

    return chapter?.name_simple;
  };

  const [surahName, setSurahName] = useState(findSurahNameOfPage(pageFrom));
  const [currentPageNumber, setCurrentPageNumber] = useState(pageFrom);
  const [pageOrderInHW, setPageOrderInHW] = useState(1);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
      }}
    >
      {surahName && (
        <MushafPagesHeader
          surahName={surahName}
          currentPageNumber={currentPageNumber}
          pageOrderInHW={pageOrderInHW}
          numberOfPagesInHW={pageTo - pageFrom + 1}
        />
      )}
      <FlatList
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toString()}
        horizontal
        pagingEnabled
        inverted
        initialNumToRender={1}
        getItemLayout={(_, index) => ({
          index,
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
        })}
        onMomentumScrollEnd={(event) => {
          const maxVal = pageTo - pageFrom;
          const currentIndex = Math.floor(
            Math.floor(event.nativeEvent.contentOffset.x) /
              Math.floor(event.nativeEvent.layoutMeasurement.width)
          );
          const index = Math.min(Math.max(currentIndex, 0), maxVal);
          setPageOrderInHW(index + 1);
          setCurrentPageNumber(pageFrom + index);
          setSurahName(findSurahNameOfPage(pageFrom + index));
        }}
        data={Array.from({ length: pageTo - pageFrom + 1 }, (_, i) => pageFrom + i)}
        renderItem={({ item: pageNumber }) => <ImageMushafPage pageNumber={pageNumber} />}
      />
    </SafeAreaView>
  );
}
