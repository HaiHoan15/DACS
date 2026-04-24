import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Notification from "../../../components/Notification";
import AdminProfile from "./AdminProfile";

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [notification, setNotification] = useState(null);

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
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-red-500">THÔNG TIN</span>
            <span className="text-yellow-500 ml-2">ADMIN</span>
          </h1>
          <p className="text-gray-400">Cập nhật thông tin cá nhân của bạn</p>
        </div>

        <AdminProfile user={user} onNotification={setNotification} />
      </div>
    </div>
  );
}
