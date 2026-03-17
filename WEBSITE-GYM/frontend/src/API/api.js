// api
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost/backend/controllers/", //ĐỂ LINK API HOẶC BACKEND CỦA BẠN VÀO ĐÂY
  headers: {
    "Content-Type": "application/json",
  },
});

// Hàm đăng nhập
export const loginUser = async (email, password) => {
  try {
    const response = await api.post("AuthController.php", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Lỗi kết nối server",
    };
  }
};

export default api;