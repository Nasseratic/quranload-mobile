import { useNavigation } from "@react-navigation/native";
import { SafeView } from "components/SafeView";
import { AppBar } from "components/AppBar";
import { ChatItem } from "./components/ChatItem";
import { t } from "locales/config";
// import { useQuery } from "convex/react";
// import { cvx } from "api/convex";
import { EmptyState } from "components/EmptyState";
// import { ActivityIndicator, TouchableOpacity } from "react-native";
import { TouchableOpacity } from "react-native";
// import { Stack } from "tamagui";
import { Colors } from "constants/Colors";
import Typography from "components/Typography";

export const SupportChatListScreen = () => {
  const navigation = useNavigation();

  // const supportConversations = useQuery(cvx.messages.allSupportConversations);
  const supportConversations: Array<{
    conversationId: string;
    senderName?: string | null;
    text?: string | null;
  }> = [];

  return (
    <SafeView gap={8} px={16}>
      <AppBar
        title="Support Conversations"
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={{ paddingHorizontal: 8 }}
          >
            <Typography type="CaptionHeavy" style={{ color: Colors.Primary[1] }}>
              Logout
            </Typography>
          </TouchableOpacity>
        }
      />

      {supportConversations.length === 0 ? (
        <EmptyState
          title="No Support Conversations"
          description="No users have contacted support yet."
        />
      ) : (
        supportConversations.map((conversation) => {
          // Extract userId from conversationId (format: "support_userId")
          const userId = conversation.conversationId.replace("support_", "");
          const userName = conversation.senderName || `User ${userId}`;
          const message = conversation.text || "Media";

          return (
            <ChatItem
              key={conversation.conversationId}
              name={userName}
              message={message}
              onPress={() =>
                navigation.navigate("ChatScreen", {
                  title: `Support - ${userName}`,
                  supportChat: true,
                  supportUserId: userId,
                })
              }
            />
          );
        })
      )}
    </SafeView>
  );
};
