// api
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost/backend/controllers/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

export default api;