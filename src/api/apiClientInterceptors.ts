import { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { camelize, axiosClient } from "api/apiClient";

axiosClient.interceptors.request.use(async (conf) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    conf.headers.Authorization = `Bearer ${token}`;
  }
  return conf;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<Frontend.Content.ApiError>) => {
    const { data, status } = error.response!;
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
      return Promise.reject({
        status,
        error:
          data.message ||
          "We could not acknowledge your account. Please sign out and sign in again.",
      });
    } else if (status === 404) {
      return Promise.reject({ status: status, error: "an expected error occurred" });
    } else {
      return Promise.reject({ status: status, error: "an expected error occurred" });
    }
  }
);
