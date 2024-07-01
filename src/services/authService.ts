import { authClient } from "api/authClient";
import { subYears } from "date-fns";

export async function signIn(data: {
  username: string;
  password: string;
}): Promise<ISignInResponse> {
  return await authClient.post("Account/GetToken", data);
}

export async function refreshToken(data: { refreshToken: string }): Promise<IRefreshTokenResponse> {
  return await authClient.post("Account/RefreshToken", data);
}

export const forgotPassword = async (data: { userName: string }): Promise<void> => {
  return await authClient.post("Account/forgotPassword", data);
};

export const resetPassword = (data: {
  code: string;
  username: string;
  password: string;
  confirmPassword: string;
}) =>
  authClient.post("Account/ResetPassword", {
    ...data,
    code: encodeURIComponent(data.code),
  });

export const confirmEmail = (data: { code: string; userId: string }) =>
  authClient.put(
    `Account/ConfirmEmail?Code=${decodeURIComponent(data.code)}&UserId=${data.userId}`
  );

export const signUp = async (data: {
  password: string;
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
}): Promise<void> => {
  return await authClient.post("Account/Register", {
    ...data,
    // TODO: check if we need username and date of birth and remove or update this if needed
    username: data.email,
    dateOfBirth: subYears(new Date(), 18).toISOString(),
  });
};

export const resendVerificationEmail = async (data: { email: string }): Promise<void> => {
  return await authClient.post("Account/ResendConfirmationEmail", {
    username: data.email,
  });
};
