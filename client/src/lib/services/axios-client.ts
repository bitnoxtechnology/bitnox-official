import axios from "axios";
import { toast } from "sonner";
import { tokenStorage } from "../token";

const options = {
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: false,
};

const API = axios.create(options);

// attach access token on requests
API.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(null, (error) => {
  const expectedError =
    error.response &&
    error.response.status &&
    error.response.status >= 400 &&
    error.response.status < 500;

  const { data, status } = error.response;
  // if it's an unexpected error
  if (!expectedError) {
    toast.error("An unexpected error occurred.");
  }

  return Promise.reject({ ...data, status }); // the error is sent to the catch block
});

export default API;
