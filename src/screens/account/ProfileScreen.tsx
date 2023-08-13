import { FunctionComponent, useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import { i18n } from "locales/config";
import { useFormik } from "formik";
import ActionButton from "components/buttons/ActionBtn";
import TextButton from "components/buttons/TextButton";
import { Alert, StyleSheet } from "react-native";
import InputField from "components/forms/InputField";
import { User } from "types/User";
import Loader from "components/Loader";
import { GetUserProfile, SaveUserProfile } from "services/profileService";
import * as yup from "yup";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Profile">;

const ProfileScreen: FunctionComponent<Props> = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState<User>();

  useEffect(() => {
    GetUserProfile()
      .then((res) => {
        formik.initialValues.emailAddress = res.emailAddress;
        formik.initialValues.fullName = res.fullName;
        formik.initialValues.gender = res.gender;
        formik.initialValues.phoneNumber = res.phoneNumber ?? "";
        setUserDetails(res);
      })
      .catch(() => {});
  }, []);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      phoneNumber: "",
      gender: "",
      emailAddress: "",
    },
    validationSchema: yup.object().shape({
      fullName: yup.string().required(i18n.t("form.required")),
      emailAddress: yup.string().required(i18n.t("form.required")).email(i18n.t("form.validEmail")),
      phoneNumber: yup.string().required(i18n.t("form.required")),
    }),

    onSubmit(values) {
      SaveUserProfile(values)
        .then(() => {
          Alert.alert(i18n.t("profileScreen.profileUpdated"));
          navigation.goBack();
        })
        .catch((error) => {
          if (error.validation) {
            formik.setErrors(error.validation);
          }
          console.log(error);
        });
    },
  });

  if (!userDetails)
    return (
      <QuranLoadView>
        <Loader light />
      </QuranLoadView>
    );
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
        value={formik.values.emailAddress}
        touched={formik.touched.emailAddress}
        error={formik.errors.emailAddress}
        placeholder={formik.values.emailAddress}
        onChangeText={formik.handleChange("emailAddress")}
        keyboardType="email-address"
      />

      <TextButton
        style={styles.advancedSettingsBtn}
        onPress={() => navigation.navigate("AdvancedSettings")}
      >
        {i18n.t("profileScreen.advancedSettings")}
      </TextButton>
      <ActionButton disabled={!formik.isValid} onPress={formik.submitForm} title={i18n.t("save")} />
    </QuranLoadView>
  );
};

const styles = StyleSheet.create({
  advancedSettingsBtn: {
    alignItems: "center",
  },
});

export default ProfileScreen;
