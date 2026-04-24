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
    return <div className="text-center text-gray-400 py-12"><p>Đang tải dữ liệu...</p></div>;
  }

  if (!room) {
    return (
      <div className="space-y-6">
        {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        <button onClick={() => navigate("/admin/RoomManagement")} className="text-gray-400 hover:text-white transition">← Quay lại</button>
        <div className="text-center text-gray-400 py-12"><p>Không tìm thấy phòng</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/RoomManagement")} className="text-gray-400 hover:text-white transition">← Quay lại</button>
        <h2 className="text-2xl font-bold text-white">Chi tiết phòng tập</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Tên phòng</label>
              <p className="text-xl text-white font-semibold">{room.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-400 mb-1">Địa chỉ</label>
              <div className="text-gray-300 bg-gray-700 rounded p-4 border border-gray-600 min-h-28">
                {room.description || "Không có địa chỉ"}
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
    </div>
  );
}