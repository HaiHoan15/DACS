import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";

/* ─── Equipment Picker Modal ─── */
function EquipmentPickerModal({ isOpen, editIndex, initialItemId, initialQty, warehouseItems, usedItemIds, getAvailability, onConfirm, onClose }) {
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("1");

  useEffect(() => {
    if (isOpen) {
      setItemId(initialItemId || "");
      setQty(String(initialQty ?? 1));
    }
  }, [isOpen, initialItemId, initialQty]);

  if (!isOpen) return null;

  const isEditing = editIndex >= 0;
  const availability = itemId ? getAvailability(Number(itemId), Number(qty || 0)) : null;

  const filteredItems = warehouseItems.filter((item) => {
    const isCurrentItem = String(item.id) === itemId;
    if (usedItemIds.includes(String(item.id)) && !isCurrentItem) return false;
    // Only show items that still have available stock (considering original allocation for edit mode)
    const available = getAvailability(Number(item.id), 0);
    if (!isCurrentItem && available && available.maxForThisRoom <= 0) return false;
    return true;
  });

  const handleConfirm = () => {
    if (!itemId) return;
    const quantity = Number(qty || 0);
    if (quantity < 0 || !Number.isInteger(quantity)) return;
    if (availability?.isExceeded) return;
    onConfirm({ itemId, quantity });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white">
          {isEditing ? "Chỉnh sửa dụng cụ" : "Thêm dụng cụ"}
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Dụng cụ</label>
          <select
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Chọn dụng cụ</option>
            {filteredItems.map((item) => {
              const avail = getAvailability(Number(item.id), 0);
              const remaining = avail ? avail.maxForThisRoom : Number(item.available_quantity ?? item.quantity);
              return (
                <option key={item.id} value={String(item.id)}>
                  {item.name} (còn {remaining})
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Số lượng</label>
          <input
            type="number"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {itemId && availability && (
          <p className={`text-sm ${availability.isExceeded ? "text-red-400" : "text-emerald-400"}`}>
            {availability.isExceeded
              ? `Đã hết hoặc vượt giới hạn. Kho chỉ còn ${Math.max(0, availability.maxForThisRoom)} cho phòng này.`
              : `Còn ${availability.remainingAfterSelection} dụng cụ có thể phân bổ thêm.`}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!itemId || availability?.isExceeded}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {isEditing ? "Cập nhật" : "Thêm"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Room Form ─── */
export default function RoomForm({ mode = "add" }) {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const isEdit = mode === "edit";

  const [warehouseItems, setWarehouseItems] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [equipments, setEquipments] = useState([]);
  const [originalEquipmentMap, setOriginalEquipmentMap] = useState({});

  const [equipmentModal, setEquipmentModal] = useState({
    isOpen: false,
    editIndex: -1,
    initialItemId: "",
    initialQty: 1,
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken") || "temp-token";
        const warehouseResponse = await api.get("WarehouseController.php", {
          params: { action: "getAll" },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (warehouseResponse.data.success) {
          setWarehouseItems(warehouseResponse.data.items || []);
        }

        if (isEdit && roomId) {
          const roomResponse = await api.get("RoomController.php", {
            params: { action: "getById", roomId },
            headers: { Authorization: `Bearer ${token}` },
          });

          if (roomResponse.data.success) {
            const room = roomResponse.data.room;
            setFormData({ name: room.name || "", description: room.description || "" });

            const currentEquipments = (room.equipments || []).map((eq) => ({
              itemId: String(eq.item_id),
              quantity: Number(eq.quantity) || 0,
            }));
            setEquipments(currentEquipments);

            const originalMap = {};
            (room.equipments || []).forEach((eq) => {
              originalMap[eq.item_id] = Number(eq.quantity) || 0;
            });
            setOriginalEquipmentMap(originalMap);
          } else {
            setNotification({ message: roomResponse.data.message || "Lỗi khi tải phòng", type: "error" });
          }
        }
      } catch (error) {
        setNotification({ message: error.response?.data?.message || "Lỗi kết nối server", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEdit, roomId]);

  const warehouseMap = useMemo(() => {
    const map = {};
    warehouseItems.forEach((item) => { map[item.id] = item; });
    return map;
  }, [warehouseItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getAvailability = (itemId, currentQty) => {
    if (!itemId || !warehouseMap[itemId]) return null;
    const item = warehouseMap[itemId];
    const originalQty = originalEquipmentMap[itemId] || 0;
    const maxForThisRoom = Number(item.quantity) - (Number(item.allocated_quantity) - originalQty);
    const remainingAfterSelection = maxForThisRoom - Number(currentQty || 0);
    return {
      name: item.name,
      maxForThisRoom,
      remainingAfterSelection,
      isExceeded: remainingAfterSelection < 0,
    };
  };

  /* ─── Modal helpers ─── */
  const openAddModal = () => {
    setEquipmentModal({ isOpen: true, editIndex: -1, initialItemId: "", initialQty: 1 });
  };

  const openEditModal = (index) => {
    const eq = equipments[index];
    setEquipmentModal({ isOpen: true, editIndex: index, initialItemId: eq.itemId, initialQty: eq.quantity });
  };

  const closeModal = () => {
    setEquipmentModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleModalConfirm = ({ itemId, quantity }) => {
    if (equipmentModal.editIndex >= 0) {
      setEquipments((prev) =>
        prev.map((eq, idx) => idx === equipmentModal.editIndex ? { itemId, quantity } : eq)
      );
    } else {
      setEquipments((prev) => [...prev, { itemId, quantity }]);
    }
    closeModal();
  };

  const handleRemoveEquipment = (index) => {
    setEquipments((prev) => prev.filter((_, idx) => idx !== index));
  };

  /* ─── Submit ─── */
  const validateForm = () => {
    if (!formData.name.trim()) {
      setNotification({ message: "Tên phòng không được để trống", type: "error" });
      return false;
    }
    const selectedIds = new Set();
    for (const eq of equipments) {
      if (!eq.itemId) continue;
      if (selectedIds.has(eq.itemId)) {
        setNotification({ message: "Mỗi dụng cụ chỉ nên xuất hiện một lần", type: "error" });
        return false;
      }
      selectedIds.add(eq.itemId);
      const quantity = Number(eq.quantity || 0);
      if (!Number.isInteger(quantity) || quantity < 0) {
        setNotification({ message: "Số lượng dụng cụ phải là số nguyên >= 0", type: "error" });
        return false;
      }
      const availability = getAvailability(Number(eq.itemId), quantity);
      if (availability?.isExceeded) {
        setNotification({
          message: `Dụng cụ "${availability.name}" chỉ còn ${Math.max(0, availability.maxForThisRoom)} trong kho`,
          type: "error",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      action: isEdit ? "update" : "add",
      ...(isEdit ? { roomId } : {}),
      name: formData.name.trim(),
      description: formData.description.trim(),
      equipments: equipments
        .filter((eq) => eq.itemId && Number(eq.quantity) > 0)
        .map((eq) => ({ itemId: Number(eq.itemId), quantity: Number(eq.quantity) })),
    };

    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken") || "temp-token";
      const response = await api.post("RoomController.php", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setNotification({
          message: response.data.message || (isEdit ? "Cập nhật phòng thành công" : "Thêm phòng thành công"),
          type: "success",
        });
        setTimeout(() => navigate("/admin/RoomManagement"), 1200);
      } else {
        setNotification({ message: response.data.message || "Lỗi khi lưu phòng", type: "error" });
      }
    } catch (error) {
      setNotification({ message: error.response?.data?.message || "Lỗi kết nối server", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400 py-12"><p>Đang tải dữ liệu...</p></div>;
  }

  /* ─── IDs already selected (excluding the one being edited) ─── */
  const usedItemIds = equipments
    .map((eq, idx) => (idx === equipmentModal.editIndex ? null : eq.itemId))
    .filter(Boolean);

  return (
    <>
      <EquipmentPickerModal
        isOpen={equipmentModal.isOpen}
        editIndex={equipmentModal.editIndex}
        initialItemId={equipmentModal.initialItemId}
        initialQty={equipmentModal.initialQty}
        warehouseItems={warehouseItems}
        usedItemIds={usedItemIds}
        getAvailability={getAvailability}
        onConfirm={handleModalConfirm}
        onClose={closeModal}
      />

      <div className="space-y-6">
        {notification && (
          <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
        )}

        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/admin/RoomManagement")} className="text-gray-400 hover:text-white transition">
            ← Quay lại
          </button>
          <h2 className="text-2xl font-bold text-white">
            {isEdit ? "Chỉnh sửa phòng tập" : "Thêm phòng tập"}
          </h2>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ID phòng</label>
                <input
                  type="text"
                  value={roomId}
                  disabled
                  className="w-full md:w-60 px-4 py-2 bg-gray-700 text-gray-400 rounded-lg border border-gray-600"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tên phòng *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ví dụ: Phòng Cardio"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Địa chỉ phòng</label>
              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ví dụ: Tầng 2, Khu A..."
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            {/* Equipment list */}
            <div className="border-t border-gray-700 pt-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Danh sách dụng cụ trong phòng</h3>
                  <p className="text-xs text-gray-400">Nhấn nút để thêm hoặc chỉnh sửa dụng cụ cho phòng này.</p>
                </div>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition"
                >
                  + Thêm dụng cụ
                </button>
              </div>

              {equipments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-600 px-4 py-6 text-sm text-gray-400 text-center">
                  Chưa có dụng cụ nào. Nhấn &quot;+ Thêm dụng cụ&quot; để bắt đầu.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-700 text-gray-200">
                      <tr>
                        <th className="px-4 py-3">Dụng cụ</th>
                        <th className="px-4 py-3 w-28">Số lượng</th>
                        <th className="px-4 py-3 w-32">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipments.map((eq, index) => {
                        const item = warehouseMap[eq.itemId];
                        const availability = getAvailability(Number(eq.itemId), Number(eq.quantity));
                        return (
                          <tr key={`${eq.itemId}-${index}`} className="border-t border-gray-700 text-gray-300">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item?.avatar ? `/uploads/warehouse/${item.avatar}` : "/images/error/product.png"}
                                  alt={item?.name}
                                  className="w-10 h-10 object-cover rounded"
                                  onError={(e) => { e.target.src = "/images/error/product.png"; }}
                                />
                                <div>
                                  <p className="font-medium text-gray-200">{item?.name || eq.itemId}</p>
                                  {availability && (
                                    <p className={`text-xs ${availability.isExceeded ? "text-red-400" : "text-emerald-400"}`}>
                                      {availability.isExceeded
                                        ? `Vượt giới hạn (tối đa ${Math.max(0, availability.maxForThisRoom)})`
                                        : `Còn lại ${availability.remainingAfterSelection} có thể phân bổ`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-yellow-400">{eq.quantity}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(index)}
                                  className="px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 text-xs transition"
                                >
                                  Sửa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEquipment(index)}
                                  className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs transition"
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg hover:from-red-700 hover:to-yellow-600 transition disabled:opacity-60"
              >
                {submitting ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Thêm phòng"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/RoomManagement")}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}