import { QuranPageImageMap } from "assets/quran_images";
import { SCREEN_WIDTH, IS_IOS } from "constants/GeneralConstants";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, View } from "tamagui";
import { MUSHUF_PAGE_HEADER_HEIGHT } from "./MushafPagesHeader";

export const ImageMushafPage = ({ pageNumber }: { pageNumber: number }) => {
  const insets = useSafeAreaInsets();
  return (
    <Stack>
      <View px={8} f={1} w={SCREEN_WIDTH} pt={MUSHUF_PAGE_HEADER_HEIGHT} pb={105 + insets.bottom}>
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
    </Stack>
  );
};
