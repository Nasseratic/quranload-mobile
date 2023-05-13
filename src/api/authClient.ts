import axios, { AxiosError, AxiosResponse } from "axios";

const authClient = axios.create({
  baseURL: "https://api.quranload.com//api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export async function signIn(data: {
  username: string;
  password: string;
}): Promise<ISignInResponse> {
  return await authClient.post<ISignInResponse>("Account/GetToken", data).then((res) => res.data);
}
