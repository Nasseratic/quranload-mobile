import axios from "axios";

const authClient = axios.create({
  baseURL: "https://quranload-be-dev-app.azurewebsites.net/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export async function signIn(data: {
  username: string;
  password: string;
}): Promise<ISignInResponse> {
  return await authClient.post("Account/GetToken", data);
}

export async function refreshToken(data: { refreshToken: string }): Promise<IRefreshTokenResponse> {
  return await authClient.post("Account/RefreshToken", data);
}
