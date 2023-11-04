import { FunctionComponent, Children } from "react";
import { View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaViewProps, useSafeAreaInsets } from "react-native-safe-area-context";
import GeneralConstants from "constants/GeneralConstants";
import { AppBar, AppBarProps } from "components/AppBar";

interface Props extends SafeAreaViewProps {
  appBar?: AppBarProps;
}

const QuranLoadView: FunctionComponent<Props> = ({ appBar, children, ...rest }) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        backgroundColor: "transparent",
        flex: 1,
        paddingTop: insets.top, // 16 is the default padding
      }}
      {...rest}
    >
      {appBar && <AppBar {...appBar} />}
      <ScrollView
        alwaysBounceVertical={false}
        style={{
          paddingHorizontal: 16,
        }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 16,
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
    </View>
  );
};

export default QuranLoadView;
