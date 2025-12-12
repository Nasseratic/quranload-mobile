// Auth service for Convex Auth
// Note: Most auth operations are now handled through Convex Auth hooks
// This file provides helper functions for registration and password reset flows

import { client } from "api/convex";
import { api } from "../../convex/_generated/api";

// signIn is now handled through useAuthActions hook in auth context

// Create user profile after signup
export const createUserProfile = async (data: {
  fullName: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  role?: "Student" | "Teacher";
}): Promise<void> => {
  await client.mutation(api.services.auth.createUserProfile, {
    fullName: data.fullName,
    phoneNumber: data.phoneNumber,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    role: data.role,
  });
};

// Update user profile
export const updateProfile = async (data: {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
}): Promise<void> => {
  await client.mutation(api.services.auth.updateProfile, {
    fullName: data.fullName,
    emailAddress: data.emailAddress,
    phoneNumber: data.phoneNumber,
  });
};

// Note: The following functions are placeholders
// Convex Auth with Password provider doesn't include built-in email verification or password reset
// You would need to implement these using Convex actions with an email provider

export const forgotPassword = async (_data: { userName: string }): Promise<void> => {
  // TODO: Implement password reset flow with email provider
  console.warn("Password reset not yet implemented with Convex Auth");
  throw new Error("Password reset not yet implemented");
};

export const resetPassword = async (_data: {
  code: string;
  username: string;
  password: string;
  confirmPassword: string;
}): Promise<void> => {
  // TODO: Implement password reset confirmation with email provider
  console.warn("Password reset not yet implemented with Convex Auth");
  throw new Error("Password reset not yet implemented");
};

export const confirmEmail = async (_data: { code: string; userId: string }): Promise<void> => {
  // TODO: Implement email confirmation with email provider
  console.warn("Email confirmation not yet implemented with Convex Auth");
  throw new Error("Email confirmation not yet implemented");
};

export const resendVerificationEmail = async (_data: { email: string }): Promise<void> => {
  // TODO: Implement resend verification with email provider
  console.warn("Resend verification not yet implemented with Convex Auth");
  throw new Error("Resend verification not yet implemented");
};
