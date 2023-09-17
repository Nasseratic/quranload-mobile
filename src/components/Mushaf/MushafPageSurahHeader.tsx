import { useFonts } from "expo-font";
import { View, ImageBackground, Text } from "react-native";

export function MushafPageSurahHeader({
  width,
  surahNumber,
}: {
  width: number;
  surahNumber: number;
}) {
  const [fontsLoaded] = useFonts({
    surahName1: require("assets/fonts/surahName1.otf"),
    surahName2: require("assets/fonts/surahName2.otf"),
  });

  return (
    <View style={{ paddingTop: 6 }}>
      <ImageBackground
        style={{
          width,
          height: width * 0.12,
          justifyContent: "center",
          alignItems: "center",
        }}
        source={require("assets/surahheader.png")}
      >
        {fontsLoaded && (
          <View
            style={{
              position: "absolute",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                fontSize: 55,
                fontFamily: surahNumber > 59 ? "surahName2" : "surahName1",
              }}
            >
              {surahNameCharMap[surahNumber]}
            </Text>
            <Text style={{ fontSize: 37, fontFamily: "surahName1" }}>0</Text>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

const surahNameCharMap =
  "_123456789abcdefghijklmnopqrstuvwxABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzGHIJKLMNOPQRSTUVWXYZ123456789";
