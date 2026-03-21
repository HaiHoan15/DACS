// api
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost/backend/controllers/", //ĐỂ LINK API HOẶC BACKEND CỦA BẠN VÀO ĐÂY
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;