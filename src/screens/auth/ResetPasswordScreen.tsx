import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FormikProvider, useFormik } from "formik";
import MyTextInput from "components/forms/MyTextInput";
import ActionBtn from "components/buttons/ActionBtn";
import { i18n, t } from "locales/config";
import { RootStackParamList } from "navigation/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBar } from "components/AppBar";
import { Stack, View } from "tamagui";
import { resetPassword } from "services/authService";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { passwordRules } from "./RegisterAccount";
import { useMutation } from "@tanstack/react-query";
import { toast } from "components/Toast";
type Props = NativeStackScreenProps<RootStackParamList, "ResetPassword">;

const validationSchema = z.object({
  username: z.string(),
  password: z.string().regex(passwordRules, t("registerAccountScreen.passwordRules")),
  confirmPassword: z.string().regex(passwordRules, t("registerAccountScreen.passwordRules")),
});

const ResetPasswordScreen: FunctionComponent<Props> = ({ navigation, route }) => {
  const { mutate } = useMutation(resetPassword, {
    onSuccess: () => {
      toast.show({
        status: "Success",
        title: t("resetPassword.resetPasswordSuccess"),
      });
      navigation.goBack();
    },
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
    validateOnMount: true,
    validateOnBlur: true,
    validationSchema: toFormikValidationSchema(validationSchema),
    onSubmit: (values) =>
      mutate({
        ...values,
        ...route.params,
      }),
  });

  const handleSubmit = () => formik.handleSubmit();

  return (
    <SafeAreaView>
      <AppBar title={i18n.t("resetPassword.title")} />
      <Stack gap={16} px={16}>
        <FormikProvider value={formik}>
          <MyTextInput
            placeHolder={i18n.t("username")}
            label={i18n.t("username")}
            onChange={formik.handleChange("username")}
            onBlur={formik.handleBlur("username")}
            value={formik.values.username}
            error={formik.errors.username}
            touched={formik.touched.username}
          />
          <MyTextInput
            placeHolder={t("password")}
            label={t("password")}
            onChange={formik.handleChange("password")}
            onBlur={formik.handleBlur("password")}
            value={formik.values.password}
            error={formik.errors.password}
            touched={formik.touched.password}
          />
          <MyTextInput
            placeHolder={t("registerAccountScreen.confirmPassword")}
            label={t("registerAccountScreen.confirmPassword")}
            onChange={formik.handleChange("confirmPassword")}
            onBlur={formik.handleBlur("confirmPassword")}
            value={formik.values.confirmPassword}
            error={formik.errors.confirmPassword}
            touched={formik.touched.confirmPassword}
          />
          <View style={{ alignItems: "center", marginTop: 25 }}>
            <ActionBtn
              disabled={!formik.isValid}
              isLoading={formik.isSubmitting}
              title={i18n.t("resetPassword.title")}
              onPress={handleSubmit}
            />
          </View>
        </FormikProvider>
      </Stack>
    </SafeAreaView>
  );
};
export default ResetPasswordScreen;
