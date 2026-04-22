import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Pagination from "../../../../components/Pagination2";
import Notification from "../../../../components/Notification";
import UserPay from "./UserPay";
import api from "../../../../API/api";

export default function UserWishlist() {
  const user = useSelector((state) => state.auth.user);
  const [cartItems, setCartItems] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const itemsPerPage = 5; // Số sản phẩm hiển thị mỗi trang

  // Lọc sản phẩm dựa trên search và category
  const filteredItems = cartItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === "all" || item.category_name === selectedCategory;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (user?.id) {
      fetchCartItems();
      fetchUserInfo();
    }
  }, [user?.id]);

  // Refetch user info khi mở payment modal để đảm bảo dữ liệu mới
  useEffect(() => {
    if (isPaymentOpen) {
      fetchUserInfo();
    }
  }, [isPaymentOpen]);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("authToken") || "temp-token";
      const response = await api.get("UserController.php", {
        params: { action: "getUser", userId: user?.id || 1 },
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.data.success) {
        setUserInfo(response.data.user || {});
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await api.get("WishlistController.php", {
        params: { action: "getAll", userId: user?.id || 1 }
      });

      if (response.data.success) {
        const items = response.data.items || [];
        console.log("Wishlist items:", items);
        setCartItems(items);
      } else {
        showNotification(response.data.message || "Lỗi khi tải giỏ hàng", "error");
      }
    } catch (err) {
      console.error("Error fetching cart items:", err);
      showNotification("Lỗi kết nối server", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await api.post("WishlistController.php",
        { wishlistId: id, quantity: newQuantity },
        { params: { action: "updateQuantity" } }
      );

      if (response.data.success) {
        setCartItems(cartItems.map(item =>
          item.wishlist_id === id ? { ...item, quantity: newQuantity } : item
        ));
        showNotification("Cập nhật số lượng thành công", "success");
      } else {
        showNotification(response.data.message || "Cập nhật thất bại", "error");
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      showNotification("Lỗi khi cập nhật số lượng", "error");
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      const response = await api.post("WishlistController.php",
        { wishlistId: id },
        { params: { action: "delete" } }
      );

      if (response.data.success) {
        setCartItems(cartItems.filter(item => item.wishlist_id !== id));
        showNotification("Đã xóa sản phẩm khỏi giỏ hàng", "success");
      } else {
        showNotification(response.data.message || "Xóa thất bại", "error");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      showNotification("Lỗi khi xóa sản phẩm", "error");
    }
  };

  const handlePaymentSuccess = async () => {
    // Clear all items from wishlist
    setCartItems([]);
    setIsPaymentOpen(false);
  };

  const overallTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-lg text-gray-600">Giỏ hàng của bạn đang trống</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Giỏ hàng của bạn</h1>

        {/* Filter Section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Category Filter Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-7 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
          >
            <option value="all">Tất cả</option>
            {Array.from(new Set(cartItems.map(item => item.category_name))).map(category => (
              <option key={category} value={category}>{category || "Không rõ"}</option>
            ))}
          </select>
        </div>

        {/* Cart Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {currentItems.length > 0 ? (
            <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 font-semibold text-gray-700">Hình ảnh</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Tên sản phẩm</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Giá</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Số lượng</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Thành tiền</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.wishlist_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img
                      src={item.avatar?.startsWith('http') ? item.avatar : item.avatar ? `/uploads/products/${item.avatar}` : "/images/error/product.png"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => { e.target.src = "/images/error/product.png"; }}
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-gray-700">{(parseFloat(item.price) || 0).toLocaleString('vi-VN')} VND</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item.wishlist_id, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemoveItem(item.wishlist_id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded font-medium text-sm transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp với bộ lọc</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Checkout Section */}
        {filteredItems.length > 0 && (
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center bg-white rounded-lg shadow p-6 gap-4">
          <div className="md:w-1/2">
            <p className="font-bold text-gray-600 mb-2">Tổng giá đơn hàng:</p>
            <p className="text-4xl font-bold text-green-600"> {(overallTotal).toLocaleString('vi-VN')} VND</p>
          </div>
          <div className="md:w-1/2 flex justify-end">
            <button
              onClick={() => setIsPaymentOpen(true)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              Tiến hành thanh toán
            </button>
          </div>
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

      {/* Payment Modal */}
      <UserPay 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)}
        cartItems={cartItems}
        userInfo={userInfo}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}