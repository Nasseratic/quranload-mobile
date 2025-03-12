interface ISignInResponse {
  data: { accessToken: string; refreshToken: string; role: "Student" | "Teacher" };
}

interface IRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  role: "Student" | "Teacher";
}

type ISignInErrorResponse = {
  response: {
    data: {
      message: string;
    };
  };
};
