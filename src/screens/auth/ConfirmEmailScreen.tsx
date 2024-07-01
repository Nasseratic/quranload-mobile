import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "tamagui";
import { ActivityIndicator } from "react-native";
import Typography from "components/Typography";
import { t } from "locales/config";
import ConfirmedLottie from "assets/lottie/confirmed.json";
import LottieView from "lottie-react-native";
import { Colors } from "constants/Colors";
import ActionButton from "components/buttons/ActionBtn";
import { confirmEmail } from "services/authService";
import { useQuery } from "@tanstack/react-query";

type Props = NativeStackScreenProps<RootStackParamList, "ConfirmEmailScreen">;

export const ConfirmEmailScreen: FunctionComponent<Props> = ({ navigation, route }) => {
  const { refetch, isLoading, error } = useQuery({
    queryKey: ["confirmEmail"],
    queryFn: () =>
      confirmEmail({
        ...route.params,
      }),
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack f={1} gap="$3" justifyContent="center" alignItems="center">
        {isLoading ? (
          <>
            <Typography type="SubHeader">{t("confirmEmailScreen.confirming")}...</Typography>
            <ActivityIndicator />
          </>
        ) : error ? (
          <>
            <Typography type="SubHeaderHeavy">{t("defaultError")}</Typography>
            <Stack gap={12}>
              <Stack>
                <ActionButton onPress={() => refetch()} title={t("retry")} />
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
        ) : (
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
        )}
      </Stack>
    </SafeAreaView>
  );
};
