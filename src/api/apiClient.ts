import axios, { AxiosError, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ErrorResponse from "types/ErrorResponse";

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

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError): Promise<ErrorResponse | null> => {
    const { data, status } = error.response!;
    if (status === 400) {
      //TODO: HANDLE VALIDATION ERRORS TO RETURN
      return { error: "an expected error occurred" };
    } else if (status === 500) {
      console.log(data);
      return Promise.reject({ status: status, error: "an expected error occurred" });
    } else if (status === 401) {
      return Promise.reject(null);
    } else if (status === 404) {
      return Promise.reject({ status: status, error: "an expected error occurred" });
    } else {
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
