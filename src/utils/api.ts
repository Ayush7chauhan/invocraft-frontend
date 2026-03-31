import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
console.warn("API Base URL:", API_BASE_URL); // debug log to verify correct URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
  withCredentials: false, // set true only if using cookies/sessions
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login"; // optional: auto-redirect on token expiry
    }
    return Promise.reject(error);
  },
);

export default api;
