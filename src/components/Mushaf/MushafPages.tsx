import { Dimensions, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MushafPage } from "./MushafPage";
import { SCREEN_WIDTH } from "constants/GeneralConstants";

export function MushafPages({ pageFrom, pageTo }: { pageFrom: number; pageTo: number }) {
  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
      }}
    >
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
        // data={Array.from({ length: pageTo - pageFrom + 1 }, (_, i) => pageFrom + i)}
        data={[1, 2, 3, 4, 5]}
        renderItem={({ item: pageNumber }) => <MushafPage pageNumber={pageNumber} />}
      />
    </SafeAreaView>
  );
}
