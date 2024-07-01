import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert } from "react-native";
import { FormikProvider, useFormik } from "formik";
import MyTextInput from "components/forms/MyTextInput";
import ActionBtn from "components/buttons/ActionBtn";
import { i18n } from "locales/config";
import { forgotPassword } from "services/authService";
import { RootStackParamList } from "navigation/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBar } from "components/AppBar";
import { View } from "tamagui";
type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export const ForgotPasswordScreen: FunctionComponent<Props> = ({ navigation }) => {
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
          //Implement error handling
          err;
        });
    },
  });

  const handleSubmit = () => {
    formik.handleSubmit();
  };

  return (
    <SafeAreaView>
      <AppBar title={i18n.t("resetPassword.title")} />
      <View marginHorizontal={16}>
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
      </View>
    </SafeAreaView>
  );
};
