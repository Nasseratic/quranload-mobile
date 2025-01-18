import { AxiosError, AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshToken } from "services/authService";
import { camelize, axiosClient } from "api/apiClient";

axiosClient.interceptors.request.use(async (conf) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    conf.headers.Authorization = `Bearer ${token}`;
  }
  return conf;
});

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<Frontend.Content.ApiError>) => {
    const { data, status } = error.response!;
    const originalRequest = error.config as RetryConfig;
    if (status === 400) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newError: any = {};
      if (data != null && data.errors) {
        for (const key in data.errors) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          if ((data.errors as any)[key]) {
            let newKey = key.replace("Request.", "");
            newKey = newKey.replace("$.", "");
            newKey = newKey.replace("request.", "");
            newKey = camelize(newKey);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
            newError[newKey] = (data.errors as any)[key].join(". ");
          }
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return Promise.reject({ status: status, validation: newError, message: data?.message });
    } else if (status === 500) {
      return Promise.reject({ status: status, error: "an expected error occurred" });
    } else if (status === 401) {
      const refreshTokenCode = await AsyncStorage.getItem("refreshToken");
      if (refreshTokenCode != null && !originalRequest._retry) {
        return refreshToken({ refreshToken: refreshTokenCode })
          .then(async (res) => {
            await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
            await AsyncStorage.setItem("accessToken", res.data.accessToken);
            return axiosClient(originalRequest);
          })
          .catch((error) => {
            console.error("Failed to refresh token", error);
            AsyncStorage.removeItem("accessToken");
            AsyncStorage.removeItem("refreshToken");
            return Promise.reject({
              status: status,
              error: "We could not acknowledge your account. Please sign out and sign in again.",
            });
          });
      }
      return Promise.reject({
        status,
        error: "We could not acknowledge your account. Please sign out and sign in again.",
      });
    } else if (status === 404) {
      return Promise.reject({ status: status, error: "an expected error occurred" });
    } else {
      return Promise.reject({ status: status, error: "an expected error occurred" });
    }
  }
);
