import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../API/api";

const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user && user !== "undefined" ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Async thunk để xử lý login
export const loginUserAsync = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("AuthController.php", {
        email,
        password,
      });

      if (response.data.success) {
        return response.data; // { success: true, user: {...}, message: "..." }
      } else {
        return rejectWithValue(response.data.message || "Lỗi đăng nhập");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi kết nối server"
      );
    }
  }
);

// Async thunk để xử lý register
export const registerUserAsync = createAsyncThunk(
  'auth/registerUser',
  async ({ email, username, password, confirmPassword, address, phone }, { rejectWithValue }) => {
    try {
      const response = await api.post("RegisterController.php", {
        email,
        username,
        password,
        confirmPassword,
        address,
        phone,
      });

      if (response.data.success) {
        return response.data; // { success: true, message: "..." }
      } else {
        return rejectWithValue(response.data.message || "Lỗi đăng ký");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi kết nối server"
      );
    }
  }
);

// Async thunk để upload avatar - dùng FormData để gửi file
export const uploadAvatarAsync = createAsyncThunk(
  'auth/uploadAvatar',
  async ({ userId, file, token }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('action', 'uploadAvatar');
      formData.append('userId', userId);
      formData.append('avatar', file);

      const response = await api.post("UserController.php", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.data.success) {
        return response.data; // { success: true, avatar: "...", avatarUrl: "..." }
      } else {
        return rejectWithValue(response.data.message || "Lỗi upload avatar");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi kết nối server"
      );
    }
  }
);

// Async thunk để cập nhật thông tin user
export const updateUserAsync = createAsyncThunk(
  'auth/updateUser',
  async ({ userId, username, address, phone, currentPassword, newPassword, confirmPassword, token }, { rejectWithValue }) => {
    try {
      const response = await api.post("UserController.php", {
        action: 'update',
        userId,
        username,
        address,
        phone,
        currentPassword,
        newPassword,
        confirmPassword,
      }, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.data.success) {
        return response.data; // { success: true, user: {...}, message: "..." }
      } else {
        return rejectWithValue(response.data.message || "Lỗi cập nhật thông tin");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi kết nối server"
      );
    }
  }
);

// Async thunk để lấy dữ liệu user từ server
export const fetchUserAsync = createAsyncThunk(
  'auth/fetchUser',
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const response = await api.get("UserController.php", {
        params: {
          action: 'getUser',
          userId: userId
        },
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.data.success) {
        return response.data; // { success: true, user: {...} }
      } else {
        return rejectWithValue(response.data.message || "Không thể lấy dữ liệu user");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi kết nối server"
      );
    }
  }
);

const initialState = {
  user: getUser(),
  loading: false,
  avatarLoading: false,
  updateLoading: false,
  error: null,
  avatarError: null,
  updateError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        // Lưu user vào localStorage
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        // Lưu token (dùng user.id làm token tạm, nên implement JWT sau)
        localStorage.setItem("authToken", `user_${action.payload.user.id}`);
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadAvatarAsync.pending, (state) => {
        state.avatarLoading = true;
        state.avatarError = null;
      })
      .addCase(uploadAvatarAsync.fulfilled, (state, action) => {
        state.avatarLoading = false;
        // Cập nhật avatar của user
        if (state.user) {
          state.user.avatar = action.payload.avatar;
          state.user.avatarUrl = action.payload.avatarUrl;
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(uploadAvatarAsync.rejected, (state, action) => {
        state.avatarLoading = false;
        state.avatarError = action.payload;
      })
      .addCase(updateUserAsync.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      .addCase(fetchUserAsync.fulfilled, (state, action) => {
        console.log("fetchUserAsync.fulfilled - action.payload:", action.payload);
        console.log("User from server:", action.payload.user);
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(fetchUserAsync.rejected, (state, action) => {
        // Nếu fetch user thất bại, không cần làm gì - sử dụng data từ localStorage
        console.log("Không thể fetch user data từ server:", action.payload);
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;