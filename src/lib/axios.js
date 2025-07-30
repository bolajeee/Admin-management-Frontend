import axios from "axios"

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // This is important for sending cookies with requests
});

// Add request interceptor to handle errors
axiosInstance.interceptors.request.use(
  (config) => {
    // The token is automatically sent via cookies, no need to set it in headers
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



export { axiosInstance };