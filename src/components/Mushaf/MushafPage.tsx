import { QuranPageImageMap } from "assets/quran_images";
import { SCREEN_WIDTH, IS_IOS } from "constants/GeneralConstants";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";

export const ImageMushafPage = ({ pageNumber }: { pageNumber: number }) => {
  const insets = useSafeAreaInsets();
  return (
    <View px={8} f={1} w={SCREEN_WIDTH} pb={(IS_IOS ? 40 : 90) + insets.bottom}>
      <Image
        style={{
          width: "100%",
          flex: 1,
        }}
        contentFit="contain"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        source={QuranPageImageMap[pageNumber as keyof typeof QuranPageImageMap]}
      />
    </View>
  );
};
