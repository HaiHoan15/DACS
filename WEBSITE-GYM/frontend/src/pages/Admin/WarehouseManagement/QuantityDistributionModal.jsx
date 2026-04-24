import { useEffect, useMemo, useState } from "react";
import api from "../../../API/api";

export default function QuantityDistributionModal({
  isOpen,
  itemId,
  onClose,
  onSaved,
  onDeleteAfterCleanup,
  deleteMode = false,
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [roomAllocations, setRoomAllocations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !itemId) return;

    const fetchDistribution = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("authToken") || "temp-token";
        const response = await api.get("WarehouseController.php", {
          params: { action: "getDistribution", itemId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setItem(response.data.item);
          setTotalQuantity(Number(response.data.item.quantity) || 0);
          setRoomAllocations((response.data.roomAllocations || []).map((allocation) => ({
            roomId: Number(allocation.room_id),
            roomName: allocation.room_name,
            quantity: Number(allocation.quantity) || 0,
          })));
        } else {
          setError(response.data.message || "Không thể tải phân bổ dụng cụ");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
  }, [isOpen, itemId]);

  const allocatedTotal = useMemo(
    () => roomAllocations.reduce((sum, allocation) => sum + Number(allocation.quantity || 0), 0),
    [roomAllocations]
  );

  const remaining = Number(totalQuantity || 0) - allocatedTotal;

  const handleAllocationChange = (roomId, value) => {
    setRoomAllocations((prev) => prev.map((allocation) => (
      allocation.roomId === roomId ? { ...allocation, quantity: value } : allocation
    )));
  };

  const handleSubmit = async () => {
    setError("");
    const normalizedTotal = Number(totalQuantity);
    if (!Number.isInteger(normalizedTotal) || normalizedTotal < 0) {
      setError("Tổng số lượng phải là số nguyên >= 0");
      return;
    }

    const normalizedAllocations = roomAllocations.map((allocation) => ({
      roomId: allocation.roomId,
      quantity: Number(allocation.quantity || 0),
    }));

    if (normalizedAllocations.some((allocation) => !Number.isInteger(allocation.quantity) || allocation.quantity < 0)) {
      setError("Số lượng trong từng phòng phải là số nguyên >= 0");
      return;
    }

    const nextAllocatedTotal = normalizedAllocations.reduce((sum, allocation) => sum + allocation.quantity, 0);
    if (nextAllocatedTotal > normalizedTotal) {
      setError("Tổng phân bổ cho các phòng đang vượt quá số lượng trong kho");
      return;
    }

    if (deleteMode && nextAllocatedTotal > 0) {
      setError("Bạn cần đưa toàn bộ số lượng trong các phòng về 0 trước khi xóa khỏi kho");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("authToken") || "temp-token";
      const response = await api.post(
        "WarehouseController.php",
        {
          action: "updateDistribution",
          itemId,
          totalQuantity: normalizedTotal,
          roomAllocations: normalizedAllocations,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        setError(response.data.message || "Không thể lưu thay đổi");
        return;
      }

      if (deleteMode && onDeleteAfterCleanup) {
        const deleted = await onDeleteAfterCleanup(itemId);
        if (!deleted) {
          return;
        }
      }

      if (onSaved) {
        onSaved();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {deleteMode ? "Xóa phân bổ dụng cụ khỏi phòng" : "Thay số lượng dụng cụ"}
            </h3>
            {item && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.name}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition text-xl leading-none">✕</button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tổng số lượng trong kho</label>
                <input
                  type="number"
                  min="0"
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(e.target.value)}
                  className="w-full md:w-60 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Danh sách phòng đang chứa dụng cụ</h4>
                {roomAllocations.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                    Hiện chưa có phòng nào chứa dụng cụ này. Bạn vẫn có thể thay đổi tổng số lượng trong kho.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {roomAllocations.map((allocation) => (
                      <div key={allocation.roomId} className="flex flex-col md:flex-row md:items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{allocation.roomName}</p>
                        </div>
                        <div>
                          <input
                            type="number"
                            min="0"
                            value={allocation.quantity}
                            onChange={(e) => handleAllocationChange(allocation.roomId, e.target.value)}
                            className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-gray-100 dark:bg-gray-700/60 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                <p>Tổng số lượng đang phân bổ cho phòng: <strong>{allocatedTotal}</strong></p>
                <p>Số lượng còn lại trong kho sau phân bổ: <strong className={remaining < 0 ? "text-red-500" : "text-emerald-500"}>{remaining}</strong></p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || saving}
            className={`px-4 py-2 rounded-lg text-white transition ${deleteMode ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-60`}
          >
            {saving ? "Đang xử lý..." : deleteMode ? "Lưu và xóa" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
