import { FunctionComponent } from "react";
import SegmentedControlTab from "react-native-segmented-control-tab";
import { Colors } from "constants/Colors";
import { View } from "react-native";

interface OwnProps {
  list: string[];
  index: number;
  setIndex: (index: number) => void;
}

type Props = OwnProps;

const TabBox: FunctionComponent<Props> = ({ index, setIndex, list }) => {
  return (
    <View style={{ marginBottom: 10, marginTop: 20 }}>
      <SegmentedControlTab
        values={list}
        selectedIndex={index}
        tabsContainerStyle={{ borderColor: Colors.Gray[1] }}
        tabStyle={{
          borderColor: Colors.Gray[1],
          paddingVertical: 15,
        }}
        tabTextStyle={{ color: Colors.Error[1] }}
        activeTabStyle={{
          backgroundColor: Colors.Primary[1],
          borderColor: Colors.Gray[1],
        }}
        activeTabTextStyle={{ color: Colors.White[1] }}
        borderRadius={30}
        onTabPress={setIndex}
      />
    </View>
  );
};

export default TabBox;
