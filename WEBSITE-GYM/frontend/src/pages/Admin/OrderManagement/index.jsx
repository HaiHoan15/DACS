import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../../../components/Notification";
import Pagination2 from "../../../components/Pagination2";
import api from "../../../API/api";

export default function OrderManagement() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [searchEmail, setSearchEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  const statuses = [
    { value: "pending", label: "Chờ xử lý" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipped", label: "Đang giao" },
    { value: "delivered", label: "Đã giao" },
    { value: "cancelled", label: "Đã hủy" }
  ];

  const paymentMethods = [
    { value: "direct", label: "Thanh toán trực tiếp" },
    { value: "momo", label: "MOMO ATM" }
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("OrderController.php", {
        params: { action: "getAll" }
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
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-yellow-500',
      'confirmed': 'bg-blue-500',
      'shipped': 'bg-purple-500',
      'delivered': 'bg-green-500',
      'cancelled': 'bg-red-500'
    };
    return colorMap[status] || 'bg-gray-500/20';
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await api.post("OrderController.php",
        { orderId, status: newStatus },
        { params: { action: "updateStatus" } }
      );

      if (response.data.success) {
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        showNotification("Cập nhật trạng thái thành công", "success");
      } else {
        showNotification(response.data.message || "Cập nhật thất bại", "error");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showNotification("Lỗi khi cập nhật trạng thái", "error");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;

    try {
      const response = await api.post("OrderController.php",
        { orderId },
        { params: { action: "delete" } }
      );

      if (response.data.success) {
        setOrders(orders.filter(order => order.id !== orderId));
        showNotification("Xóa đơn hàng thành công", "success");
      } else {
        showNotification(response.data.message || "Xóa thất bại", "error");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      showNotification("Lỗi khi xóa đơn hàng", "error");
    }
  };

  const filteredOrders = orders.filter(order => {
    // Filter by status
    const statusMatch = statusFilter === "all" || order.status === statusFilter;
    
    // Filter by payment method
    const paymentMatch = paymentMethodFilter === "all" || order.payment_method === paymentMethodFilter;
    
    // Filter by email search (case-insensitive)
    const emailMatch = order.email?.toLowerCase().includes(searchEmail.toLowerCase()) || false;
    
    return statusMatch && paymentMatch && emailMatch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentMethodFilter, searchEmail]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const currentOrders = filteredOrders.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 items-center justify-center">
        <p className="text-gray-400">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          <span className="text-red-500">QUẢN LÝ</span>
          <span className="text-yellow-500 ml-2">ĐƠN HÀNG</span>
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Theo dõi, cập nhật trạng thái và xử lý các đơn hàng của khách hàng.
        </p>

        {/* Filter Section */}
        <div className="mb-6 space-y-4 bg-gray-800 rounded-xl border border-gray-700 p-4">
          {/* Search by Email */}
          <div>
            <label className="block text-gray-300 font-semibold mb-2">
              Tìm kiếm theo email:
            </label>
            <input
              type="text"
              placeholder="Nhập email người dùng..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status and Payment Method Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-2">
                Lọc theo trạng thái:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-2">
                Lọc theo phương thức thanh toán:
              </label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto bg-gray-800 rounded-xl border border-gray-700 shadow">
          {filteredOrders.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-700 border-b-2 border-gray-600">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tổng tiền</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Phương thức thanh toán</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ngày tạo</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wide text-gray-300 text-xs">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-semibold text-white">#{order.id}</td>
                    <td className="px-6 py-4 text-gray-300">{order.email}</td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {(parseFloat(order.total_amount) || 0).toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-bold text-white border border-white/10 cursor-pointer ${getStatusColor(order.status)}`}
                      >
                        {statuses.map(status => (
                          <option key={status.value} value={status.value} className="bg-white text-gray-900 font-semibold">
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {order.payment_method === 'direct' ? 'Thanh toán trực tiếp' : 'MOMO ATM'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/OrderManagement/dashboard/detail/${order.id}`)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium text-sm transition"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded font-medium text-sm transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-400">
              Không có đơn hàng nào
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination2
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
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