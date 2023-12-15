import { FunctionComponent, useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import { useFormik } from "formik";
import ActionButton from "components/buttons/ActionBtn";
import TextButton from "components/buttons/TextButton";
import { Alert, StyleSheet } from "react-native";
import InputField from "components/forms/InputField";
import { Loader } from "components/Loader";
import { fetchUserProfile, updateUserProfile } from "services/profileService";
import * as yup from "yup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RootStackParamList } from "navigation/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBar } from "components/AppBar";
import { View } from "tamagui";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

const profileQueryKey = "userProfile";
const ProfileScreen: FunctionComponent<Props> = ({ navigation }) => {
  const { data, isLoading } = useQuery([profileQueryKey], fetchUserProfile);

  const initialValues = useMemo(
    () =>
      data ?? {
        fullName: "",
        phoneNumber: "",
        gender: "",
        emailAddress: "",
      },
    [data]
  );

  const queryClint = useQueryClient();

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: yup.object().shape({
      fullName: yup.string().required(i18n.t("form.required")),
      emailAddress: yup.string().required(i18n.t("form.required")).email(i18n.t("form.validEmail")),
      phoneNumber: yup.string().required(i18n.t("form.required")),
    }),
    onSubmit(values) {
      updateUserProfile(values)
        .then(() => {
          queryClint.invalidateQueries([profileQueryKey]);
          Alert.alert(i18n.t("profileScreen.profileUpdated"));
        })
        .catch((error) => {
          if (error.validation) {
            formik.setErrors(error.validation);
          }
        });
    },
  });

  if (isLoading) return <Loader />;
  return (
    <SafeAreaView>
      <AppBar title={i18n.t("profileScreen.title")} />
      <View gap={16} paddingHorizontal={16}>
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
        <ActionButton
          disabled={!formik.isValid}
          onPress={formik.submitForm}
          title={i18n.t("save")}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  advancedSettingsBtn: {
    alignItems: "center",
  },
});

export default ProfileScreen;
