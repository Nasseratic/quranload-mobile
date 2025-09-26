import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeView } from "components/SafeView";
import { AppBar } from "components/AppBar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/navigation";
import { ChatItem } from "./components/ChatItem";
import { t } from "locales/config";
import { useUser } from "contexts/auth";
import { IconButton } from "components/buttons/IconButton";
import { Colors } from "constants/Colors";
import PlusIcon from "components/icons/PlusIcon";
import { useStudentsListInAllTeams } from "services/teamService";
// import { useQuery } from "convex/react";
// import { cvx } from "api/convex";
import { EmptyState } from "components/EmptyState";

export const ChatListScreen = () => {
  const navigation = useNavigation();
  const user = useUser();

  const { studentsList } = useStudentsListInAllTeams();

  // const conversations = useQuery(cvx.messages.allMyConversations, {
  //   userId: user.id,
  //   teamIds: user.teams.map(({ id }) => id),
  // });
  const conversations: Array<{
    senderId?: string | null;
    receiverId?: string | null;
    receiverName?: string | null;
    senderName?: string | null;
    conversationId: string;
    text?: string | null;
  }> = [];

  // TODO: allow starting a chat with a teacher
  const studentsUserHaveNoChatWith = (studentsList ?? []).filter(
    ({ id }) =>
      user.id !== id &&
      !conversations?.some(({ senderId, receiverId }) => senderId === id || receiverId === id)
  );

  const activeTeamsWithNoChat = user.teams.filter(
    ({ id, isActive }) =>
      isActive && !conversations?.some(({ conversationId }) => conversationId === id)
  );
  const shouldShowNewChatButton = studentsUserHaveNoChatWith.length > 0;

  return (
    <SafeView gap={8} px={16}>
      <AppBar
        title={t("chats")}
        rightComponent={
          shouldShowNewChatButton && (
            <IconButton
              size="xs"
              icon={<PlusIcon color={Colors.Primary[1]} size={28} />}
              onPress={() => navigation.navigate("ChatNewScreen")}
            />
          )
        }
      />
      {activeTeamsWithNoChat.length === 0 && (!conversations || conversations.length === 0) && (
        <EmptyState title={t("chatList.noChats")} description={t("chatList.noChatsDescription")} />
      )}

      {activeTeamsWithNoChat.map((team) => (
        <ChatItem
          key={team.id}
          name={team.name}
          avatar={team.organizationLogo}
          onPress={() =>
            navigation.navigate("ChatScreen", {
              title: team.organizationName,
              teamId: team.id,
            })
          }
        />
      ))}
      {conversations?.map((conversation) => {
        const team = user.teams.find(({ id }) => id === conversation.conversationId);
        // If the sender is the logged-in user, the interlocutor should be the receiverId
        const interlocutorName =
          (conversation.senderId == user.id
            ? conversation.receiverName
            : conversation.senderName) || "";

        const interlocutorId =
          (conversation.senderId == user.id ? conversation.receiverId : conversation.senderId) ??
          undefined;

        const message = conversation.text || "Media";

        return (
          <ChatItem
            key={conversation.conversationId}
            name={team ? team.name : interlocutorName}
            message={message}
            avatar={team?.organizationLogo}
            onPress={() =>
              navigation.navigate("ChatScreen", {
                title: interlocutorName,
                ...(team ? { teamId: team.id } : { interlocutorId }),
              })
            }
          />
        );
      })}
    </SafeView>
  );
};
