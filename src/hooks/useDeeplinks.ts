import { useCallback, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useMaybeUser, useUser } from "contexts/auth";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { P, match } from "ts-pattern";
import { navigationRef } from "navigation/navRef";

const patterns = {
  //eg. com.quranloadapp.quranload://?code=CfDJ8JOKDTiAr3BNhh4CzGepFlNsOMPVUylNOmmNDb2xqTKUuKPE%2fBSHqjW%2b3%2bcIOE0jVLDp4AqIpEyhQogRoBocDm1wVbbeGQLO6QW6K5lA%2btycRAXWyrdCYeAjuFokR7HXGoE0Zbwk9MgedPKqI67G5bvtt9ukCwCuIYWLr4FAN86hc%2f7qstTKETbaxqljZ%2fjXheejUqudAI%2bpUec%2bEhuiTm%2bU%2fOXlK9K%2fArRyj6geaznJ&type=resetPassword
  resetPassword: {
    type: "resetPassword",
    code: P.string,
  },
  //eg. com.quranloadapp.quranload://?code=CfDJ8JOKDTiAr3BNhh4CzGepFlM6B1KTImpcZN%2b0kuW4TI4gNxG9iOmhi1uAMwqjGM0WE42wI3l92D4tR9hLVCDGDaQb2IDKU0%2bO4twc2V%2fYvhMWXXOQIo5XxO6YbJ5L5fVh0pPEvNi3x5wcel2qaJoLIS0tsgjpy4Y3Dk9IJGyQ1ZQgU41imSUY4JKaXGyfH1cgO1tb4cUYwd9hQT74fTPcZaDZmpIWgTaOS4d02Ci4P0D6N8YnFPuX4G8OPsR8thM0Qg%3d%3d&userId=d6ac2868-1833-4bc3-27ea-08dc94918510&type=confirmEmail
  confirmEmail: {
    type: "confirmEmail",
    code: P.string,
    userId: P.string,
  },
  message: {
    type: "message",
    message: {
      teamId: P.string.optional(),
      senderId: P.string,
      senderName: P.string,
      receiverId: P.string.optional(),
    },
  },
};

type DeepLinkParams = P.infer<typeof patterns>[keyof typeof patterns];

const useHandleDeepLink = () => {
  const { navigate, goBack } = useNavigation();
  const user = useMaybeUser();

  const handleDeepLink = async (deepLink: DeepLinkParams) => {
    match(deepLink)
      .with(patterns.message, ({ message }) => {
        if (navigationRef.current?.getCurrentRoute()?.name === "ChatScreen") goBack();
        navigate("ChatScreen", {
          teamId: message.teamId ?? undefined,
          interlocutorId: message.receiverId ? message.senderId : undefined,
          title: message.receiverId
            ? message.senderName
            : user?.teams.find((team) => team.id == message.teamId)?.name ?? "",
        });
      })
      .with(patterns.resetPassword, (params) => navigate("ResetPassword", params))
      .with(patterns.confirmEmail, (params) => navigate("ConfirmEmailScreen", params))
      .otherwise(() => {
        console.log("Unknown deeplink with params:", deepLink);
      });
  };

  return { handleDeepLink };
};

export function useDeepLinkHandler() {
  const { handleDeepLink } = useHandleDeepLink();

  useEffect(() => {
    const urlEventListener = Linking.addEventListener("url", (event) => {
      try {
        const urlParams = Linking.parse(event.url ?? `${Constants.expoConfig?.slug}://`);
        handleDeepLink(urlParams.queryParams as DeepLinkParams);
      } catch {
        console.error("Failed to parse deep link");
      }
    });

    return () => {
      urlEventListener.remove();
    };
  }, []);
}

export const useNotificationActionHandler = () => {
  const { handleDeepLink } = useHandleDeepLink();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (lastNotificationResponse?.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
      return;
    }

    const data = lastNotificationResponse.notification.request.content.data;

    if (!data) {
      return;
    }

    handleDeepLink(data as DeepLinkParams);
  }, [lastNotificationResponse]);
};

Notifications.setNotificationHandler({
  handleNotification: async ({ request: { content } }) => {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    return match([content.data, currentRoute])
      .with(
        [
          patterns.message,
          {
            name: "ChatScreen",
            params: {
              teamId: P.string,
              interlocutorId: P.string.optional(),
            },
          },
        ],
        ([{ message }, { params }]) => {
          const isSameChat = params.interlocutorId
            ? params.interlocutorId == message.senderId
            : message.teamId === params.teamId;
          return {
            shouldShowAlert: !isSameChat,
            shouldPlaySound: !isSameChat,
            shouldSetBadge: false,
          };
        }
      )
      .otherwise(() => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }));
  },
});
