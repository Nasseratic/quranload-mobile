import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeView } from "components/SafeView";
import { AppBar } from "components/AppBar";
import { ChatItem } from "./components/ChatItem";
import { useUser } from "contexts/auth";
import { useStudentsListInAllTeams } from "services/teamService";
import { ActivityIndicator } from "react-native";
import { cvx } from "api/convex";
import { useQuery } from "convex/react";

export const ChatNewScreen = () => {
  const navigation = useNavigation();
  const user = useUser();
  const { studentsList, isLoadingStudentsList } = useStudentsListInAllTeams();

  const conversations = useQuery(cvx.messages.allMyConversations, {
    userId: user.id,
    teamIds: user.teams.map(({ id }) => id),
  });

  return (
    <SafeView gap={8} px={16}>
      <AppBar title="" />
      {isLoadingStudentsList ? (
        <ActivityIndicator />
      ) : (
        studentsList
          ?.filter(
            ({ id }) =>
              id !== user.id &&
              !conversations?.some((c) => c.senderId === id || c.receiverId === id)
          )
          .map(({ id, fullName }) => (
            <ChatItem
              key={id}
              name={fullName}
              onPress={() => {
                navigation.goBack();
                navigation.navigate("ChatScreen", {
                  title: fullName,
                  interlocutorId: id,
                });
              }}
            />
          ))
      )}
    </SafeView>
  );
};
