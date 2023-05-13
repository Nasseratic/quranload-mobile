import axios, { AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "https://api.quranload.com/api/",
});

api.interceptors.request.use(async (conf) => {
  const token = await AsyncStorage.getItem("accessToken");
  console.info("request sent to", conf.baseURL, conf.url);
  if (token) {
    conf.headers.Authorization = `Bearer ${token}`;
  }
  return conf;
});

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
