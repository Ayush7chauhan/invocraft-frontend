/**
 * Centralized Axios client for Invocraft API
 *
 * Features:
 * - Auto-attaches Bearer token from localStorage
 * - Handles 401 → clears auth and redirects to login
 * - Parses Laravel validation errors (422)
 * - Consistent error shape via ApiError
 */
import axios, { type AxiosError, type AxiosInstance } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  "http://100.48.47.44/api";

// ── Axios instance ────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
  withCredentials: false,
});

// ── Request interceptor — attach auth token ───────────────────────────────────

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

// ── Response interceptor — handle errors globally ────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      // Only redirect if not already on auth pages
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/splash")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// ── Error parser ─────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status: number;
  /** Laravel 422 field errors */
  errors?: Record<string, string[]>;
}

/**
 * Parse an Axios error into a consistent ApiError shape.
 * Use this in catch blocks: `const err = parseApiError(e);`
 */
export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data as
      | {
          message?: string;
          errors?: Record<string, string[]>;
        }
      | undefined;

    return {
      message: data?.message ?? getDefaultMessage(status),
      status,
      errors: data?.errors,
    };
  }

  return {
    message: "An unexpected error occurred. Please try again.",
    status: 0,
  };
}

function getDefaultMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Session expired. Please login again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 422:
      return "Validation failed. Please check the form.";
    case 429:
      return "Too many requests. Please slow down.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * Extract the first validation error message for a specific field.
 * Useful for mapping Laravel 422 errors into form field errors.
 */
export function getFieldError(
  error: ApiError,
  field: string,
): string | undefined {
  return error.errors?.[field]?.[0];
}
