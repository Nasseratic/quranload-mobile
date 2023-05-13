export type User = {
  name: string;
  email: string;
  role: UserRole;
};

export type UserRole = "Student" | "Teacher";
