import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Notification from "../../../../components/Notification";
import api from "../../../../API/api";

export default function UserOrder() {
  const user = useSelector((state) => state.auth.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("OrderController.php", {
        params: { action: "getByUser", accountId: user?.id || 1 }
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        showNotification(response.data.message || "Lỗi khi tải đơn hàng", "error");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      showNotification("Lỗi kết nối server", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'shipped': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
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
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500 text-lg">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
          {/* Order Header */}
          <button
            onClick={() => toggleOrderExpand(order.id)}
            className="w-full p-6 flex justify-between items-center hover:bg-gray-150 transition bg-gray-50"
          >
            <div className="flex-grow text-left">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <p className="text-gray-500 text-sm">Mã đơn hàng</p>
                  <p className="text-gray-900 font-bold text-lg">#{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Tổng cộng</p>
                  <p className="text-green-600 font-bold text-lg">
                    {(parseFloat(order.total_amount) || 0).toLocaleString('vi-VN')} VND
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Phương thức thanh toán</p>
                  <p className="text-blue-600 font-bold text-lg">
                    {order.payment_method === 'direct' ? 'Thanh toán trực tiếp' : 'MOMO ATM'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Trạng thái</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Ngày tạo</p>
                  <p className="text-gray-900 font-semibold">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>

              </div>
            </div>
            <div className={`text-gray-700 ml-4 text-2xl transition transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>

          {/* Order Details */}
          {expandedOrderId === order.id && (
            <div className="border-t border-gray-300 p-6 bg-white">
              <div className="mb-6 pb-6 border-b border-gray-300">
                <h4 className="text-gray-900 font-bold text-lg mb-4">Thông tin giao hàng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="text-gray-900 font-semibold">{order.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Người nhận</p>
                    <p className="text-gray-900 font-semibold">{order.recipient_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Số điện thoại</p>
                    <p className="text-gray-900 font-semibold">{order.recipient_phone}</p>
                  </div>
                  <div >
                    <p className="text-gray-500">Địa chỉ giao hàng</p>
                    <p className="text-gray-900 font-semibold">{order.recipient_address}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phương thức thanh toán</p>
                    <p className="text-gray-900 font-semibold">
                      {order.payment_method === 'direct' ? 'Thanh toán trực tiếp' : 'MOMO ATM'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-gray-900 font-bold text-lg mb-4">Chi tiết sản phẩm</h4>
                {order.items && order.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">Sản phẩm</th>
                          <th className="px-4 py-2 text-center text-gray-700 font-semibold">Số lượng</th>
                          <th className="px-4 py-2 text-right text-gray-700 font-semibold">Giá</th>
                          <th className="px-4 py-2 text-right text-gray-700 font-semibold">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-900">{item.product_name}</td>
                            <td className="px-4 py-3 text-center text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-gray-900">
                              {(parseFloat(item.price) || 0).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-4 py-3 text-right text-green-600 font-semibold">
                              {(parseFloat(item.subtotal) || 0).toLocaleString('vi-VN')} VND
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">Không có sản phẩm trong đơn hàng này</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

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
