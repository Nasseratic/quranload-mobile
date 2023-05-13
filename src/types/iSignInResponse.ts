interface ISignInResponse {
  accessToken: string;
  refreshToken: string;
  role: "Student" | "Teacher";
}
