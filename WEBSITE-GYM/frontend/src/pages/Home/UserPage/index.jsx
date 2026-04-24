import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Notification from "../../../components/Notification";
import UserProfile from "./UserProfile";
import UserPassword from "./UserPassword";
import UserWishlist from "./UserWishlist";
import UserOrder from "./UserOrder";
import UserAI from "./UserAI";
import UserRoom from "./UserRoom";
import UserClass from "./UserClass";
import api from "../../../API/api";

// Mức gói tối thiểu để mở tab
const TAB_REQUIRED_LEVEL = { room: 1, class: 2, ai: 3 };
// Tên gói hiển thị
const PACKAGE_NAMES = { 1: "Normal", 2: "Pro", 3: "VIP" };
// Tên tab dùng trong overlay
const TAB_LABELS = { room: "Phòng tập", class: "Lớp học", ai: "AI sức khỏe" };

function LockedOverlay({ tab }) {
  const required = TAB_REQUIRED_LEVEL[tab];
  const tabLabel  = TAB_LABELS[tab];

  // Các gói đủ điều kiện mở tab này
  const eligiblePkgs = Object.entries(PACKAGE_NAMES)
    .filter(([id]) => Number(id) >= required)
    .map(([, name]) => name);

  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[320px] flex items-center justify-center bg-gray-800/60 backdrop-blur-sm border border-gray-700">
      {/* Nội dung blur phía sau (placeholder mờ) */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl" />
      </div>

      {/* Thông báo khoá */}
      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-8 py-12 max-w-lg">
        {/* Icon khoá */}
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-3xl">
          🔒
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            Tính năng <span className="text-red-400">{tabLabel}</span> bị khóa
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Hiện tại bạn chưa đăng ký gói ưu đãi nào. Hãy mua một trong các gói{" "}
            <span className="text-yellow-400 font-semibold">{eligiblePkgs.join(" / ")}</span>{" "}
            để mở khóa tính năng này.
          </p>
        </div>

        {/* Các gói đề xuất */}
        <div className="flex gap-2 flex-wrap justify-center">
          {eligiblePkgs.map((pkg) => (
            <span
              key={pkg}
              className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
            >
              {pkg}
            </span>
          ))}
        </div>

        <Link
          to="/service"
          className="mt-1 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition shadow-lg"
        >
          Xem các gói dịch vụ →
        </Link>
      </div>
    </div>
  );
}

export default function UserPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.auth.user);

  const [notification, setNotification] = useState(null);
  const [activePackageId, setActivePackageId] = useState(null); // null = chưa load xong

  // Fetch gói dịch vụ
  useEffect(() => {
    if (!user) return;
    api.get("ServiceController.php", { params: { action: "getUserService", userId: user.id } })
      .then(res => {
        if (res.data.success && res.data.service) {
          setActivePackageId(Number(res.data.service.package_id));
        } else {
          setActivePackageId(0); // không có gói
        }
      })
      .catch(() => setActivePackageId(0));
  }, [user]);

  // Helpers
  function isLocked(tab) {
    const required = TAB_REQUIRED_LEVEL[tab];
    if (!required) return false;
    return (activePackageId ?? 0) < required;
  }
  
  // Initialize activeTab từ query parameter, hoặc mặc định là "info"
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && ["info", "password", "wishlist", "order", "room", "class", "ai"].includes(tabFromUrl)) {
      return tabFromUrl;
    }
    return "info";
  });

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
          <button
            onClick={() => setActiveTab("order")}
            className={`px-6 py-3 font-medium transition border-b-2 ${activeTab === "order"
              ? "text-red-500 border-red-500"
              : "text-gray-400 border-transparent hover:text-gray-300"
              }`}
          >
            Lịch sử đơn hàng
          </button>
          <button
            onClick={() => setActiveTab("room")}
            className={`px-6 py-3 font-medium transition border-b-2 flex items-center gap-1
              ${isLocked("room") ? "opacity-40" : ""}
              ${activeTab === "room"
                ? "text-red-500 border-red-500"
                : "text-gray-400 border-transparent hover:text-gray-300"}
            `}
          >
            {isLocked("room") && <span className="text-xs">🔒</span>}
            Phòng tập
          </button>
          <button
            onClick={() => setActiveTab("class")}
            className={`px-6 py-3 font-medium transition border-b-2 flex items-center gap-1
              ${isLocked("class") ? "opacity-40" : ""}
              ${activeTab === "class"
                ? "text-red-500 border-red-500"
                : "text-gray-400 border-transparent hover:text-gray-300"}
            `}
          >
            {isLocked("class") && <span className="text-xs">🔒</span>}
            Lớp học
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-6 py-3 font-medium transition border-b-2 flex items-center gap-1
              ${isLocked("ai") ? "opacity-40" : ""}
              ${activeTab === "ai"
                ? "text-red-500 border-red-500"
                : "text-gray-400 border-transparent hover:text-gray-300"}
            `}
          >
            {isLocked("ai") && <span className="text-xs">🔒</span>}
            AI sức khỏe
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

        {activeTab === "order" && (
          <UserOrder />
        )}

        {activeTab === "room" && (
          isLocked("room") ? <LockedOverlay tab="room" /> : <UserRoom />
        )}

        {activeTab === "class" && (
          isLocked("class") ? <LockedOverlay tab="class" /> : <UserClass />
        )}

        {activeTab === "ai" && (
          isLocked("ai") ? <LockedOverlay tab="ai" /> : <UserAI />
        )}

      </div>
    </div>
  );
}