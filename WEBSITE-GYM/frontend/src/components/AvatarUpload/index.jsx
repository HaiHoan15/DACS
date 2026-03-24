import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { uploadAvatarAsync } from "../../redux/authSlice";
import Notification from "../Notification";

export default function AvatarUpload() {
  const user = useSelector((state) => state.auth.user);
  const avatarLoading = useSelector((state) => state.auth.avatarLoading);
  const avatarError = useSelector((state) => state.auth.avatarError);
  const dispatch = useDispatch();

  const [notification, setNotification] = useState(null);
  const [preview, setPreview] = useState(user?.avatarUrl || "/images/error/user.png");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        message: "File quá lớn! Tối đa 5MB",
        type: "error"
      });
      return;
    }

    // Kiểm tra loại file
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      setNotification({
        message: "Chỉ chấp nhận JPEG, PNG, GIF, WebP",
        type: "error"
      });
      return;
    }

    // Hiển thị preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file qua Redux dispatch
    const result = await dispatch(uploadAvatarAsync({
      userId: user.id,
      file: file,
      token: localStorage.getItem("authToken") // Lưu token ở localStorage khi login
    }));

    if (result.type === uploadAvatarAsync.fulfilled.type) {
      setNotification({
        message: "Cập nhật avatar thành công!",
        type: "success"
      });
    } else {
      setNotification({
        message: result.payload || "Lỗi khi upload avatar",
        type: "error"
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Avatar Preview */}
      <div className="relative">
        <img
          src={preview}
          alt="Avatar preview"
          className="w-32 h-32 rounded-full object-cover border-4 border-red-500"
        />
        <label
          htmlFor="avatar-input"
          className={`absolute bottom-0 right-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full cursor-pointer transition ${avatarLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <svg
            className="w-6 h-6"
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

      {/* Upload Button (Alternative) */}
      <label className={`px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer transition ${avatarLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
        {avatarLoading ? "Đang upload..." : "Chọn avatar"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={avatarLoading}
          className="hidden"
        />
      </label>

      {avatarError && (
        <p className="text-red-500 text-sm">{avatarError}</p>
      )}
    </div>
  );
}
