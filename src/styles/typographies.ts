import { StyleSheet } from "react-native";

const fontFamily = {
  NSRegular: "NotoSans-regular",
  NSSemibold: "NotoSans-semibold",
  NSBold: "NotoSans-bold",
};

export default {
  display: StyleSheet.create({
    heavy: {
      fontFamily: fontFamily.NSBold,
      fontSize: 36,
    },
    light: {
      fontFamily: fontFamily.NSRegular,
      fontSize: 36,
    },
  }),
  headline: StyleSheet.create({
    heavy: {
      fontFamily: fontFamily.NSBold,
      fontSize: 24,
    },
    light: {
      fontFamily: fontFamily.NSRegular,
      fontSize: 24,
    },
  }),
  title: StyleSheet.create({
    heavy: {
      fontFamily: fontFamily.NSBold,
      fontSize: 20,
    },
    light: {
      fontFamily: fontFamily.NSRegular,
      fontSize: 20,
    },
  }),
  subheader: StyleSheet.create({
    heavy: {
      fontFamily: fontFamily.NSBold,
      fontSize: 16,
    },
    light: {
      fontFamily: fontFamily.NSRegular,
      fontSize: 16,
    },
  }),
  body: StyleSheet.create({
    heavy: {
      fontFamily: fontFamily.NSBold,
      fontSize: 14,
    },
    light: {
      fontFamily: fontFamily.NSRegular,
      fontSize: 14,
    },
  }),
  caption: StyleSheet.create({
    heavy: {
      fontFamily: fontFamily.NSBold,
      fontSize: 16,
    },
    light: {
      fontFamily: fontFamily.NSRegular,
      fontSize: 16,
    },
  }),
  small: StyleSheet.create({
    heavy: {
      fontFamily: fontFamily.NSBold,
      fontSize: 10,
    },
    light: {
      fontFamily: fontFamily.NSRegular,
      fontSize: 10,
    },
  }),
};
