import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../API/api";
import Notification from "../../../components/Notification";
import { toSlug } from "../../../routes/index";
import UserActivity from "./UserActivity";

export default function UserManagement() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("permission");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch danh sách users
  useEffect(() => {
    const fetchUsers = async () => {
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
          setUsers(response.data.users);
        } else {
          setNotification({
            message: response.data.message || "Lỗi khi lấy danh sách users",
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

    fetchUsers();
  }, []);

  const handleDetail = (username) => {
    const slug = toSlug(username);
    navigate(`/admin/UserManagement/UM_Detail/${slug}`);
  };

  const handleRoleChange = async (userId, username, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    try {
      const token = localStorage.getItem("authToken") || "temp-token";
      const response = await api.post("UserController.php", {
        action: "updateRole",
        userId: userId,
        newRole: newRole,
      }, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Cập nhật users list
        setUsers(users.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ));
        
        setNotification({
          message: `Đã ${newRole === "admin" ? "nâng" : "hạ"} ${username} thành công!`,
          type: "success",
        });
      } else {
        setNotification({
          message: response.data.message || "Lỗi khi thay đổi role",
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Lỗi kết nối server",
        type: "error",
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-red-500">QUẢN LÝ</span>
            <span className="text-yellow-500 ml-2">NGƯỜI DÙNG</span>
          </h1>
          <p className="text-gray-400">Tổng: {users.length} người dùng</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("permission")}
            className={`px-6 py-3 font-medium transition border-b-2 ${activeTab === "permission"
              ? "text-red-500 border-red-500"
              : "text-gray-400 border-transparent hover:text-gray-300"
              }`}
          >
            Phân quyền
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-6 py-3 font-medium transition border-b-2 ${activeTab === "activity"
              ? "text-red-500 border-red-500"
              : "text-gray-400 border-transparent hover:text-gray-300"
              }`}
          >
            Hoạt động
          </button>
        </div>

        {activeTab === "permission" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {users.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                Không có người dùng nào
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700 border-b border-gray-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tên người dùng</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4 text-sm text-gray-300">{user.id}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = "/images/error/user.png";
                              }}
                            />
                            <span className="text-white font-medium">{user.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}>
                            {user.role === "admin" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {user.id === currentUser?.id ? (
                            <div className="text-center">
                              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-xs font-semibold">
                                Tài khoản của bạn
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleDetail(user.username)}
                                className="px-4 py-2 bg-blue-500 hover:bg-green-600 text-white rounded-lg transition font-medium text-xs"
                              >
                                Chi tiết
                              </button>
                              <button
                                onClick={() => handleRoleChange(user.id, user.username, user.role)}
                                className={`px-4 py-2 rounded-lg transition font-medium text-xs ${
                                  user.role === "admin"
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                                }`}
                              >
                                {user.role === "admin" ? "Admin" : "User"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && <UserActivity />}
      </div>
    </div>
  );
}
