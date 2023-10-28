import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { FormikProvider, useFormik } from "formik";
import MyTextInput from "components/forms/MyTextInput";
import ActionBtn from "components/buttons/ActionBtn";
import { i18n } from "locales/config";
import QuranLoadView from "components/QuranLoadView";
import { forgotPassword } from "services/authService";
import { RootStackParamList } from "navigation/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ResetPassword">;

const ResetPasswordScreen: FunctionComponent<Props> = ({ navigation }) => {
  const formik = useFormik({
    initialValues: {
      userName: "",
    },
    onSubmit: (values) => {
      forgotPassword(values)
        .then(() => {
          formik.resetForm();
          Alert.alert(i18n.t("resetPassword.codeSent"));
          navigation.goBack();
        })
        .catch((err) => {
          console.log(err);
        });
    },
  });

  const handleSubmit = () => {
    formik.handleSubmit();
  };

  return (
    <QuranLoadView
      appBar={{
        title: i18n.t("resetPassword.title"),
      }}
    >
      <StatusBar style="light" />
      <FormikProvider value={formik}>
        <MyTextInput
          placeHolder={i18n.t("username")}
          label={i18n.t("username")}
          onChange={formik.handleChange("userName")}
          onBlur={formik.handleBlur("userName")}
          value={formik.values.userName}
          error={formik.errors.userName}
          touched={formik.touched.userName}
        />

        <View style={{ alignItems: "center", marginTop: 25 }}>
          <ActionBtn
            isLoading={formik.isSubmitting}
            title={i18n.t("resetPassword.title")}
            onPress={handleSubmit}
          />
        </View>
      </FormikProvider>
    </QuranLoadView>
  );
};
export default ResetPasswordScreen;
