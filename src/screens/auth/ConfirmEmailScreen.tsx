import { FunctionComponent, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "tamagui";
import { ActivityIndicator, View } from "react-native";
import Typography from "components/Typography";
import { t } from "locales/config";
import ConfirmedLottie from "assets/lottie/confirmed.json";
import LottieView from "lottie-react-native";
import { Colors } from "constants/Colors";
import ActionButton from "components/buttons/ActionBtn";
import { confirmEmail } from "services/authService";
import { useQuery } from "@tanstack/react-query";
import InputField from "components/forms/InputField";

type Props = NativeStackScreenProps<RootStackParamList, "ConfirmEmailScreen">;

export const ConfirmEmailScreen: FunctionComponent<Props> = ({ navigation, route }) => {
  const [code, setCode] = useState(route.params.code || "");
  const [userId, setUserId] = useState(route.params.userId || "");

  const { refetch, isFetching, error, data } = useQuery({
    queryKey: ["confirmEmail", code, userId],
    queryFn: () => {
      if (!code || !userId) {
        return Promise.reject(new Error(t("confirmEmailScreen.missingFields")));
      }
      return confirmEmail({
        code,
        userId,
      });
    },
    enabled: !!(route.params.code && route.params.userId),
  });

  const handleVerify = () => {
    refetch();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack f={1} gap="$3" justifyContent="center" alignItems="center" px="$4">
        {isFetching ? (
          <>
            <Typography type="SubHeader">{t("confirmEmailScreen.confirming")}...</Typography>
            <ActivityIndicator />
          </>
        ) : data ? (
          <>
            <LottieView
              source={ConfirmedLottie}
              autoPlay
              loop={false}
              style={{ width: 200, height: 200, alignSelf: "center" }}
            />
            <Typography style={{ color: Colors.Success[1] }} type="TitleLight">
              {t("confirmEmailScreen.emailVerified")}
            </Typography>
            <Stack mt={24}>
              <ActionButton
                onPress={() => {
                  navigation.popToTop();
                  navigation.navigate("Login");
                }}
                title={t("registerAccountScreen.backToLogin")}
              />
            </Stack>
          </>
        ) : (
          <>
            <Typography type="SubHeaderHeavy">{t("confirmEmailScreen.verifyEmail")}</Typography>

            <View style={{ width: "100%", gap: 16, marginBottom: 20 }}>
              <InputField
                autoCapitalize="none"
                value={code}
                placeholder={t("confirmEmailScreen.verificationCode")}
                label={t("confirmEmailScreen.verificationCode")}
                onChangeText={setCode}
              />

              <InputField
                autoCapitalize="none"
                value={userId}
                placeholder={t("confirmEmailScreen.userId")}
                label={t("confirmEmailScreen.userId")}
                onChangeText={setUserId}
              />
            </View>

            {error && (
              <Typography style={{ color: Colors.Error[1], marginBottom: 16 }}>
                {(error as Error).message || t("defaultError")}
              </Typography>
            )}

            <Stack gap={12} width="100%">
              <Stack>
                <ActionButton onPress={handleVerify} title={t("confirmEmailScreen.verify")} />
              </Stack>
              <Stack>
                <ActionButton
                  style={{ backgroundColor: Colors.Black[2] }}
                  onPress={() => {
                    navigation.popToTop();
                    navigation.navigate("Login");
                  }}
                  title={t("registerAccountScreen.backToLogin")}
                />
              </Stack>
            </Stack>
          </>
        )}
      </Stack>
    </SafeAreaView>
  );
};
