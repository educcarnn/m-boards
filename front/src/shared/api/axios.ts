import axios from "axios";

const baseURL = "http://localhost:8080";

export const http = axios.create({
  baseURL,
  timeout: 15000,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Erro inesperado";

    return Promise.reject(new Error(message));
  }
);
