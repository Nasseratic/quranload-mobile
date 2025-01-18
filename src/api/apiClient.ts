import axios, { AxiosResponse } from "axios";

export const BASE_URL = "https://quranload-be-dev-app.azurewebsites.net/api/";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
});

const responseBody = <T>(response: AxiosResponse<T>) => {
  return response.data;
};

const request = {
  get: <T>(url: string) => axiosClient.get<T>(url).then(responseBody),
  postForm: <T>(url: string, body: object) =>
    axiosClient
      .post<T>(url, body, {
        headers: {
          "content-type": "multipart/form-data",
        },
      })
      .then(responseBody),
  post: <T>(url: string, body: object) => axiosClient.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body?: object) => axiosClient.put<T>(url, body).then(responseBody),
  delete: <T>(url: string, body?: object) =>
    axiosClient
      .delete<T>(url, {
        data: body,
      })
      .then(responseBody),
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
