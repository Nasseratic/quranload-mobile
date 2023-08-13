import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshToken } from "./authClient";

const api = axios.create({
  baseURL: "https://quranload-be-dev-app.azurewebsites.net/api/",
});

api.interceptors.request.use(async (conf) => {
  const token = await AsyncStorage.getItem("accessToken");
  console.info("request sent to", conf.baseURL, conf.url);
  if (token) {
    conf.headers.Authorization = `Bearer ${token}`;
  }
  return conf;
});
interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<Frontend.Content.ApiError>) => {
    const { data, status } = error.response!;
    const originalRequest = error.config as RetryConfig;
    if (status === 400) {
      const newError: any = {};
      if (data != null && data.errors) {
        for (const key in data.errors) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          console.log("DATA KEY ERROR: ", key);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (data.errors[key]) {
            let newKey = key.replace("Request.", "");
            newKey = newKey.replace("$.", "");
            newKey = newKey.replace("request.", "");
            newKey = camelize(newKey);
            console.log(newKey);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
            newError[newKey] = data.errors[key].join(". ");
          }
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return Promise.reject({ status: status, validation: newError, message: data?.message });
    } else if (status === 500) {
      console.log(data);
      return Promise.reject({ status: status, error: "an expected error occurred" });
    } else if (status === 401) {
      console.log("401 ERROR");
      const refreshTokenCode = await AsyncStorage.getItem("refreshToken");
      console.log(refreshTokenCode);
      if (refreshTokenCode != null && !originalRequest._retry) {
        return refreshToken({ refreshToken: refreshTokenCode })
          .then(async (res) => {
            await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
            await AsyncStorage.setItem("accessToken", res.data.accessToken);
            return api(originalRequest);
          })
          .catch((error) => {
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
      console.log(error);

      return Promise.reject({ status: status, error: "an expected error occurred" });
    }
  }
);

const responseBody = <T>(response: AxiosResponse<T>) => {
  return response.data;
};

const request = {
  get: <T>(url: string) => api.get<T>(url).then(responseBody),
  post: <T>(url: string, body: {}) => api.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: {}) => api.put<T>(url, body).then(responseBody),
  delete: <T>(url: string) => api.delete<T>(url).then(responseBody),
};

const apiClient = {
  request,
};

export default apiClient.request;

export const camelize = (str: string) =>
  str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
