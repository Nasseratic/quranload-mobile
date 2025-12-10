import { FunctionComponent, useContext } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ImageSourcePropType,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormikProvider, useFormik } from "formik";
import MyTextInput from "components/forms/MyTextInput";
import ActionBtn from "components/buttons/ActionBtn";
import AuthContext from "contexts/auth";
import { t } from "locales/config";
import FormErrorView from "components/forms/FormErrorView";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import { RootStackParamList } from "navigation/navigation";
import Logo from "@assets/logo.png";
import { ScrollView, Stack } from "tamagui";
import * as Updates from "expo-updates";
import { isDevelopmentBuild } from "expo-dev-client";
import DevelopmentUserSelection, { DevelopmentUser } from "components/DevelopmentUserSelection";
import { format } from "date-fns";
import { toast } from "components/Toast";
import { AppVersion } from "components/Version";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: FunctionComponent<Props> = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const formik = useFormik({
    initialValues: {
      username: "",
      password: isDevelopmentBuild() ? "P@ssw0rd" : "",
      error: "",
    },
    onSubmit: (values, { setErrors }) => {
      setErrors({});

      // Check for support credentials
      if (values.username.trim() === "support@ql.com" && values.password === "support") {
        // Navigate directly to support chat list screen
        navigation.navigate("SupportChatListScreen");
        formik.setSubmitting(false);
        return;
      }

      signIn(values.username.trim(), values.password).catch(
        (err: Error & { data?: { message?: string } }) => {
          console.log(err);
          // Handle Convex Auth errors (err.message) and legacy errors
          const errorMessage = err?.message || err?.data?.message || t("loginScreen.invalidCredentials");
          setErrors({ error: errorMessage });
          formik.setSubmitting(false);
        }
      );
    },
  });

  const handleSubmit = () => {
    formik.handleSubmit();
  };

  const setUserCredentials = ({ username, password }: DevelopmentUser) => {
    formik.setValues({
      username,
      password,
      error: "",
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ alignItems: "center" }}>
          <Image source={Logo as ImageSourcePropType} />
        </View>
        <DevelopmentUserSelection setUserCredentials={setUserCredentials} />
        <FormikProvider value={formik}>
          <MyTextInput
            placeHolder={t("loginScreen.username")}
            label={t("loginScreen.username")}
            onChange={formik.handleChange("username")}
            onBlur={formik.handleBlur("username")}
            value={formik.values.username}
            error={formik.errors.username}
            touched={formik.touched.username}
          />
          <MyTextInput
            isSecure
            placeHolder={t("loginScreen.password")}
            label={t("loginScreen.password")}
            onChange={formik.handleChange("password")}
            onBlur={formik.handleBlur("password")}
            value={formik.values.password}
            error={formik.errors.password}
            touched={formik.touched.password}
          />
          <FormErrorView error={formik.errors.error} />
          <View style={{ alignItems: "center", marginTop: 25 }}>
            <ActionBtn
              isLoading={formik.isSubmitting}
              title={t("loginScreen.signIn")}
              onPress={handleSubmit}
            />
            <Stack gap={12} mt={24}>
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                style={{ alignItems: "center" }}
              >
                <Typography type="CaptionLight" style={{ color: Colors.Primary[1] }}>
                  {t("loginScreen.forgotPassword")}
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("ConfirmEmailScreen", { code: "", userId: "" })}
                style={{ alignItems: "center" }}
              >
                <Typography type="CaptionLight" style={{ color: Colors.Primary[1] }}>
                  {t("registerAccountScreen.verifyEmail")}
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("RegisterAccount")}
                style={{ alignItems: "center" }}
              >
                <Typography type="CaptionHeavy" style={{ color: Colors.Primary[1] }}>
                  {t("loginScreen.notRegistered")}
                </Typography>
              </TouchableOpacity>
            </Stack>
          </View>
        </FormikProvider>
      </ScrollView>
      <AppVersion />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignContent: "center",
  },
});
export default LoginScreen;
