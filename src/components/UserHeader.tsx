import { useContext } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import Typography from "components/Typography";
import { CogIcon } from "assets/icons";
import AuthContext from "contexts/auth";
import { Colors } from "constants/Colors";
import { useNavigation } from "@react-navigation/native";

const UserHeader = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  if (!user) return;

  return (
    <View
      style={{
        paddingTop: 16,
        paddingBottom: 4,
      }}
    >
      <Pressable
        onLongPress={() => {
          navigation.navigate("Mushaf");
        }}
      >
        <Typography type="BodyLight" style={{ opacity: 0.5 }}>
          Assalamu alykum,
        </Typography>
      </Pressable>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography type="HeadlineHeavy">{user?.fullName}</Typography>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <CogIcon width={18} height={18} color={Colors.Primary[1]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserHeader;
