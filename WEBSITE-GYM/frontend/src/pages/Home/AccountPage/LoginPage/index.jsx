import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUserAsync } from "../../../../redux/authSlice";
import Notification from "../../../../components/Notification";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineLightningBolt,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy loading và error từ Redux store
  const loading = useSelector((state) => state.auth.loading);
  const _error = useSelector((state) => state.auth.error);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dispatch async thunk
    const result = await dispatch(loginUserAsync({ email, password }));

    if (result.type === loginUserAsync.fulfilled.type) {
      // Đăng nhập thành công
      setNotification({
        message: "Đăng nhập thành công! Đang chuyển hướng...",
        type: "success",
      });

      // Kiểm tra role để redirect đúng
      const user = result.payload.user;
      const redirectPath = user.role === "admin" ? "/admin" : "/";

      // Đợi 2 giây rồi chuyển về trang thích hợp
      setTimeout(() => {
        navigate(redirectPath);
      }, 2000);
    } else {
      // Đăng nhập thất bại
      setNotification({
        message: result.payload || "Đăng nhập thất bại",
        type: "error",
      });
    }
  };

  return (
    <div className="login-page">
      {/* Background grid */}
      <div className="login-bg-grid" />

      {/* Floating decorative shapes */}
      <div className="login-deco-shape login-deco-shape-1" />
      <div className="login-deco-shape login-deco-shape-2" />
      <div className="login-deco-shape login-deco-shape-3" />
      <div className="login-deco-shape login-deco-shape-4" />

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="login-wrapper">
        {/* ======= LEFT — Branding ======= */}
        <div className="login-branding">
          <img
            src="/images/logo/logo.png"
            alt="Three GYM Logo"
            className="login-branding-logo"
          />

          <h2 className="login-branding-title">
            <span className="text-red">THREE</span>{" "}
            <span className="text-yellow">GYM</span>
            <br />
            <span style={{ color: "#1f2937", fontSize: "0.6em", fontWeight: 600 }}>
              Vượt Qua Giới Hạn
            </span>
          </h2>

          <p className="login-branding-tagline">
            Nơi sức mạnh được rèn luyện, tinh thần được nâng tầm.
            Hãy đăng nhập để bắt đầu hành trình chinh phục bản thân.
          </p>

          {/* Feature highlights */}
          <div className="login-features">
            <div className="login-feature-item">
              <span className="login-feature-icon">
                <HiOutlineLightningBolt />
              </span>
              Chương trình tập luyện chuyên nghiệp
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">
                <HiOutlineUserGroup />
              </span>
              Cộng đồng fitness năng động
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">
                <HiOutlineShieldCheck />
              </span>
              Huấn luyện viên giàu kinh nghiệm
            </div>
          </div>
        </div>

        {/* ======= DIVIDER ======= */}
        <div className="login-divider" />

        {/* ======= RIGHT — Login Form ======= */}
        <div className="login-form-panel">
          <div className="login-card">
            {/* Card Header */}
            <div className="login-card-header">
              <p className="login-card-welcome">Chào mừng trở lại</p>
              <h1 className="login-card-title">Đăng nhập</h1>
              <p className="login-card-subtitle">
                Nhập thông tin tài khoản của bạn
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Email */}
              <div className="login-input-group">
                <label className="login-label" htmlFor="login-email">
                  Email
                </label>
                <div className="login-input-wrapper">
                  <HiOutlineMail className="login-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="login-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-input-group">
                <label className="login-label" htmlFor="login-password">
                  Mật khẩu
                </label>
                <div className="login-input-wrapper">
                  <HiOutlineLockClosed className="login-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="login-input login-input-password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-toggle-password"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="login-submit-btn"
              >
                {loading ? (
                  <>
                    <svg
                      className="login-spinner"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        opacity="0.25"
                      />
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>

            {/* Register link */}
            <div className="login-register-link">
              Chưa có tài khoản?{" "}
              <a href="/register">Đăng ký ngay</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}