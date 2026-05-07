import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Pagination from "../../../../components/Pagination";
import Notification from "../../../../components/Notification";
import api from "../../../../API/api";

export default function UserOrder() {
  const user = useSelector((state) => state.auth.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateSearch, setDateSearch] = useState("");

  const itemsPerPage = 4;

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

  const getPaymentMethodLabel = (paymentMethod) => {
    return paymentMethod === 'direct' ? 'Trực tiếp' : 'MOMO ATM';
  };

  const matchesDateSearch = (orderDate, searchText) => {
    if (!searchText) return true;
    if (!orderDate) return false;

    const query = searchText.trim().toLowerCase();
    if (!query) return true;

    const dateObj = new Date(orderDate);
    if (Number.isNaN(dateObj.getTime())) {
      return String(orderDate).toLowerCase().includes(query);
    }

    const day = String(dateObj.getDate());
    const month = String(dateObj.getMonth() + 1);
    const year = String(dateObj.getFullYear());
    const viDate = `${day}/${month}/${year}`;
    const monthYear = `${month}/${year}`;
    const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    return (
      viDate.includes(query) ||
      monthYear.includes(query) ||
      year.includes(query) ||
      isoDate.includes(query)
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchPayment = selectedPaymentMethod === "all" || order.payment_method === selectedPaymentMethod;
    const matchStatus = selectedStatus === "all" || order.status === selectedStatus;
    const matchDate = matchesDateSearch(order.created_at, dateSearch);

    return matchPayment && matchStatus && matchDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedOrderId(null);
  }, [selectedPaymentMethod, selectedStatus, dateSearch]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    <div className="min-h-screen flex flex-col bg-gray-50 rounded-xl">
      <div className="w-full max-w-7xl mx-auto px-4 py-8 flex-grow">
        <div className="mb-6 flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="Tìm theo ngày/tháng/năm... (vd: 23/4/2026, 4/2026, 2026)"
            value={dateSearch}
            onChange={(e) => setDateSearch(e.target.value)}
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
          >
            <option value="all">Tất cả phương thức</option>
            <option value="direct">Thanh toán trực tiếp</option>
            <option value="momo">MOMO ATM</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipped">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 space-y-4">
      {currentOrders.length > 0 ? (
        currentOrders.map((order) => (
        <div key={order.id} className="bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
          {/* Order Header */}
          <button
            onClick={() => toggleOrderExpand(order.id)}
            className="w-full p-6 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 items-center hover:bg-gray-100 transition bg-gray-50"
          >
            <div className="text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                  <p className="text-gray-500 text-sm">Thanh toán</p>
                  <p className="text-blue-600 font-bold text-lg">
                    {getPaymentMethodLabel(order.payment_method)}
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
            <div className={`text-gray-700 text-2xl transition transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`}>
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
                      {getPaymentMethodLabel(order.payment_method)}
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
      ))
      ) : (
        <div className="py-10 text-center">
          <p className="text-gray-500 text-lg">Không tìm thấy đơn hàng phù hợp với bộ lọc</p>
        </div>
      )}
          </div>
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              setExpandedOrderId(null);
            }}
          />
        )}

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      </div>
    </div>
  );
}
