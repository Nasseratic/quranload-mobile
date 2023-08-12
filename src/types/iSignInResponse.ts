interface ISignInResponse {
  data: { accessToken: string; refreshToken: string; role: "Student" | "Teacher" };
}

interface ISignInErrorResponse {
  response: {
    data: {
      message: string;
    };
  };
}
