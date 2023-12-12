import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import QuranLoadView from "components/QuranLoadView";
import InputField from "components/forms/InputField";
import ActionButton from "components/buttons/ActionBtn";
import { useFormik } from "formik";
import { changePassword } from "services/profileService";
import * as Yup from "yup";
import FormErrorView from "components/forms/FormErrorView";
import { Alert } from "react-native";
import { RootStackParamList } from "navigation/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ChangePassword">;
const ChangePasswordScreen: FunctionComponent<Props> = ({ navigation }) => {
  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordAgain: "",
      error: "",
    },
    validationSchema: Yup.object().shape({
      newPassword: Yup.string()
        .required("No password provided.")
        .min(6, "Password is too short - should be 8 chars minimum."),
      newPasswordAgain: Yup.string().oneOf([Yup.ref("newPassword")], "Passwords must match"),
    }),
    onSubmit(values, { setErrors }) {
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.newPasswordAgain,
      })
        .then(() => {
          Alert.alert(i18n.t("changePasswordScreen.passwordUpdated"));
          navigation.goBack();
        })
        .catch((error) => {
          if (error.validation) {
            formik.setErrors(error.validation);
          }
          if (error.message) {
            setErrors({ error: error.message });
          }
        })
        .finally(() => formik.setSubmitting(false));
    },
    validateOnBlur: true,
  });

  return (
    <QuranLoadView
      appBar={{
        title: i18n.t("changePasswordScreen.title"),
      }}
    >
      <InputField
        value={formik.values.currentPassword}
        touched={formik.touched.currentPassword}
        error={formik.errors.currentPassword}
        placeholder={formik.values.currentPassword}
        secureTextEntry={true}
        label={i18n.t("changePasswordScreen.currentPassword")}
        onChangeText={formik.handleChange("currentPassword")}
        onBlur={formik.handleBlur("currentPassword")}
      />
      <InputField
        value={formik.values.newPassword}
        touched={formik.touched.newPassword}
        error={formik.errors.newPassword}
        placeholder={formik.values.newPassword}
        secureTextEntry={true}
        label={i18n.t("changePasswordScreen.newPassword")}
        onChangeText={formik.handleChange("newPassword")}
        onBlur={formik.handleBlur("newPassword")}
      />
      <InputField
        value={formik.values.newPasswordAgain}
        touched={formik.touched.newPasswordAgain}
        error={formik.errors.newPasswordAgain}
        placeholder={formik.values.newPasswordAgain}
        secureTextEntry={true}
        label={i18n.t("changePasswordScreen.newPasswordAgain")}
        onChangeText={formik.handleChange("newPasswordAgain")}
        onBlur={formik.handleBlur("newPasswordAgain")}
      />
      <FormErrorView error={formik.errors.error} />

      <ActionButton
        disabled={!formik.isValid}
        isLoading={formik.isSubmitting}
        onPress={formik.handleSubmit}
        title={i18n.t("changePasswordScreen.updatePassword")}
      />
    </QuranLoadView>
  );
};

export default ChangePasswordScreen;
