export type User = {
  id: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: Date;
  teams: Team[];
  roles: UserRole[];
};

export type Team = {
  id: string;
  name: string;
  fee: number;
  studentCount: number;
  duration: 0;
  description: string;
  isActive: boolean;
  isAllowedtoViewContents: boolean;
};

export type UserRole = "Student" | "Teacher";
