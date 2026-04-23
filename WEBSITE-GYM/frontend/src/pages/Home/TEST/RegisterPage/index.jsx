import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUserAsync } from "../../../../../redux/authSlice";
import Notification from "../../../components/Notification";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineLightningBolt,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineStar,
} from "react-icons/hi";
import "./RegisterPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.auth.loading);
  const _error = useSelector((state) => state.auth.error);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // kiểm tra nhập đầy đủ các trường bắt buộc
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setNotification({
        message: "Vui lòng điền đầy đủ các trường bắt buộc",
        type: "error",
      });
      return;
    }

    // Kiểm tra mật khẩu xác nhận
    if (formData.password !== formData.confirmPassword) {
      setNotification({
        message: "Mật khẩu xác nhận không trùng khớp",
        type: "error",
      });
      return;
    }

    // kiêm tra độ dài mật khẩu
    if (formData.password.length < 6) {
      setNotification({
        message: "Mật khẩu phải có ít nhất 6 ký tự",
        type: "error",
      });
      return;
    }

    // giới hạn độ dài username
    if (formData.username.length < 3 || formData.username.length > 30) {
      setNotification({
        message: "Tên người dùng phải từ 3 đến 30 ký tự",
        type: "error",
      });
      return;
    }

    // Dispatch register request
    const result = await dispatch(registerUserAsync(formData));

    if (result.type === registerUserAsync.fulfilled.type) {
      // Đăng ký thành công
      setNotification({
        message: "Đăng ký thành công! Hãy đăng nhập để tiếp tục.",
        type: "success",
      });

      // Đợi 1,5 giây rồi chuyển đến trang login
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      // Đăng ký thất bại
      setNotification({
        message: result.payload || "Đăng ký thất bại",
        type: "error",
      });
    }
  };

  return (
    <div className="register-page">
      {/* Background grid */}
      <div className="register-bg-grid" />

      {/* Floating decorative shapes */}
      <div className="register-deco-shape register-deco-shape-1" />
      <div className="register-deco-shape register-deco-shape-2" />
      <div className="register-deco-shape register-deco-shape-3" />
      <div className="register-deco-shape register-deco-shape-4" />

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="register-wrapper">
        {/* ======= LEFT — Branding ======= */}
        <div className="register-branding">
          <img
            src="/images/logo/logo.png"
            alt="Three GYM Logo"
            className="register-branding-logo"
          />

          <h2 className="register-branding-title">
            <span className="text-red">THREE</span>{" "}
            <span className="text-yellow">GYM</span>
            <br />
            <span style={{ color: "#1f2937", fontSize: "0.6em", fontWeight: 600 }}>
              Vượt Qua Giới Hạn
            </span>
          </h2>

          <p className="register-branding-tagline">
            Tham gia cộng đồng ThreeGym để bắt đầu hành trình tập luyện
            và chinh phục phiên bản tốt nhất của chính bạn.
          </p>

          {/* Feature highlights */}
          <div className="register-features">
            <div className="register-feature-item">
              <span className="register-feature-icon">
                <HiOutlineLightningBolt />
              </span>
              Chương trình tập luyện chuyên nghiệp
            </div>
            <div className="register-feature-item">
              <span className="register-feature-icon">
                <HiOutlineUserGroup />
              </span>
              Cộng đồng fitness năng động
            </div>
            <div className="register-feature-item">
              <span className="register-feature-icon">
                <HiOutlineShieldCheck />
              </span>
              Huấn luyện viên giàu kinh nghiệm
            </div>
            <div className="register-feature-item">
              <span className="register-feature-icon">
                <HiOutlineStar />
              </span>
              Ưu đãi dành riêng cho thành viên
            </div>
          </div>
        </div>

        {/* ======= DIVIDER ======= */}
        <div className="register-divider" />

        {/* ======= RIGHT — Register Form ======= */}
        <div className="register-form-panel">
          <div className="register-card">
            {/* Card Header */}
            <div className="register-card-header">
              <p className="register-card-welcome">Chào mừng bạn đến với ThreeGym</p>
              <h1 className="register-card-title">Đăng ký</h1>
              <p className="register-card-subtitle">
                Tạo tài khoản để bắt đầu hành trình tập luyện
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="register-form">
              {/* Email */}
              <div className="register-input-group">
                <label className="register-label" htmlFor="register-email">
                  Email <span className="required">*</span>
                </label>
                <div className="register-input-wrapper">
                  <HiOutlineMail className="register-input-icon" />
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="register-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="register-input-group">
                <label className="register-label" htmlFor="register-username">
                  Tên người dùng <span className="required">*</span>
                </label>
                <div className="register-input-wrapper">
                  <HiOutlineUser className="register-input-icon" />
                  <input
                    id="register-username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nhập tên người dùng"
                    required
                    className="register-input"
                    autoComplete="username"
                  />
                </div>
                <span className="register-input-hint">Từ 3 đến 30 ký tự</span>
              </div>

              {/* Password */}
              <div className="register-input-group">
                <label className="register-label" htmlFor="register-password">
                  Mật khẩu <span className="required">*</span>
                </label>
                <div className="register-input-wrapper">
                  <HiOutlineLockClosed className="register-input-icon" />
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="register-input register-input-password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="register-toggle-password"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
                <span className="register-input-hint">Tối thiểu 6 ký tự</span>
              </div>

              {/* Confirm Password */}
              <div className="register-input-group">
                <label className="register-label" htmlFor="register-confirm-password">
                  Xác nhận mật khẩu <span className="required">*</span>
                </label>
                <div className="register-input-wrapper">
                  <HiOutlineLockClosed className="register-input-icon" />
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="register-input register-input-password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="register-toggle-password"
                    aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showConfirmPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>

              {/* Address + Phone — side by side */}
              <div className="register-row">
                <div className="register-input-group">
                  <label className="register-label" htmlFor="register-address">
                    Địa chỉ
                    <span className="register-optional-badge">(không bắt buộc)</span>
                  </label>
                  <div className="register-input-wrapper">
                    <HiOutlineLocationMarker className="register-input-icon" />
                    <input
                      id="register-address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ"
                      className="register-input"
                      autoComplete="street-address"
                    />
                  </div>
                </div>

                <div className="register-input-group">
                  <label className="register-label" htmlFor="register-phone">
                    Số điện thoại
                    <span className="register-optional-badge">(không bắt buộc)</span>
                  </label>
                  <div className="register-input-wrapper">
                    <HiOutlinePhone className="register-input-icon" />
                    <input
                      id="register-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0xxx xxx xxx"
                      className="register-input"
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="register-submit-btn"
              >
                {loading ? (
                  <>
                    <svg
                      className="register-spinner"
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
                    Đang đăng ký...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </button>
            </form>

            {/* Login link */}
            <div className="register-login-link">
              Đã có tài khoản?{" "}
              <a href="/login">Đăng nhập ngay</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}