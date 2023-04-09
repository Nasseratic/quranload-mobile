import React, { FunctionComponent } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";
type Props = SafeAreaViewProps;

const QuranLoadView: FunctionComponent<Props> = ({ children, ...rest }) => {
  return (
    <SafeAreaView
      style={{
        paddingHorizontal: 16,
      }}
      {...rest}
    >
      {children}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default QuranLoadView;
