import axios from "axios";
import { BASE_URL } from "./constants";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const isRequestCanceled = (err: unknown) =>
  axios.isAxiosError(err) && err.code === "ERR_CANCELED";

export const isUnauthorized = (err: unknown) =>
  axios.isAxiosError(err) && err.response?.status === 401;

export const getErrorMessage = (
  err: unknown,
  fallback = "Something went wrong"
) => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

export default api;
