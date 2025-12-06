import { client } from "api/convex";
import { api } from "../../convex/_generated/api";

export async function signIn(data: {
  email: string;
  password: string;
}): Promise<ISignInResponse["data"]> {
  const result = await client.mutation(api.services.auth.signIn, {
    email: data.email,
    password: data.password,
  });
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    userId: result.userId,
  };
}

export async function refreshToken(data: { refreshToken: string }): Promise<IRefreshTokenResponse> {
  const result = await client.mutation(api.services.auth.refreshToken, {
    refreshToken: data.refreshToken,
  });
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  };
}

export const forgotPassword = async (data: { userName: string }): Promise<void> => {
  await client.mutation(api.services.auth.forgotPassword, {
    email: data.userName,
  });
};

export const resetPassword = async (data: {
  code: string;
  username: string;
  password: string;
  confirmPassword: string;
}): Promise<void> => {
  await client.mutation(api.services.auth.resetPassword, {
    email: data.username,
    code: data.code,
    password: data.password,
    confirmPassword: data.confirmPassword,
  });
};

export const confirmEmail = async (data: { code: string; userId: string }): Promise<void> => {
  await client.mutation(api.services.auth.confirmEmail, {
    userId: data.userId,
    code: data.code,
  });
};

export const signUp = async (data: {
  password: string;
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
}): Promise<void> => {
  await client.mutation(api.services.auth.signUp, {
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword,
    firstName: data.firstName,
    lastName: data.lastName,
  });
};

export const resendVerificationEmail = async (data: { email: string }): Promise<void> => {
  await client.mutation(api.services.auth.resendConfirmationEmail, {
    email: data.email,
  });
};
