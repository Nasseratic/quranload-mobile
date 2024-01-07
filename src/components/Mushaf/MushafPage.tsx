import { QuranPageImageMap } from "assets/quran_images";
import { APPBAR_HEIGHT } from "components/AppBar";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { Image } from "expo-image";
import { View } from "tamagui";

export const ImageMushafPage = ({ pageNumber }: { pageNumber: number }) => {
  return (
    <View px={8} f={1} w={SCREEN_WIDTH} pt={APPBAR_HEIGHT}>
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
