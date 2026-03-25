import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadAvatarAsync, updateUserAsync } from "../../../../redux/authSlice";

export default function AdminProfile({ user, onNotification }) {
  const dispatch = useDispatch();
  const avatarLoading = useSelector((state) => state.auth.avatarLoading);
  const updateLoading = useSelector((state) => state.auth.updateLoading);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    address: user?.address || "",
    phone: user?.phone || "",
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "/images/error/user.png");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước
    if (file.size > 5 * 1024 * 1024) {
      onNotification({
        message: "File quá lớn! Tối đa 5MB",
        type: "error",
      });
      return;
    }

    // Kiểm tra loại file
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      onNotification({
        message: "Chỉ chấp nhận JPEG, PNG, GIF, WebP",
        type: "error",
      });
      return;
    }

    // Hiển thị preview trước
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    const token = localStorage.getItem("authToken") || "temp-token";
    const result = await dispatch(
      uploadAvatarAsync({
        userId: user.id,
        file: file,
        token: token,
      })
    );

    if (result.type === uploadAvatarAsync.fulfilled.type) {
      onNotification({
        message: "Cập nhật avatar thành công!",
        type: "success",
      });
    } else {
      onNotification({
        message: result.payload || "Lỗi khi upload avatar",
        type: "error",
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.username) {
      onNotification({
        message: "Tên người dùng không được để trống",
        type: "error",
      });
      return false;
    }

    if (formData.username.length < 3 || formData.username.length > 30) {
      onNotification({
        message: "Tên người dùng phải từ 3 đến 30 ký tự",
        type: "error",
      });
      return false;
    }

    return true;
  };

  // Xử lý cập nhật thông tin
  const handleSubmitInfo = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const token = localStorage.getItem("authToken") || "temp-token";
    const result = await dispatch(
      updateUserAsync({
        userId: user.id,
        username: formData.username,
        address: formData.address,
        phone: formData.phone,
        currentPassword: null,
        newPassword: null,
        confirmPassword: null,
        token: token,
      })
    );

    if (result.type === updateUserAsync.fulfilled.type) {
      onNotification({
        message: "Cập nhật thông tin thành công!",
        type: "success",
      });
    } else {
      onNotification({
        message: result.payload || "Lỗi khi cập nhật thông tin",
        type: "error",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Avatar Section */}
      <div className="md:col-span-1">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-8">
          <h3 className="text-white font-bold mb-4">Ảnh đại diện</h3>

          {/* Avatar Preview */}
          <div className="relative mb-4 flex justify-center">
            <div className="relative">
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-40 h-40 rounded-full object-cover border-4 border-red-500"
                onError={(e) => {
                  e.target.src = "/images/error/user.png";
                }}
              />
              <label
                htmlFor="avatar-input"
                className={`absolute bottom-0 right-0 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full cursor-pointer transition ${avatarLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </label>
            </div>
            <input
              id="avatar-input"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              disabled={avatarLoading}
              className="hidden"
            />
          </div>

          {avatarLoading && (
            <p className="text-center text-yellow-400 text-sm">
              Đang upload...
            </p>
          )}
        </div>
      </div>

      {/* Form Section */}
      <div className="md:col-span-3">
        <form onSubmit={handleSubmitInfo} className="space-y-5">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            {/* Email (Read-only) */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email <span className="text-gray-500 text-xs">(không thể thay đổi)</span>
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed opacity-75"
              />
            </div>

            {/* Username */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tên người dùng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
              <p className="text-xs text-gray-400 mt-1">3-30 ký tự</p>
            </div>

            {/* Address */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Địa chỉ
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ của bạn"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>

            {/* Phone */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
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
                "Cập nhật thông tin"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
