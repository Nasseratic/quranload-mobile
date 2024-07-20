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
import { useStudentsList } from "services/teamService";
import { useConversations, useLatestTeamMessage } from "./_queries";

export const ChatListScreen = () => {
  const { params } =
    useRoute<NativeStackScreenProps<RootStackParamList, "ChatListScreen">["route"]>();
  const { team } = params;

  const navigation = useNavigation();
  const user = useUser();

  const { latestTeamMessage } = useLatestTeamMessage(team.id);
  const { conversations } = useConversations(team.id);
  const { studentsList } = useStudentsList(team.id);

  const studentsUserHaveNoChatWith = (studentsList ?? []).filter(
    ({ id }) =>
      user.id !== id &&
      !conversations?.some(({ senderId, receiverId }) => senderId === id || receiverId === id)
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
              onPress={() => navigation.navigate("ChatNewScreen", { team })}
            />
          )
        }
      />
      <ChatItem
        name={team.name}
        message={latestTeamMessage}
        avatar={team.organizationLogo}
        onPress={() => navigation.navigate("ChatScreen", { teamId: team.id, title: team.name })}
      />
      {conversations?.map((conversation) => {
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
            name={interlocutorName}
            message={message}
            onPress={() =>
              navigation.navigate("ChatScreen", {
                teamId: team.id,
                title: interlocutorName,
                interlocutorId,
              })
            }
          />
        );
      })}
    </SafeView>
  );
};
