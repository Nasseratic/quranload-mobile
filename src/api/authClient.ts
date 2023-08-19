import axios from "axios";

export const authClient = axios.create({
  baseURL: "https://quranload-be-dev-app.azurewebsites.net/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
