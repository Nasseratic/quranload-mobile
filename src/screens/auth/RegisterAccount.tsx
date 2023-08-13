import { FunctionComponent } from "react";
import { i18n } from "locales/config";
import QuranLoadView from "components/QuranLoadView";
import { Image, TouchableOpacity, View } from "react-native";
import { FormikProvider, useFormik } from "formik";
import FormErrorView from "components/forms/FormErrorView";
import ActionBtn from "components/buttons/ActionBtn";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import InputField from "components/forms/InputField";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "RegisterAccount">;

const RegisterAccount: FunctionComponent<Props> = ({ navigation }) => {
  const formik = useFormik({
    initialValues: {
      fullName: "",
      username: "",
      password: "",
      confirmPassword: "",
      error: "",
    },
    onSubmit: (values) => {},
  });
  return (
    <QuranLoadView
      appBar={{
        title: i18n.t("createAccount"),
      }}
    >
      <View style={{ alignItems: "center", marginTop: 50 }}>
        <Image source={require("../../assets/logo.png")} />
      </View>
      <FormikProvider value={formik}>
        <InputField
          value={formik.values.username}
          touched={formik.touched.username}
          error={formik.errors.username}
          placeholder={formik.values.username}
          label={i18n.t("username")}
          onChangeText={formik.handleChange("username")}
          onBlur={formik.handleBlur("username")}
        />
        <InputField
          value={formik.values.password}
          touched={formik.touched.password}
          error={formik.errors.password}
          placeholder={formik.values.password}
          secureTextEntry={true}
          label={i18n.t("changePasswordScreen.newPassword")}
          onChangeText={formik.handleChange("password")}
          onBlur={formik.handleBlur("password")}
        />
        <InputField
          value={formik.values.confirmPassword}
          touched={formik.touched.confirmPassword}
          error={formik.errors.confirmPassword}
          placeholder={formik.values.confirmPassword}
          secureTextEntry={true}
          label={i18n.t("changePasswordScreen.newPasswordAgain")}
          onChangeText={formik.handleChange("newPasswordAgain")}
          onBlur={formik.handleBlur("newPasswordAgain")}
        />
        <FormErrorView error={formik.errors.error} />
        <View style={{ alignItems: "center", marginTop: 25 }}>
          <ActionBtn
            isLoading={formik.isSubmitting}
            title={i18n.t("createAccount")}
            onPress={formik.handleSubmit}
          />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ alignItems: "center", marginTop: 15 }}
          >
            <Typography type="CaptionLight" style={{ color: Colors.Primary[1] }}>
              Allerede en konto? Log ind her
            </Typography>
          </TouchableOpacity>
        </View>
      </FormikProvider>
    </QuranLoadView>
  );
};

export default RegisterAccount;
