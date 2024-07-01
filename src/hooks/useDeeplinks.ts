import { useCallback, useEffect } from "react";
import * as Linking from "expo-linking";
import { P, match } from "ts-pattern";
import { useNavigation } from "@react-navigation/native";

// Nasseratic+8876782@gmail.com
// 1234Qwer!!

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
};

type DeepLinkParams = P.infer<typeof patterns>[keyof typeof patterns];

export const useDeepLinks = () => {
  const { navigate } = useNavigation();

  const handleOpenURL = useCallback(
    (event: { url: string }) => {
      const params = Linking.parse(event.url).queryParams as DeepLinkParams;
      match(params)
        .with(patterns.resetPassword, (params) => navigate("ResetPassword", params))
        .with(patterns.confirmEmail, (params) => navigate("ConfirmEmailScreen", params))
        .otherwise(() => {
          console.log(params);
          console.log("Unknown deeplink", event.url);
        });
    },
    [navigate]
  );

  useEffect(() => {
    const listener = Linking.addEventListener("url", handleOpenURL);
    return () => {
      listener.remove();
    };
  }, [handleOpenURL]);
};
