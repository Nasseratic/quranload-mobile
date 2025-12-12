import { client } from "api/convex";
import { api } from "../../convex/_generated/api";
import { User } from "types/User";
import Paginated from "types/Paginated";
import { Id } from "api/convex";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const fetchUserProfile = async (): Promise<User> => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const result = await client.query(api.services.auth.getCurrentUser, {
    refreshToken,
  });

  if (!result) {
    throw new Error("User not found");
  }

  return {
    id: result.id,
    fullName: result.fullName,
    emailAddress: result.emailAddress,
    phoneNumber: result.phoneNumber,
    gender: result.gender,
    dateOfBirth: new Date(result.dateOfBirth),
    teams: result.teams.map((t: any) => ({
      id: t.id,
      name: t.name,
      fee: t.fee,
      studentCount: t.studentCount,
      organizationName: t.organizationName,
      organizationLogo: t.organizationLogo,
      duration: t.duration,
      description: t.description,
      isActive: t.isActive,
      isAllowedtoViewContents: t.isAllowedtoViewContents,
    })),
    roles: result.roles,
    username: result.username,
    percentageOfAcceptedOrSubmittedLessons: result.percentageOfAcceptedOrSubmittedLessons,
  };
};

export const fetchSubscriptions = async (): Promise<Paginated<Frontend.Content.Subscription>> => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const user = await client.query(api.services.auth.getCurrentUser, { refreshToken });
  if (!user) {
    throw new Error("User not found");
  }

  const result = await client.query(api.services.profile.getSubscriptions, {
    userId: user.id as Id<"users">,
  });

  return {
    pager: result.pager,
    list: result.list as any,
  };
};

export const updateUserProfile = async (data: {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
}): Promise<void> => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const user = await client.query(api.services.auth.getCurrentUser, { refreshToken });
  if (!user) {
    throw new Error("User not found");
  }

  await client.mutation(api.services.profile.updateProfile, {
    userId: user.id as Id<"users">,
    fullName: data.fullName,
    emailAddress: data.emailAddress,
    phoneNumber: data.phoneNumber,
  });
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}): Promise<void> => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const user = await client.query(api.services.auth.getCurrentUser, { refreshToken });
  if (!user) {
    throw new Error("User not found");
  }

  await client.mutation(api.services.profile.changePassword, {
    userId: user.id as Id<"users">,
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    confirmNewPassword: data.confirmNewPassword,
  });
};

export const cancelSubscription = async (teamId: string): Promise<void> => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const user = await client.query(api.services.auth.getCurrentUser, { refreshToken });
  if (!user) {
    throw new Error("User not found");
  }

  await client.mutation(api.services.profile.cancelSubscription, {
    userId: user.id as Id<"users">,
    teamId: teamId as Id<"teams">,
  });
};

type StudentStats = {
  firstSubmission: string;
  lastSubmission: string;
  assignmentVelocities: [
    {
      lessonId: string;
      submissionDate: string;
      averagePageDuration: number;
      totalNumberOfPagesRead: number;
      totalRecordingHours: number;
    }
  ];
  todaySpendMinutes: number;
  totalRecordingHours: number;
  totalNumberOfPagesRead: number;
  averageTimePerPage: number;
};

export const fetchStudentStatistics = async ({
  teamId,
}: {
  teamId: string;
}): Promise<StudentStats> => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const user = await client.query(api.services.auth.getCurrentUser, { refreshToken });
  if (!user) {
    throw new Error("User not found");
  }

  const result = await client.query(api.services.profile.getStudentStats, {
    userId: user.id as Id<"users">,
    teamId: teamId as Id<"teams">,
  });

  return {
    firstSubmission: result.firstSubmission ?? "",
    lastSubmission: result.lastSubmission ?? "",
    assignmentVelocities: result.assignmentVelocities as any,
    todaySpendMinutes: result.todaySpendMinutes,
    totalRecordingHours: result.totalRecordingHours,
    totalNumberOfPagesRead: result.totalNumberOfPagesRead,
    averageTimePerPage: result.averageTimePerPage,
  };
};
