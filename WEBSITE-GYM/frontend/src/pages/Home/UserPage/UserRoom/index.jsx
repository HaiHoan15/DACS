import { useEffect, useState } from "react";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";

export default function UserRoom() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRoomId, setExpandedRoomId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("authToken") || "temp-token";
        const response = await api.get("RoomController.php", {
          params: { action: "getAll" },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setRooms(response.data.rooms || []);
        } else {
          setNotification({ message: response.data.message || "Lỗi khi tải danh sách phòng", type: "error" });
        }
      } catch (error) {
        setNotification({ message: error.response?.data?.message || "Lỗi kết nối server", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const toggleExpand = (roomId) => {
    setExpandedRoomId((prev) => (prev === roomId ? null : roomId));
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 text-lg">Đang tải danh sách phòng tập...</p>
      </div>
    );
  }

  if (!rooms.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 text-lg">Hiện chưa có phòng tập nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {rooms.map((room) => (
        <div key={room.id} className="bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleExpand(room.id)}
            className="w-full p-5 flex items-center justify-between hover:bg-gray-200 transition"
          >
            <div className="text-left">
              <p className="text-gray-900 font-bold text-lg">{room.name}</p>
              <p className="text-gray-600 text-sm mt-1">
                Địa chỉ: {room.description || "Chưa cập nhật"}
              </p>
            </div>
            <div className={`text-gray-700 text-xl transition-transform ${expandedRoomId === room.id ? "rotate-180" : ""}`}>
              ▼
            </div>
          </button>

          {expandedRoomId === room.id && (
            <div className="border-t border-gray-300 p-5 bg-white">
              <h4 className="text-gray-900 font-semibold mb-3">Danh sách dụng cụ</h4>
              {room.equipments?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Tên dụng cụ</th>
                        <th className="px-4 py-2 text-center text-gray-700 font-semibold">Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {room.equipments.map((equipment) => (
                        <tr key={`${room.id}-${equipment.item_id}`} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{equipment.item_name}</td>
                          <td className="px-4 py-3 text-center font-semibold text-yellow-600">{equipment.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Phòng này chưa có dụng cụ.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}