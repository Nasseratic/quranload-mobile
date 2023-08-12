import { FunctionComponent, useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import QuranLoadView from "components/QuranLoadView";
import InputField from "components/forms/InputField";
import ActionButton from "components/buttons/ActionBtn";
import { useFormik } from "formik";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "ChangePassword">;
interface FormValues {
  currentPassword: string;
  newPassword: string;
  newPasswordAgain: string;
}
const ChangePasswordScreen: FunctionComponent<Props> = ({ navigation }) => {
  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordAgain: "",
    } as FormValues,
    onSubmit(values) {
      console.log(values);
    },
    validateOnBlur: true,
    validate: (values) => {
      const errors: FormValues = {
        currentPassword: "",
        newPassword: "",
        newPasswordAgain: "",
      };

      if (!values.currentPassword) {
        errors.currentPassword = i18n.t("changePasswordScreen.enterCurrentPassword");
      }

      if (!values.newPassword) {
        errors.newPassword = i18n.t("changePasswordScreen.enterNewPassword");
      }

      if (!values.newPasswordAgain) {
        errors.newPasswordAgain = i18n.t("changePasswordScreen.repeatNewPassword");
      }

      if (
        values.newPassword.length > 0 &&
        values.newPasswordAgain.length > 0 &&
        values.newPassword !== values.newPasswordAgain
      ) {
        errors.newPasswordAgain = i18n.t("changePasswordScreen.passwordsDoNotMatch");
      }

      return errors;
    },
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
      <ActionButton
        onPress={() => console.log("update password")}
        title={i18n.t("changePasswordScreen.updatePassword")}
      />
    </QuranLoadView>
  );
};

export default ChangePasswordScreen;
