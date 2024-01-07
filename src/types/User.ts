export type User = {
  id: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: Date;
  teams: Team[];
  roles: UserRole[];
  percentageOfAcceptedOrSubmittedLessons: number;
};

export type Team = {
  organizationLogo?: string;
  id: string;
  name: string;
  fee: number;
  studentCount: number;
  organizationName: string;
  duration: 0;
  description: string;
  isActive: boolean;
  isAllowedtoViewContents: boolean;
};

export type UserRole = "Student" | "Teacher";
