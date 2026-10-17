import axios from "axios";

/**
 * Base Axios Instance
 * Automatically reads API Base URL from Vite environment variables.
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: can inject auth headers or log requests
axiosClient.interceptors.request.use(
  (config) => {
    // Helpful log for debugging network requests
    // console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: extracts data and normalizes errors
axiosClient.interceptors.response.use(
  (response) => {
    // Return parsed payload directly
    return response.data;
  },
  (error) => {
    const customMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      (error.code === "ECONNABORTED" ? "Request timed out" : error.message) ||
      "An unexpected network error occurred.";

    return Promise.reject(new Error(customMessage));
  }
);

export default axiosClient;

