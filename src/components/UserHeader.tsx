import { useContext } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import Typography from "components/Typography";
import { CogIcon } from "assets/icons";
import AuthContext from "contexts/auth";
import { Colors } from "constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { XStack } from "tamagui";
import { ChatIcon } from "./icons/ChatIcon";
import { useFeatureFlags } from "hooks/queries/useFeatureFlags";

const UserHeader = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { ff } = useFeatureFlags();
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
        <XStack gap={16} jc="center" ai="center">
          {/* TODO?: If there's only 1 active team, navigate to ChatListScreen OR show team status + archive option */}
          {user && ff?.chat && (
            <TouchableOpacity onPress={() => navigation.navigate("ChatListScreen")}>
              <ChatIcon size={20} color={Colors.Primary[1]} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <CogIcon width={20} height={18} color={Colors.Primary[1]} />
          </TouchableOpacity>
        </XStack>
      </View>
    </View>
  );
};

export default UserHeader;
