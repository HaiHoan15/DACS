import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserAsync } from "../../../../redux/authSlice";

export default function AdminPassword({ user, onNotification }) {
  const dispatch = useDispatch();
  const updateLoading = useSelector((state) => state.auth.updateLoading);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showPasswords: false,
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate password data
  const validatePassword = () => {
    if (!passwordData.currentPassword) {
      onNotification({
        message: "Vui lòng nhập mật khẩu hiện tại",
        type: "error",
      });
      return false;
    }

    if (!passwordData.newPassword) {
      onNotification({
        message: "Vui lòng nhập mật khẩu mới",
        type: "error",
      });
      return false;
    }

    if (passwordData.newPassword.length < 6) {
      onNotification({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        type: "error",
      });
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      onNotification({
        message: "Mật khẩu xác nhận không trùng khớp",
        type: "error",
      });
      return false;
    }

    return true;
  };

  // Xử lý cập nhật mật khẩu
  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    const token = localStorage.getItem("authToken") || "temp-token";
    const result = await dispatch(
      updateUserAsync({
        userId: user.id,
        username: null,
        address: null,
        phone: null,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
        token: token,
      })
    );

    if (result.type === updateUserAsync.fulfilled.type) {
      onNotification({
        message: "Cập nhật mật khẩu thành công!",
        type: "success",
      });
      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        showPasswords: false,
      });
    } else {
      onNotification({
        message: result.payload || "Lỗi khi cập nhật mật khẩu",
        type: "error",
      });
    }
  };

  return (
    <form onSubmit={handleSubmitPassword} className="space-y-5">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        {/* Current Password */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mật khẩu hiện tại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={passwordData.showPasswords ? "text" : "password"}
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition pr-12"
            />
            <button
              type="button"
              onClick={() =>
                setPasswordData((prev) => ({
                  ...prev,
                  showPasswords: !prev.showPasswords,
                }))
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {passwordData.showPasswords ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <input
            type={passwordData.showPasswords ? "text" : "password"}
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
          />
          <p className="text-xs text-gray-400 mt-1">Tối thiểu 6 ký tự</p>
        </div>

        {/* Confirm Password */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <input
            type={passwordData.showPasswords ? "text" : "password"}
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={updateLoading}
          className="w-full py-3 mt-6 bg-gradient-to-r from-red-500 to-yellow-500 text-white font-bold rounded-lg hover:from-red-600 hover:to-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {updateLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang cập nhật...
            </>
          ) : (
            "Đổi mật khẩu"
          )}
        </button>
      </div>
    </form>
  );
}
