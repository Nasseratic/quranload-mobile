import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeView } from "components/SafeView";
import { supabase } from "utils/supabase";
import { AppBar } from "components/AppBar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/navigation";
import { ChatItem } from "./components/ChatItem";
import { t } from "locales/config";
import { useUser } from "contexts/auth";
import { useQuery } from "@tanstack/react-query";
import { IconButton } from "components/buttons/IconButton";
import { Colors } from "constants/Colors";
import PersonsIcon from "components/icons/PersonsIcon";
import PlusIcon from "components/icons/PlusIcon";
import { fetchStudentsList, useStudentsList } from "services/teamService";
import { ActivityIndicator } from "react-native";
import { useConversations } from "screens/chat/_queries";

export const ChatNewScreen = () => {
  const { params } =
    useRoute<NativeStackScreenProps<RootStackParamList, "ChatListScreen">["route"]>();
  const { team } = params;

  const navigation = useNavigation();
  const currentUser = useUser();
  const { studentsList, isLoadingStudentsList } = useStudentsList(team.id);

  const { conversations } = useConversations(team.id);

  return (
    <SafeView gap={8} px={16}>
      <AppBar title="" />
      {isLoadingStudentsList ? (
        <ActivityIndicator />
      ) : (
        studentsList
          ?.filter(
            ({ id }) =>
              id !== currentUser.id &&
              !conversations?.some((c) => c.senderId === id || c.receiverId === id)
          )
          .map((record) => {
            // If the sender is the logged-in user, the interlocutor should be the receiverId
            const interlocutorName = record.fullName;
            return (
              <ChatItem
                key={record.id}
                name={interlocutorName}
                onPress={() => {
                  navigation.goBack();
                  navigation.navigate("ChatScreen", {
                    teamId: team.id,
                    title: interlocutorName,
                    interlocutorId: record.id,
                  });
                }}
              />
            );
          })
      )}
    </SafeView>
  );
};
