import axios from "axios";

// Create axios instance with default config
const baseURL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: baseURL,
});

// Add request interceptor to handle authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', error.config?.url, error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);





export { axiosInstance };