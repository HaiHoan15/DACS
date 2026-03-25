import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";
import { toSlug } from "../../../../routes/index";

export default function UM_Detail() {
  const navigate = useNavigate();
  const { username } = useParams();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch user detail
  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const token = localStorage.getItem("authToken") || "temp-token";
        const response = await api.get("UserController.php", {
          params: {
            action: "getAllUsers",
          },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          // Tìm user theo slug (convert username to slug and compare)
          const foundUser = response.data.users.find(
            (u) => toSlug(u.username) === username
          );

          if (foundUser) {
            setUser(foundUser);
          } else {
            setNotification({
              message: "Không tìm thấy người dùng",
              type: "error",
            });
            setTimeout(() => navigate("/admin/UserManagement"), 2000);
          }
        } else {
          setNotification({
            message: response.data.message || "Lỗi khi lấy dữ liệu",
            type: "error",
          });
        }
      } catch (error) {
        setNotification({
          message: error.response?.data?.message || "Lỗi kết nối server",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [username, navigate]);

  const defaultUserImage = "/images/error/user.png";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">
          <svg className="animate-spin h-8 w-8 mb-4 mx-auto" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/UserManagement")}
            className="mb-4 text-gray-400 hover:text-gray-300 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-red-500">CHI TIẾT</span>
            <span className="text-yellow-500 ml-2">NGƯỜI DÙNG</span>
          </h1>
        </div>

        {/* Main Container */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Avatar Section */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-8">
              <h3 className="text-white font-bold mb-4">Ảnh đại diện</h3>

              {/* Avatar Preview */}
              <div className="flex justify-center">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-40 h-40 rounded-full object-cover border-4 border-red-500"
                  onError={(e) => {
                    e.target.src = defaultUserImage;
                  }}
                />
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="md:col-span-3">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="space-y-5">
                {/* User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    ID người dùng
                  </label>
                  <p className="text-lg text-white font-semibold">{user.id}</p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Tên người dùng
                  </label>
                  <p className="text-lg text-white font-semibold">{user.username}</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email
                  </label>
                  <p className="text-lg text-white font-semibold">{user.email}</p>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Địa chỉ
                  </label>
                  <p className="text-lg text-white font-semibold">
                    {user.address || "Chưa cập nhật"}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Số điện thoại
                  </label>
                  <p className="text-lg text-white font-semibold">
                    {user.phone || "Chưa cập nhật"}
                  </p>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Quyền hạn
                  </label>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    user.role === "admin"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {user.role === "admin" ? "Admin" : "User"}
                  </span>
                </div>

                {/* Created At */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Ngày tạo tài khoản
                  </label>
                  <p className="text-lg text-white font-semibold">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "Không rõ"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700">
                  <button
                    onClick={() => navigate("/admin/UserManagement")}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
