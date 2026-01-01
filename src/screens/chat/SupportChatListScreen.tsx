import { useNavigation } from "@react-navigation/native";
import { SafeView } from "components/SafeView";
import { AppBar } from "components/AppBar";
import { ChatItem } from "./components/ChatItem";
import { t } from "locales/config";
import { useQuery } from "convex/react";
import { cvx } from "api/convex";
import { EmptyState } from "components/EmptyState";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { Stack, Separator } from "tamagui";
import { Colors } from "constants/Colors";
import Typography from "components/Typography";
import { useMemo } from "react";

export const SupportChatListScreen = () => {
  const navigation = useNavigation();

  const supportConversations = useQuery(cvx.messages.allSupportConversations);

  const { activeConversations, archivedConversations } = useMemo(() => {
    if (!supportConversations) return { activeConversations: [], archivedConversations: [] };

    return {
      activeConversations: supportConversations.filter((conv) => !conv.archived),
      archivedConversations: supportConversations.filter((conv) => conv.archived),
    };
  }, [supportConversations]);

  if (supportConversations === undefined) {
    return (
      <SafeView f={1} jc="center" ai="center">
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
        <Stack f={1} jc="center">
          <ActivityIndicator size="large" />
        </Stack>
      </SafeView>
    );
  }

  const renderConversation = (conversation: any) => {
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
  };

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
        <Stack gap={16}>
          {/* Active Conversations Section */}
          {activeConversations.length > 0 && (
            <Stack gap={8}>
              <Typography type="SubHeaderHeavy" style={{ color: Colors.Black[1], paddingTop: 8 }}>
                Active
              </Typography>
              {activeConversations.map(renderConversation)}
            </Stack>
          )}

          {/* Archived Conversations Section */}
          {archivedConversations.length > 0 && (
            <Stack gap={8}>
              {activeConversations.length > 0 && <Separator marginVertical={8} />}
              <Typography type="SubHeaderHeavy" style={{ color: Colors.Black[2] }}>
                Archived
              </Typography>
              {archivedConversations.map(renderConversation)}
            </Stack>
          )}
        </Stack>
      )}
    </SafeView>
  );
};
