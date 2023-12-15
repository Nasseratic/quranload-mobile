import { FunctionComponent, useContext } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormikProvider, useFormik } from "formik";
import MyTextInput from "components/forms/MyTextInput";
import ActionBtn from "components/buttons/ActionBtn";
import AuthContext from "contexts/auth";
import { i18n } from "locales/config";
import FormErrorView from "components/forms/FormErrorView";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import { RootStackParamList } from "navigation/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: FunctionComponent<Props> = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);

  const formik = useFormik({
    initialValues: {
      username: "zaab-student",
      password: "P@ssw0rd",
      error: "",
    },
    onSubmit: (values, { setErrors }) => {
      setErrors({});
      signIn(values.username, values.password).catch((err: ISignInErrorResponse) => {
        if (err.response?.data?.message) {
          setErrors({ error: err.response.data.message });
        }
        formik.setSubmitting(false);
      });
    },
  });

  const handleSubmit = () => {
    formik.handleSubmit();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <Image source={require("../../assets/logo.png")} />
      </View>
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
          placeHolder={i18n.t("password")}
          label={i18n.t("password")}
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
            title={i18n.t("signIn")}
            onPress={handleSubmit}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("ResetPassword")}
            style={{ alignItems: "center", marginTop: 15 }}
          >
            <Typography type="CaptionLight" style={{ color: Colors.Primary[1] }}>
              {/* TODO: translate */}
              Glemt adgangskode?
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("RegisterAccount")}
            style={{ alignItems: "center", marginTop: 15 }}
          >
            <Typography type="CaptionHeavy" style={{ color: Colors.Primary[1] }}>
              {/* TODO: translate */}
              Ikke en konto? Opret konto
            </Typography>
          </TouchableOpacity>
        </View>
      </FormikProvider>
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
