import { Dimensions, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MushafPage } from "./MushafPage";

export function MushafPages() {
  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <FlatList
        style={{
          flex: 1,
        }}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toString()}
        horizontal
        pagingEnabled
        inverted
        data={[260, 261, 262, 263, 264]}
        renderItem={({ item: pageNumber }) => <MushafPage pageNumber={pageNumber} />}
      />
    </SafeAreaView>
  );
}
