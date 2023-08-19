import { Dimensions, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MushafPage } from "./MushafPage";
import { SCREEN_WIDTH } from "constants/GeneralConstants";

export function MushafPages() {
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
        data={[260, 261, 262, 263, 264]}
        renderItem={({ item: pageNumber }) => <MushafPage pageNumber={pageNumber} />}
      />
    </SafeAreaView>
  );
}
