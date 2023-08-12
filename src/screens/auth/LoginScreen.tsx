import React, { FunctionComponent, useContext } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FormikProvider, useFormik } from "formik";
import MyTextInput from "components/forms/MyTextInput";
import ActionBtn from "components/buttons/ActionBtn";
import AuthContext from "contexts/auth";
import { i18n } from "locales/config";
import Typography from "components/Typography";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Login">;

const LoginScreen: FunctionComponent<Props> = () => {
  const { signIn } = useContext(AuthContext);

  const formik = useFormik({
    initialValues: {
      username: "zaab",
      password: "P@ssw0rd",
      error: "",
    },
    onSubmit: (values, { setErrors }) => {
      setErrors({});
      signIn(values.username, values.password)
        .catch((err: ISignInErrorResponse) => {
          console.log("error", err.response.data.message);
          if (err.response?.data?.message) {
            setErrors({ error: err.response.data.message });
          }
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  const handleSubmit = () => {
    formik.handleSubmit();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Typography type="HeadlineHeavy">{i18n.t("signIn")}</Typography>
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
        {formik.errors.error && <Text style={{ color: "red" }}> {formik.errors.error} </Text>}

        <View style={{ alignItems: "center", marginTop: 25 }}>
          <ActionBtn
            isLoading={formik.isSubmitting}
            title={i18n.t("signIn")}
            onPress={handleSubmit}
          />
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
