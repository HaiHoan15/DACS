import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUserAsync } from "../../../../redux/authSlice";
import Notification from "../../../../components/Notification";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-8">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="w-full max-w-lg">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="text-red-500">ĐĂNG</span>
              <span className="text-yellow-500 ml-2">KÝ</span>
            </h1>
            <p className="text-gray-400">Tham gia cộng đồng THREE GYM</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tên người dùng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên người dùng"
                required
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
              <p className="text-xs text-gray-400 mt-1">Tối thiểu 6 ký tự</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>

            {/* Address (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Địa chỉ
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ của bạn"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-6 bg-gradient-to-r from-red-500 to-yellow-500 text-white font-bold rounded-lg hover:from-red-600 hover:to-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang đăng ký...
                </>
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>

          {/* Link đăng nhập */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Đã có tài khoản?{" "}
              <NavLink
                to="/login"
                className="text-red-500 hover:text-red-400 font-medium transition"
              >
                Đăng nhập ngay
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}