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

const initialState = {
  user: getUser(),
  loading: false,
  error: null,
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
        localStorage.setItem("user", JSON.stringify(action.payload.user));
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
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;