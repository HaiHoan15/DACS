import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../API/api";
import Notification from "../../../components/Notification";
import Pagination2 from "../../../components/Pagination2";
import QuantityDistributionModal from "./QuantityDistributionModal";

const ITEMS_PER_PAGE = 5;

export default function WarehouseManagement() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [distributionItemId, setDistributionItemId] = useState(null);
  const [distributionDeleteMode, setDistributionDeleteMode] = useState(false);
  const [deleteBlockedItem, setDeleteBlockedItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchItems = async () => {
      try {
        const token = localStorage.getItem("authToken") || "temp-token";
        const response = await api.get("WarehouseController.php", {
          params: { action: "getAll" },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setItems(response.data.items || []);
        } else {
          setNotification({
            message: response.data.message || "Lỗi khi lấy danh sách kho",
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

  const performDelete = async (itemId) => {
    try {
      const token = localStorage.getItem("authToken") || "temp-token";
      const response = await api.post(
        "WarehouseController.php",
        {
          action: "delete",
          itemId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        setNotification({
          message: response.data.message || "Xóa dụng cụ thành công",
          type: "success",
        });
        return true;
      }
      return false;
    } catch (error) {
      const data = error.response?.data;
      if (data?.code === "ITEM_IN_ROOMS") {
        setDeleteBlockedItem({ itemId, itemName: data.itemName || "Dụng cụ", rooms: data.rooms || [] });
        return false;
      }
      setNotification({ message: data?.message || "Lỗi kết nối server", type: "error" });
      return false;
    }
  };

  const handleDelete = async (itemId, itemName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa dụng cụ "${itemName}" không?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken") || "temp-token";
      const response = await api.post("WarehouseController.php", {
        action: "delete",
        itemId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        setNotification({ message: response.data.message || "Xóa dụng cụ thành công", type: "success" });
      } else if (response.data.code === "ITEM_IN_ROOMS") {
        setDeleteBlockedItem({ itemId, itemName, rooms: response.data.rooms || [] });
      } else {
        setNotification({
          message: response.data.message || "Lỗi khi xóa dụng cụ",
          type: "error",
        });
      }
    } catch (error) {
      const data = error.response?.data;
      if (data?.code === "ITEM_IN_ROOMS") {
        setDeleteBlockedItem({ itemId, itemName, rooms: data.rooms || [] });
      } else {
        setNotification({
          message: data?.message || "Lỗi kết nối server",
          type: "error",
        });
      }
    }
  };

  const getImageUrl = (avatar) => {
    if (!avatar) return "/images/error/product.png";
    return avatar.startsWith("http") ? avatar : `/uploads/warehouse/${avatar}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Đang tải dữ liệu kho...</p>
      </div>
    );
  }

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return item.name?.toLowerCase().includes(q) || String(item.id).includes(q);
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="text-red-500">QUẢN LÝ</span>
          <span className="text-yellow-500 ml-2">KHO DỤNG CỤ</span>
        </h1>                
        <p className="text-gray-400 text-sm">Trang quản lý dụng cụ tập trong kho dụng cụ</p>
      </div>

      <div className="mb-5 bg-gray-800 rounded-xl border border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Tìm kiếm theo tên hoặc ID
            </label>
            <input
              type="text"
              placeholder="Nhập tên dụng cụ hoặc ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <button
            onClick={() => navigate("/admin/WarehouseManagement/dashboard/add")}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition whitespace-nowrap shadow"
          >
            + Thêm dụng cụ
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-3">
        Hiển thị <strong>{filtered.length}</strong> / {items.length} bản ghi
      </p>

      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-16 bg-gray-800 rounded-xl border border-gray-700">
          <p>Không có dữ liệu phù hợp.</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-700 border-b border-gray-600">
                <th className="px-5 py-3 font-bold uppercase tracking-wide text-gray-300">#</th>
                <th className="px-5 py-3 font-bold uppercase tracking-wide text-gray-300">Hình</th>
                <th className="px-5 py-3 font-bold uppercase tracking-wide text-gray-300">Tên dụng cụ</th>
                <th className="px-5 py-3 font-bold uppercase tracking-wide text-gray-300">Số lượng</th>
                <th className="px-5 py-3 font-bold uppercase tracking-wide text-gray-300">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                  <td className="px-5 py-3 text-gray-300">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td className="px-5 py-3">
                    <img
                      src={getImageUrl(item.avatar)}
                      alt={item.name}
                      className="w-11 h-11 object-cover rounded-lg border border-gray-700"
                      onError={(e) => {
                        e.target.src = "/images/error/product.png";
                      }}
                    />
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-200">{item.name}</td>
                  <td className="px-5 py-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-200">{item.quantity}</p>
                      <p className="text-xs text-gray-400">Trong phòng: {item.allocated_quantity || 0} | Còn lại: {item.available_quantity || 0}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setDistributionDeleteMode(false);
                          setDistributionItemId(item.id);
                        }}
                        className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition text-xs"
                      >
                        Thay số lượng
                      </button>
                      <button
                        onClick={() => navigate(`/admin/WarehouseManagement/dashboard/detail/${item.id}`)}
                        className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-xs"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => navigate(`/admin/WarehouseManagement/dashboard/edit/${item.id}`)}
                        className="px-3 py-1.5 rounded-md bg-amber-500 text-white hover:bg-amber-600 transition text-xs"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition text-xs"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-700">
              <Pagination2
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      <QuantityDistributionModal
        isOpen={Boolean(distributionItemId)}
        itemId={distributionItemId}
        deleteMode={distributionDeleteMode}
        onClose={() => {
          setDistributionItemId(null);
          setDistributionDeleteMode(false);
        }}
        onSaved={fetchItems}
        onDeleteAfterCleanup={async (itemId) => {
          const deleted = await performDelete(itemId);
          if (deleted) {
            setDeleteBlockedItem(null);
          }
          return deleted;
        }}
      />

      {deleteBlockedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Không thể xóa dụng cụ</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Hiện tại đang có phòng chứa dụng cụ này. Bạn phải xóa dụng cụ khỏi các phòng trước khi xóa khỏi kho.
            </p>

            <div className="mb-5 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {(deleteBlockedItem.rooms || []).map((room) => (
                <div key={room.room_id} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-gray-200 dark:border-gray-700 text-sm">
                  <span className="text-gray-800 dark:text-gray-200">{room.room_name}</span>
                  <span className="font-semibold text-red-500">{room.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteBlockedItem(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setDistributionDeleteMode(true);
                  setDistributionItemId(deleteBlockedItem.itemId);
                  setDeleteBlockedItem(null);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}