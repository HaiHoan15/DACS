import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Notification from "../../../components/Notification";
import UserProfile from "./UserProfile";
import UserPassword from "./UserPassword";
import UserWishlist from "./UserWishlist";

export default function UserPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  // Check user - redirect nếu không có user
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      {/* Hiển thị thông báo nếu có */}
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
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-red-500">QUẢN LÝ</span>
            <span className="text-yellow-500 ml-2">TÀI KHOẢN</span>
          </h1>
          <p className="text-gray-400">Cập nhật thông tin cá nhân của bạn</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 font-medium transition border-b-2 ${activeTab === "info"
              ? "text-red-500 border-red-500"
              : "text-gray-400 border-transparent hover:text-gray-300"
              }`}
          >
            Thông tin chung
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-6 py-3 font-medium transition border-b-2 ${activeTab === "password"
              ? "text-red-500 border-red-500"
              : "text-gray-400 border-transparent hover:text-gray-300"
              }`}
          >
            Đổi mật khẩu
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`px-6 py-3 font-medium transition border-b-2 ${activeTab === "wishlist"
              ? "text-red-500 border-red-500"
              : "text-gray-400 border-transparent hover:text-gray-300"
              }`}
          >
            Giỏ hàng
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "info" && (
          <UserProfile user={user} onNotification={setNotification} />
        )}

        {activeTab === "password" && (
          <UserPassword user={user} onNotification={setNotification} />
        )}

        {activeTab === "wishlist" && (
          <UserWishlist user={user} />
        )}
      </div>
    </div>
  );
}