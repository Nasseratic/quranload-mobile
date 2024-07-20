import { useNavigation } from "@react-navigation/native";
import { SafeView } from "components/SafeView";
import { AppBar } from "components/AppBar";
import { ChatItem } from "./components/ChatItem";
import { t } from "locales/config";
import Typography from "components/Typography";
import { useAuth } from "contexts/auth";

export const TeamListScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const activeTeams = user!.teams.filter((team) => team.isActive);
  const inactiveTeams = user!.teams.filter((team) => !team.isActive);

  return (
    <SafeView gap={8} px={16}>
      <AppBar title={t("teams")} />
      {activeTeams.length > 0 && (
        <>
          <Typography type="BodyLight" style={{ textTransform: "uppercase" }}>
            {t("active")}
          </Typography>
          {activeTeams.map((team) => (
            <ChatItem
              key={team.id}
              name={team.name}
              message={team.description}
              isMultiLine
              avatar={team.organizationLogo}
              onPress={() => navigation.navigate("ChatListScreen", { team })}
            />
          ))}
        </>
      )}
      {inactiveTeams.length > 0 && (
        <>
          <Typography type="BodyLight" style={{ textTransform: "uppercase" }}>
            {t("inactive")}
          </Typography>
          {inactiveTeams.map((team) => (
            <ChatItem
              key={team.id}
              name={team.name}
              message={team.description}
              isMultiLine
              avatar={team.organizationLogo}
              onPress={() => navigation.navigate("ChatListScreen", { team })}
            />
          ))}
        </>
      )}
    </SafeView>
  );
};
