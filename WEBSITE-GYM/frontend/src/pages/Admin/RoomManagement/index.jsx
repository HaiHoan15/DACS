import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../API/api";
import Notification from "../../../components/Notification";

export default function RoomManagement() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedRooms, setExpandedRooms] = useState({});

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
          setNotification({ message: response.data.message || "Lỗi khi lấy danh sách phòng", type: "error" });
        }
      } catch (error) {
        setNotification({ message: error.response?.data?.message || "Lỗi kết nối server", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleDelete = async (roomId, roomName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng "${roomName}" không?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken") || "temp-token";
      const response = await api.post("RoomController.php", {
        action: "delete",
        roomId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setRooms((prev) => prev.filter((room) => room.id !== roomId));
        setNotification({ message: response.data.message || "Xóa phòng thành công", type: "success" });
      } else {
        setNotification({ message: response.data.message || "Lỗi khi xóa phòng", type: "error" });
      }
    } catch (error) {
      setNotification({ message: error.response?.data?.message || "Lỗi kết nối server", type: "error" });
    }
  };

  const toggleRoom = (roomId) => {
    setExpandedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  const getItemImageUrl = (avatar) => {
    if (!avatar) return "/images/error/product.png";
    return avatar.startsWith("http") ? avatar : `/uploads/warehouse/${avatar}`;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((room) => room.name?.toLowerCase().includes(q) || String(room.id).includes(q));
  }, [rooms, search]);

  if (loading) {
    return <div className="text-center text-gray-400 py-12"><p>Đang tải dữ liệu...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý phòng tập</h1>
      </div>

      <div className="mb-5 flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tìm kiếm theo tên hoặc ID phòng</label>
          <input
            type="text"
            placeholder="Nhập tên phòng hoặc ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button onClick={() => navigate("/admin/RoomManagement/dashboard/add")} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition whitespace-nowrap shadow">
          + Thêm phòng
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Hiển thị <strong>{filtered.length}</strong> / {rooms.length} bản ghi</p>

      {filtered.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p>Không có dữ liệu phù hợp.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">#</th>
                <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Tên phòng</th>
                <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Tổng dụng cụ</th>
                <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Danh sách dụng cụ</th>
                <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((room, idx) => (
                <Fragment key={room.id}>
                  <tr key={room.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{idx + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{room.name}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{room.equipment_quantity_total || 0}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleRoom(room.id)} className="px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold transition">
                        {expandedRooms[room.id] ? "Ẩn danh sách" : `Xem dụng cụ (${room.equipments?.length || 0})`}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/admin/RoomManagement/dashboard/detail/${room.id}`)} className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-xs">Chi tiết</button>
                        <button onClick={() => navigate(`/admin/RoomManagement/dashboard/edit/${room.id}`)} className="px-3 py-1.5 rounded-md bg-amber-500 text-white hover:bg-amber-600 transition text-xs">Sửa</button>
                        <button onClick={() => handleDelete(room.id, room.name)} className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition text-xs">Xóa</button>
                      </div>
                    </td>
                  </tr>
                  {expandedRooms[room.id] && (
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/20">
                      <td colSpan={5} className="px-5 py-4">
                        {room.equipments?.length ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {room.equipments.map((equipment) => (
                              <div key={`${room.id}-${equipment.item_id}`} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
                                <img
                                  src={getItemImageUrl(equipment.item_avatar)}
                                  alt={equipment.item_name}
                                  className="w-10 h-10 object-cover rounded"
                                  onError={(e) => { e.target.src = "/images/error/product.png"; }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{equipment.item_name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Số lượng: {equipment.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">Phòng này chưa có dụng cụ nào.</div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}