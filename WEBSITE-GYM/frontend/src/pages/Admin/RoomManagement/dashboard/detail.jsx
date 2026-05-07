import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";

export default function RoomDetail() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem("authToken") || "temp-token";
        const response = await api.get("RoomController.php", {
          params: { action: "getById", roomId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setRoom(response.data.room);
        } else {
          setNotification({ message: response.data.message || "Lỗi khi tải chi tiết phòng", type: "error" });
        }
      } catch (error) {
        setNotification({ message: error.response?.data?.message || "Lỗi kết nối server", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const getItemImageUrl = (avatar) => {
    if (!avatar) return "/images/error/product.png";
    return avatar.startsWith("http") ? avatar : `/uploads/warehouse/${avatar}`;
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        <button onClick={() => navigate("/admin/RoomManagement")} className="mb-4 text-gray-400 hover:text-gray-300 transition flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Quay lại
        </button>
        <div className="text-center text-gray-400 py-12"><p>Không tìm thấy phòng</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate("/admin/RoomManagement")} className="mb-4 text-gray-400 hover:text-gray-300 transition flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Quay lại
          </button>
          <h1 className="text-4xl font-bold text-white mb-1">
            <span className="text-red-500">CHI TIỬT</span>
            <span className="text-yellow-500 ml-2">PHÒNG TẬP</span>
          </h1>
          <p className="text-sm text-gray-400">Xem thông tin chi tiết và danh sách dụng cụ của phòng tập.</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Tên phòng</label>
              <p className="text-xl text-white font-semibold">{room.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">ID phòng</label>
              <p className="text-white">{room.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Số loại dụng cụ</label>
              <p className="text-yellow-500 font-bold text-lg">{room.equipments?.length || 0}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Mô tả / Địa chỉ</label>
            <div className="text-gray-300 bg-gray-700 rounded p-4 border border-gray-600 min-h-24">
              {room.description || "Không có mô tả"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Ngày tạo</label>
              <p className="text-sm text-gray-300">{formatDate(room.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Ngày cập nhật</label>
              <p className="text-sm text-gray-300">{formatDate(room.updated_at)}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Danh sách dụng cụ tập</h3>
            {room.equipments?.length ? (
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-700 text-gray-200">
                    <tr>
                      <th className="px-4 py-3">Hình</th>
                      <th className="px-4 py-3">Dụng cụ</th>
                      <th className="px-4 py-3">Số lượng</th>
                    </tr>
                    </thead>
                  <tbody>
                    {room.equipments.map((equipment) => (
                      <tr key={`${equipment.item_id}-${equipment.id}`} className="border-t border-gray-700 text-gray-300">
                        <td className="px-4 py-3">
                          <img
                            src={getItemImageUrl(equipment.item_avatar)}
                            alt={equipment.item_name}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => { e.target.src = "/images/error/product.png"; }}
                          />
                        </td>
                        <td className="px-4 py-3">{equipment.item_name}</td>
                        <td className="px-4 py-3 font-semibold text-yellow-400">{equipment.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-600 px-4 py-6 text-sm text-gray-400">Phòng này chưa có dụng cụ nào.</div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button onClick={() => navigate(`/admin/RoomManagement/dashboard/edit/${room.id}`)} className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">Chỉnh sửa</button>
            <button onClick={() => navigate("/admin/RoomManagement")} className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">Quay lại</button>
          </div>
        </div>
      </div>
    </div>
  );
}