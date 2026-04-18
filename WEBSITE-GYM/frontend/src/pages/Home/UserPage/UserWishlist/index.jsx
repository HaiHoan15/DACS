import React, { useState, useEffect } from "react";
import Pagination from "../../../../components/Pagination";
import Notification from "../../../../components/Notification";
import api from "../../../../API/api";

export default function UserWishlist() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  
  const itemsPerPage = 8;
  const totalPages = Math.ceil(cartItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = cartItems.slice(startIndex, endIndex);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      // TODO: Thay đổi endpoint này khi có API giỏ hàng thực
      const mockData = [
        { id: 1, name: "Tạ đơn 10kg", category: "Tạ", price: 150000, avatar: "/uploads/products/ta-don-1.jpg", quantity: 1 },
        { id: 2, name: "Thanh tạ 1.5m", category: "Thanh tạ", price: 200000, avatar: "/uploads/products/thanh-ta-1.jpg", quantity: 2 },
        { id: 3, name: "Dây kéo lò xo", category: "Phụ kiện", price: 80000, avatar: "/uploads/products/day-keo-1.jpg", quantity: 1 },
        { id: 4, name: "Thảm tập yoga", category: "Thảm", price: 250000, avatar: "/uploads/products/tham-yoga-1.jpg", quantity: 1 },
        { id: 5, name: "Tạ đơn 20kg", category: "Tạ", price: 300000, avatar: "/uploads/products/ta-don-2.jpg", quantity: 1 },
        { id: 6, name: "Giàn kéo xà đơn", category: "Thiết bị", price: 500000, avatar: "/uploads/products/gian-keo-1.jpg", quantity: 1 },
        { id: 7, name: "Thắt lưng tập gym", category: "Phụ kiện", price: 120000, avatar: "/uploads/products/that-lung-1.jpg", quantity: 1 },
        { id: 8, name: "Bao cát tập đấm", category: "Thiết bị", price: 400000, avatar: "/uploads/products/bao-cat-1.jpg", quantity: 1 },
        { id: 9, name: "Dây nhảy thể lực", category: "Phụ kiện", price: 90000, avatar: "/uploads/products/day-nhay-1.jpg", quantity: 1 },
        { id: 10, name: "Tạ đơn 5kg", category: "Tạ", price: 100000, avatar: "/uploads/products/ta-don-3.jpg", quantity: 1 },
      ];
      setCartItems(mockData);
    } catch (_err) {
      // eslint-disable-next-line no-unused-vars
      showNotification("Lỗi khi tải giỏ hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    showNotification("Đã xóa sản phẩm khỏi giỏ hàng", "success");
  };

  const totalPrice = currentItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

        {/* Cart Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Hình ảnh</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Tên sản phẩm</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Thể loại</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Giá</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Số lượng</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Thành tiền</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700 font-medium">{item.id}</td>
                  <td className="px-6 py-4">
                    <img 
                      src={item.avatar} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => { e.target.src = "/images/error/product.png"; }}
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-gray-600">{item.category}</td>
                  <td className="px-6 py-4 text-gray-700">{item.price.toLocaleString('vi-VN')}đ</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-sm"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded font-medium text-sm transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center bg-white rounded-lg shadow p-6 gap-4">
          <div className="md:w-1/2">
            <p className="text-gray-600 mb-2">Tổng giá tiền (trang hiện tại):</p>
            <p className="text-4xl font-bold text-red-600">{totalPrice.toLocaleString('vi-VN')}đ</p>
            <p className="text-sm text-gray-500 mt-2">Tổng cộng tất cả sản phẩm: {(overallTotal).toLocaleString('vi-VN')}đ</p>
          </div>
          <div className="md:w-1/2 flex justify-end">
            <button 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              Tiến hành thanh toán
            </button>
          </div>
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
