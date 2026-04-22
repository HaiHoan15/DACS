import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Notification from "../../../../components/Notification";
import api from "../../../../API/api";

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statuses = [
    { value: "pending", label: "Chờ xử lý" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipped", label: "Đang giao" },
    { value: "delivered", label: "Đã giao" },
    { value: "cancelled", label: "Đã hủy" }
  ];

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("OrderController.php", {
        params: { action: "get", orderId: orderId }
      });

      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        showNotification(response.data.message || "Lỗi khi tải đơn hàng", "error");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      showNotification("Lỗi kết nối server", "error");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await api.post("OrderController.php",
        { orderId: parseInt(orderId), status: newStatus },
        { params: { action: "updateStatus" } }
      );

      if (response.data.success) {
        setOrder({ ...order, status: newStatus });
        showNotification("Cập nhật trạng thái thành công", "success");
      } else {
        showNotification(response.data.message || "Cập nhật thất bại", "error");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showNotification("Lỗi khi cập nhật trạng thái", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 text-lg mb-4">Không tìm thấy đơn hàng</p>
        <button
          onClick={() => navigate("/admin/OrderManagement")}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/OrderManagement")}
            className="text-blue-500 hover:text-blue-600 font-medium mb-4"
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Chi tiết đơn hàng #{order.id}
          </h1>
        </div>

        {/* Order Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Email</p>
              <p className="text-gray-900 dark:text-white font-semibold text-lg">{order.email}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Tổng tiền</p>
              <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                {(parseFloat(order.total_amount) || 0).toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ngày tạo</p>
              <p className="text-gray-900 dark:text-white font-semibold">
                {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Trạng thái</p>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className={`px-3 py-1 rounded-full text-sm font-semibold border-0 cursor-pointer ${getStatusColor(order.status)}`}
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Thông tin giao hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Người nhận</p>
                <p className="text-gray-900 dark:text-white font-semibold">{order.recipient_name}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Số điện thoại</p>
                <p className="text-gray-900 dark:text-white font-semibold">{order.recipient_phone}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-500 dark:text-gray-400">Địa chỉ giao hàng</p>
                <p className="text-gray-900 dark:text-white font-semibold">{order.recipient_address}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Phương thức thanh toán</p>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {order.payment_method === 'direct' ? 'Thanh toán trực tiếp' : 'MOMO ATM'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Danh sách sản phẩm</h3>
          </div>

          {order.items && order.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Sản phẩm</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">Số lượng</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 text-right">Giá</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{item.product_name}</td>
                      <td className="px-6 py-4 text-center text-gray-900 dark:text-gray-100">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-gray-100">
                        {(parseFloat(item.price) || 0).toLocaleString('vi-VN')} VND
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">
                        {(parseFloat(item.subtotal) || 0).toLocaleString('vi-VN')} VND
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Không có sản phẩm trong đơn hàng này
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
