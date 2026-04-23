// api
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost/backend/controllers/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// API instance for /backend/api/ folder (MoMo, etc)
export const apiGateway = axios.create({
  baseURL: "http://localhost/backend/api/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

export default api;