// api
import axios from "axios";

const api = axios.create({
  baseURL: "API", //ĐỂ LINK API HOẶC BACKEND CỦA BẠN VÀO ĐÂY
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;