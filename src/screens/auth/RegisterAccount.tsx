import React, { FunctionComponent, useState } from "react";
import { i18n, t } from "locales/config";
import { Image, ImageSourcePropType, TouchableOpacity, View } from "react-native";
import { FormikProvider, useFormik } from "formik";
import ActionBtn from "components/buttons/ActionBtn";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import InputField from "components/forms/InputField";
import * as Yup from "yup";
import GeneralConstants from "constants/GeneralConstants";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "navigation/navigation";
import { AppBar } from "components/AppBar";
import { ScrollView } from "tamagui";
import Logo from "@assets/logo.png";
import { toast } from "components/Toast";
import { GenderSelect } from "components/forms/GenderSelect";
import { useAuthActions } from "@convex-dev/auth/react";
import { cvx, useCvxMutation } from "api/convex";

interface Form {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: number | null;
}

// min 8 characters, 1 upper case letter, 1 lower case letter, 1 special character and 1 number
export const passwordRules =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+?]).{8,}$/;

export const nameRules = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
export const phoneNumberRules = /^\+?\d{7,}$/;

type Props = NativeStackScreenProps<RootStackParamList, "RegisterAccount">;

const RegisterAccount: FunctionComponent<Props> = ({ navigation }) => {
  const { signIn } = useAuthActions();
  const createProfileMutation = useCvxMutation(cvx.auth.createUserProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const formik = useFormik<Form>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: null,
    },
    validationSchema: Yup.object().shape({
      firstName: Yup.string()
        .trim()
        .matches(nameRules, { message: t("invalid") })
        .required(),
      lastName: Yup.string()
        .trim()
        .matches(nameRules, { message: t("invalid") })
        .required(),
      email: Yup.string().trim().email().required(),
      password: Yup.string()
        .required()
        .matches(passwordRules, { message: t("registerAccountScreen.passwordRules") }),
      confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match"),
      gender: Yup.number().required(t("form.required")),
    }),
    onSubmit: async (values) => {
      const trimmedValues = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        gender: values.gender,
      };

      setIsSubmitting(true);
      setError(null);

      try {
        // Sign up using Convex Auth
        await signIn("password", {
          email: trimmedValues.email,
          password: trimmedValues.password,
          flow: "signUp",
        });

        // Create user profile after successful signup
        await createProfileMutation({
          fullName: `${trimmedValues.firstName} ${trimmedValues.lastName}`,
          gender: trimmedValues.gender === 1 ? "male" : "female",
          role: "Student",
        });

        // Registration successful
        toast.show({
          status: "Success",
          title: t("registerAccountScreen.success"),
        });
      } catch (err: unknown) {
        setError(err as Error);
        toast.show({
          status: "Error",
          title: t("defaultError"),
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppBar title={i18n.t("registerAccountScreen.createAccount")} />
      <ScrollView contentContainerStyle={{ marginHorizontal: 16, paddingBottom: 16 }}>
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <Image source={Logo as ImageSourcePropType} />
        </View>
        <FormikProvider value={formik}>
          <View style={{ gap: GeneralConstants.Spacing.md }}>
            <InputField
              value={formik.values.firstName}
              touched={formik.touched.firstName}
              error={formik.errors.firstName}
              placeholder={formik.values.firstName}
              label={t("registerAccountScreen.firstName")}
              onChangeText={formik.handleChange("firstName")}
              onBlur={formik.handleBlur("firstName")}
            />

            <InputField
              value={formik.values.lastName}
              touched={formik.touched.lastName}
              error={formik.errors.lastName}
              placeholder={formik.values.lastName}
              label={t("registerAccountScreen.lastName")}
              onChangeText={formik.handleChange("lastName")}
              onBlur={formik.handleBlur("lastName")}
            />

            <GenderSelect
              selected={formik.values.gender}
              onChange={(newValue) => formik.setFieldValue("gender", Number(newValue))}
              touched={formik.touched.gender}
              error={formik.errors.gender}
            />

            <InputField
              autoCapitalize="none"
              keyboardType="email-address"
              value={formik.values.email}
              touched={formik.touched.email}
              error={formik.errors.email}
              placeholder={formik.values.email}
              label={t("registerAccountScreen.email")}
              onChangeText={formik.handleChange("email")}
              onBlur={formik.handleBlur("email")}
            />

            <InputField
              value={formik.values.password}
              touched={formik.touched.password}
              error={formik.errors.password}
              placeholder={formik.values.password}
              secureTextEntry={true}
              label={t("registerAccountScreen.password")}
              onChangeText={formik.handleChange("password")}
              onBlur={formik.handleBlur("password")}
            />
            <InputField
              value={formik.values.confirmPassword}
              touched={formik.touched.confirmPassword}
              error={formik.errors.confirmPassword}
              placeholder={formik.values.confirmPassword}
              secureTextEntry={true}
              label={t("registerAccountScreen.confirmPassword")}
              onChangeText={formik.handleChange("confirmPassword")}
              onBlur={formik.handleBlur("confirmPassword")}
            />
          </View>
          {error && (
            <Typography type="BodyLight" style={{ color: Colors.Error[1], marginTop: 8 }}>
              {error.message || t("defaultError")}
            </Typography>
          )}
          <View style={{ alignItems: "center", marginTop: 25 }}>
            <ActionBtn
              isLoading={isSubmitting}
              title={t("registerAccountScreen.createAccount")}
              onPress={formik.handleSubmit}
            />
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ alignItems: "center", marginTop: 15 }}
            >
              <Typography type="CaptionHeavy" style={{ color: Colors.Primary[1] }}>
                {t("registerAccountScreen.alreadyRegistered")}
              </Typography>
            </TouchableOpacity>
          </View>
        </FormikProvider>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterAccount;
