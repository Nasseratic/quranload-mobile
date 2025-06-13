import { useContext } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import Typography from "components/Typography";
import { CogIcon } from "assets/icons";
import AuthContext from "contexts/auth";
import { Colors } from "constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { XStack } from "tamagui";
import { ChatIcon } from "./icons/ChatIcon";
import { SupportIcon } from "./icons/SupportIcon";
import { useFeatureFlags } from "hooks/queries/useFeatureFlags";

const UserHeader = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { ff } = useFeatureFlags();
  if (!user) return;

  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
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
          {user && ff?.supportChat && (
            <TouchableOpacity
              hitSlop={10}
              onPress={() =>
                navigation.navigate("ChatScreen", {
                  title: "Support",
                  supportChat: true,
                })
              }
            >
              <SupportIcon size={20} color={Colors.Primary[1]} />
            </TouchableOpacity>
          )}
          {user && ff?.chat && (
            <TouchableOpacity hitSlop={10} onPress={() => navigation.navigate("ChatListScreen")}>
              <ChatIcon size={20} color={Colors.Primary[1]} />
            </TouchableOpacity>
          )}

          <TouchableOpacity hitSlop={10} onPress={() => navigation.navigate("Profile")}>
            <CogIcon width={20} height={18} color={Colors.Primary[1]} />
          </TouchableOpacity>
        </XStack>
      </View>
    </View>
  );
};

export default UserHeader;
