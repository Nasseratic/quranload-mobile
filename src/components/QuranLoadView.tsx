import React, { FunctionComponent, Children } from "react";
import { View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";
import GeneralConstants from "constants/GeneralConstants";
import AppBar from "components/AppBar";

interface Props extends SafeAreaViewProps {
  appBar?: Frontend.Content.AppBar;
}

const QuranLoadView: FunctionComponent<Props> = ({ appBar, children, ...rest }) => {
  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        backgroundColor: "transparent",
        flex: 1,
      }}
      {...rest}
    >
      {appBar && <AppBar {...appBar} />}
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
