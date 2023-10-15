import React, { useContext } from "react";
import { TouchableOpacity, View } from "react-native";
import Typography from "components/Typography";
import { CogIcon } from "assets/icons";
import AuthContext from "contexts/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Colors } from "constants/Colors";
import { Link, useNavigation } from "@react-navigation/native";

const UserHeader = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  if (!user) return;

  return (
    <View>
      <Typography type="BodyLight" style={{ opacity: 0.5 }}>
        Assalamu alykum,
      </Typography>
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
