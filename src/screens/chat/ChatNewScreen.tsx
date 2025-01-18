import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeView } from "components/SafeView";
import { supabase } from "utils/supabase";
import { AppBar } from "components/AppBar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/navigation";
import { ChatItem } from "./components/ChatItem";
import { t } from "locales/config";
import { useUser } from "contexts/auth";
import { IconButton } from "components/buttons/IconButton";
import { Colors } from "constants/Colors";
import PersonsIcon from "components/icons/PersonsIcon";
import PlusIcon from "components/icons/PlusIcon";
import { useStudentsList, useStudentsListInAllTeams } from "services/teamService";
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
