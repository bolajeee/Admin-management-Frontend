import axios from "axios"

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // This is important for sending cookies with requests
});

// Add request interceptor to handle errors
axiosInstance.interceptors.request.use(
  (config) => {
    // The token is automatically sent via cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await axiosInstance.post('/auth/refresh');
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);



export { axiosInstance };