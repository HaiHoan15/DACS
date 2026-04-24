import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";

export default function UserRoom() {
  const user = useSelector((state) => state.auth.user);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRoomId, setExpandedRoomId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    open: false,
    roomId: "",
    roomName: "",
    code: "",
  });

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

  const generateMemberCode = (roomId) => {
    const timePart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `MEM-${roomId}-${timePart}-${randomPart}`;
  };

  const handleRegisterRoom = (room) => {
    const code = generateMemberCode(room.id);
    setConfirmationModal({
      open: true,
      roomId: room.id,
      roomName: room.name,
      code,
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({ open: false, roomId: "", roomName: "", code: "" });
  };

  const qrValue = confirmationModal.code
    ? `MEMBER_CONFIRM|ROOM_ID=${confirmationModal.roomId || ""}|ROOM=${confirmationModal.roomName}|USER_ID=${user?.id || ""}|USER=${encodeURIComponent(user?.username || "")}|EMAIL=${encodeURIComponent(user?.email || "")}|CODE=${confirmationModal.code}`
    : "";
  const qrImageUrl = qrValue
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrValue)}`
    : "";

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
      {confirmationModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-yellow-500 text-white">
              <h3 className="text-lg font-bold">MÃ XÁC NHẬN THÀNH VIÊN</h3>
              <p className="text-sm opacity-90 mt-1">Đưa mã này cho admin để quét và xác nhận vào phòng.</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Phòng đăng ký</p>
                <p className="text-lg font-semibold text-gray-900">{confirmationModal.roomName}</p>
              </div>

              {qrImageUrl && (
                <div className="flex justify-center">
                  <img
                    src={qrImageUrl}
                    alt="QR xác nhận thành viên"
                    className="w-56 h-56 rounded-lg border border-gray-200 bg-white p-2"
                  />
                </div>
              )}

              <p className="text-sm text-gray-500 text-center">
                Vui lòng đưa mã QR này cho admin để xác nhận thành viên.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeConfirmationModal}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {rooms.map((room) => (
        <div key={room.id} className="bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
          <div className="w-full p-5 flex items-center justify-between hover:bg-gray-200 transition">
            <div className="text-left">
              <p className="text-gray-900 font-bold text-lg">{room.name}</p>
              <p className="text-gray-600 text-sm mt-1">
                Địa chỉ: {room.description || "Chưa cập nhật"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRegisterRoom(room)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Đăng ký
              </button>

              <button
                type="button"
                onClick={() => toggleExpand(room.id)}
                className="w-10 h-10 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xl transition"
                aria-label={expandedRoomId === room.id ? "Ẩn danh sách dụng cụ" : "Hiện danh sách dụng cụ"}
              >
                <span className={`inline-block transition-transform ${expandedRoomId === room.id ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
            </div>
          </div>

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