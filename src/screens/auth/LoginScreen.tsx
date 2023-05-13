import React, { FunctionComponent, useContext } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import typographies from "styles/typographies";
import { StatusBar } from "expo-status-bar";
import GeneralConstants from "constants/GeneralConstants";
import { FormikProvider, useFormik } from "formik";
import MyTextInput from "components/forms/MyTextInput";
import ActionBtn from "components/buttons/ActionBtn";
import AuthContext from "contexts/auth";
import { i18n } from "locales/config";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Login">;

const LoginScreen: FunctionComponent<Props> = () => {
  const { signIn } = useContext(AuthContext);

  const formik = useFormik({
    initialValues: {
      username: "xfarouk@live.dk",
      password: "0505",
    },
    onSubmit: (values) => {
      signIn(values.username, values.password)
        .catch((err) => {
          console.log("err", err);
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
      <Text style={[typographies.HeadlineHeavy, styles.light]}>{i18n.t("signIn")}</Text>
      <FormikProvider value={formik}>
        <MyTextInput
          placeHolder={i18n.t("username")}
          label={i18n.t("username")}
          handleChange={formik.handleChange("username")}
          handleBlur={formik.handleBlur("username")}
          value={formik.values.username}
          error={formik.errors.username}
          touched={formik.touched.username}
        />
        <MyTextInput
          placeHolder={i18n.t("password")}
          label={i18n.t("password")}
          handleChange={formik.handleChange("password")}
          handleBlur={formik.handleBlur("password")}
          value={formik.values.password}
          error={formik.errors.password}
          touched={formik.touched.password}
        />
        <View style={{ alignItems: "center", marginTop: 25 }}>
          <ActionBtn
            isSubmitting={formik.isSubmitting}
            title={i18n.t("signIn")}
            onPress={handleSubmit}
          />
        </View>
      </FormikProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  light: {
    color: Colors.White["1"],
    textTransform: "uppercase",
    textAlign: "center",
  },
  error: {
    color: Colors.Error["1"],
  },
  inputWrapper: {
    flexDirection: "row",
    width: "90%",
    marginTop: 20,
  },
  wrapper: {
    alignContent: "center",
    justifyContent: "center",
  },
  inputField: {
    backgroundColor: Colors.White["1"],
    flex: 1,
    paddingVertical: 17,
    paddingHorizontal: 15,
    width: "100%",
    borderRadius: GeneralConstants.BorderRadius.md,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: Colors.Primary["1"],
  },
});
export default LoginScreen;
