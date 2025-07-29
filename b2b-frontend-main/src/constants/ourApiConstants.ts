import axios from "axios";

export const backendBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || `http://127.0.0.1:2025`;
export const ourApiPrefix = `${backendBaseUrl}`;
export const ourApiAxios = axios.create({
  baseURL: ourApiPrefix,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const ourApiAxiosMultipartFormData = axios.create({
  baseURL: ourApiPrefix,
  headers: {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
  },
});
