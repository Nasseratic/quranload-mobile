import { StyleSheet } from "react-native";

const fontFamily = {
  NSRegular: "NotoSans-regular",
  NSSemibold: "NotoSans-semibold",
  NSBold: "NotoSans-bold",
};

const typographiesStyles = StyleSheet.create({
  DisplayHeavy: { fontFamily: fontFamily.NSBold, fontSize: 36 },
  DisplayLight: { fontFamily: fontFamily.NSRegular, fontSize: 36 },
  HeadlineHeavy: { fontFamily: fontFamily.NSBold, fontSize: 24 },
  HeadlineLight: { fontFamily: fontFamily.NSRegular, fontSize: 24 },
  TitleHeavy: { fontFamily: fontFamily.NSBold, fontSize: 20 },
  TitleLight: { fontFamily: fontFamily.NSRegular, fontSize: 20 },
  SubHeaderHeavy: { fontFamily: fontFamily.NSBold, fontSize: 16 },
  SubHeaderLight: { fontFamily: fontFamily.NSRegular, fontSize: 16 },
  BodyHeavy: { fontFamily: fontFamily.NSBold, fontSize: 14 },
  BodyLight: { fontFamily: fontFamily.NSRegular, fontSize: 14 },
  CaptionHeavy: { fontFamily: fontFamily.NSBold, fontSize: 16 },
  CaptionLight: { fontFamily: fontFamily.NSRegular, fontSize: 16 },
  SmallHeavy: { fontFamily: fontFamily.NSBold, fontSize: 10 },
  SmallLight: { fontFamily: fontFamily.NSRegular, fontSize: 10 },
});

export type TypographyType = keyof typeof typographiesStyles;

export default typographiesStyles;
