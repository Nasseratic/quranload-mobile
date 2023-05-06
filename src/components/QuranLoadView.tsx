import React, { FunctionComponent, Children } from "react";
import { View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";
import GeneralConstants from "constants/GeneralConstants";
type Props = SafeAreaViewProps;

const QuranLoadView: FunctionComponent<Props> = ({ children, ...rest }) => {
  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        backgroundColor: "transparent",
      }}
      {...rest}
    >
      <ScrollView
        style={{
          paddingHorizontal: 16,
        }}
      >
        {Children.map(children, (child, i) => {
          return (
            <View
              style={{
                marginTop: i !== 0 ? GeneralConstants.Spacing.md : 0,
              }}
            >
              {child}
            </View>
          );
        })}
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default QuranLoadView;
