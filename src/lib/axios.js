import axios from "axios";

// Create axios instance with default config
const baseURL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: baseURL,
});

// Add request interceptor to handle errors
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





export { axiosInstance };