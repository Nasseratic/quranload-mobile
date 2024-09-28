import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageMushafPage } from "components/Mushaf/MushafPage";
import { useKeepAwake } from "expo-keep-awake";

export function MushafScreen() {
  useKeepAwake();

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
        data={Array.from({ length: 604 }, (_, i) => i + 1)}
        renderItem={({ item: pageNumber }) => <ImageMushafPage pageNumber={pageNumber} />}
      />
    </SafeAreaView>
  );
}
