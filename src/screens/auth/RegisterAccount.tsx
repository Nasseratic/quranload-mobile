import { FunctionComponent } from "react";
import { i18n, t } from "locales/config";
import { Image, ImageSourcePropType, TouchableOpacity, View } from "react-native";
import { FormikProvider, useFormik } from "formik";
import FormErrorView from "components/forms/FormErrorView";
import ActionBtn from "components/buttons/ActionBtn";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import InputField from "components/forms/InputField";
import { useMutation } from "@tanstack/react-query";
import { resendVerificationEmail, signUp } from "services/authService";
import { AxiosError } from "axios";
import * as Yup from "yup";
import { MailBoxSvg } from "components/svgs/MailBox";
import GeneralConstants, { SCREEN_WIDTH } from "constants/GeneralConstants";
import { YSpacer } from "components/Spacer";
import TextButton from "components/buttons/TextButton";
import ActionButton from "components/buttons/ActionBtn";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "navigation/navigation";
import { AppBar } from "components/AppBar";
import { ScrollView } from "tamagui";
import Logo from "@assets/logo.png";
import { toast } from "components/Toast";

// min 8 characters, 1 upper case letter, 1 lower case letter, 1 special character and 1 number
const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+]).{8,}$/;

type Props = NativeStackScreenProps<RootStackParamList, "RegisterAccount">;

const RegisterAccount: FunctionComponent<Props> = ({ navigation }) => {
  const { mutate, error, data } = useMutation(signUp);
  const {
    mutate: resendVerification,
    data: resendVerificationData,
    isLoading: isResendingVerification,
  } = useMutation(resendVerificationEmail, {
    onError: (err: AxiosError) => {
      toast.show({ status: "Error", title: t("defaultError") });
      err;
    },
  });

  const insets = useSafeAreaInsets();
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object().shape({
      firstName: Yup.string().required(),
      lastName: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string()
        .required()
        .matches(passwordRules, { message: t("registerAccountScreen.passwordRules") }),
      confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match"),
    }),
    onSubmit: (values, { setSubmitting }) => {
      mutate(values, {
        onSettled: () => setSubmitting(false),
      });
    },
  });

  if (data)
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
        <AppBar title={i18n.t("registerAccountScreen.createAccount")} />
        <View
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View>
            <MailBoxSvg width={SCREEN_WIDTH * 0.6} />
            <YSpacer space={20} />
            <Typography type="TitleHeavy" adjustsFontSizeToFit style={{ width: "100%" }}>
              {t("registerAccountScreen.success")}
            </Typography>
            <Typography type="SubHeaderLight">
              {t("registerAccountScreen.successDescription")}
            </Typography>
            <YSpacer space={12} />
            <TextButton
              disabled={isResendingVerification}
              onPress={() => resendVerification({ email: formik.values.email })}
            >
              {resendVerificationData
                ? t("registerAccountScreen.emailResent")
                : t("registerAccountScreen.resendEmail")}
            </TextButton>
          </View>
        </View>
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <ActionButton
            title={t("registerAccountScreen.backToLogin")}
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppBar title={i18n.t("registerAccountScreen.createAccount")} />
      <ScrollView contentContainerStyle={{ marginHorizontal: 16, paddingBottom: 16 }}>
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <Image source={Logo as ImageSourcePropType} />
        </View>
        <FormikProvider value={formik}>
          <View style={{ gap: GeneralConstants.Spacing.md }}>
            <InputField
              value={formik.values.firstName}
              touched={formik.touched.firstName}
              error={formik.errors.firstName}
              placeholder={formik.values.firstName}
              label={t("registerAccountScreen.firstName")}
              onChangeText={formik.handleChange("firstName")}
              onBlur={formik.handleBlur("firstName")}
            />

            <InputField
              value={formik.values.lastName}
              touched={formik.touched.lastName}
              error={formik.errors.lastName}
              placeholder={formik.values.lastName}
              label={t("registerAccountScreen.lastName")}
              onChangeText={formik.handleChange("lastName")}
              onBlur={formik.handleBlur("lastName")}
            />

            <InputField
              value={formik.values.email}
              touched={formik.touched.email}
              error={formik.errors.email}
              placeholder={formik.values.email}
              label={t("registerAccountScreen.email")}
              onChangeText={formik.handleChange("email")}
              onBlur={formik.handleBlur("email")}
            />

            <InputField
              value={formik.values.password}
              touched={formik.touched.password}
              error={formik.errors.password}
              placeholder={formik.values.password}
              secureTextEntry={true}
              label={t("registerAccountScreen.password")}
              onChangeText={formik.handleChange("password")}
              onBlur={formik.handleBlur("password")}
            />
            <InputField
              value={formik.values.confirmPassword}
              touched={formik.touched.confirmPassword}
              error={formik.errors.confirmPassword}
              placeholder={formik.values.confirmPassword}
              secureTextEntry={true}
              label={t("registerAccountScreen.confirmPassword")}
              onChangeText={formik.handleChange("confirmPassword")}
              onBlur={formik.handleBlur("confirmPassword")}
            />
          </View>
          <FormErrorView error={error as AxiosError} />
          <View style={{ alignItems: "center", marginTop: 25 }}>
            <ActionBtn
              isLoading={formik.isSubmitting}
              title={t("registerAccountScreen.createAccount")}
              onPress={formik.handleSubmit}
            />
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ alignItems: "center", marginTop: 15 }}
            >
              <Typography type="CaptionHeavy" style={{ color: Colors.Primary[1] }}>
                {t("registerAccountScreen.alreadyRegistered")}
              </Typography>
            </TouchableOpacity>
          </View>
        </FormikProvider>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterAccount;
