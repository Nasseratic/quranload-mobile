import { FunctionComponent, useContext } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import { i18n } from "locales/config";
import { useFormik } from "formik";
import ActionButton from "components/buttons/ActionBtn";
import AuthContext from "contexts/auth";
import TextButton from "components/buttons/TextButton";
import { StyleSheet } from "react-native";
import InputField from "components/forms/InputField";
type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Profile">;

const ProfileScreen: FunctionComponent<Props> = ({ navigation }) => {
  const { signOut } = useContext(AuthContext);

  const handleSignout = async () => {
    await signOut();
  };

  const formik = useFormik({
    initialValues: {
      fullName: "Matin Kacar",
      phoneNumber: "+45 22339966",
      gender: "Male",
      email: "matin@kacar.dk",
    },
    onSubmit(values) {
      console.log(values);
    },
  });

  return (
    <QuranLoadView
      appBar={{
        title: i18n.t("profileScreen.title"),
      }}
    >
      <InputField
        label={i18n.t("profileScreen.fullNameLabel")}
        value={formik.values.fullName}
        touched={formik.touched.fullName}
        error={formik.errors.fullName}
        placeholder={formik.values.fullName}
        onChangeText={formik.handleChange("fullName")}
        onBlur={formik.handleBlur("fullName")}
      />

      <InputField
        label={i18n.t("profileScreen.phoneNumberLabel")}
        value={formik.values.phoneNumber}
        touched={formik.touched.phoneNumber}
        error={formik.errors.phoneNumber}
        placeholder={formik.values.phoneNumber}
        onChangeText={formik.handleChange("phoneNumber")}
        keyboardType="phone-pad"
      />

      <InputField
        label={i18n.t("profileScreen.genderLabel")}
        value={formik.values.gender}
        touched={formik.touched.gender}
        error={formik.errors.gender}
        placeholder={formik.values.gender}
        onChangeText={formik.handleChange("gender")}
        disabled
      />

      <InputField
        label={i18n.t("profileScreen.emailLabel")}
        value={formik.values.email}
        touched={formik.touched.email}
        error={formik.errors.email}
        placeholder={formik.values.email}
        onChangeText={formik.handleChange("email")}
        keyboardType="email-address"
      />

      <TextButton
        style={styles.advancedSettingsBtn}
        onPress={() => navigation.navigate("AdvancedSettings")}
      >
        {i18n.t("profileScreen.advancedSettings")}
      </TextButton>
      <ActionButton onPress={handleSignout} title={i18n.t("signOut")} />
    </QuranLoadView>
  );
};

const styles = StyleSheet.create({
  advancedSettingsBtn: {
    alignItems: "center",
  },
});

export default ProfileScreen;
