import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ConfirmDialog from "../../../../../components/ConfirmDialog";
import Notification from "../../../../../components/Notification";
import api, { apiGateway } from "../../../../../API/api";

export default function UserPay({ isOpen, onClose, cartItems, userInfo, onPaymentSuccess }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [formData, setFormData] = useState({
    recipient_name: "",
    recipient_phone: "",
    recipient_address: "",
    payment_method: "direct" 
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Khởi tạo dữ liệu từ userInfo khi modal mở
  useEffect(() => {
    if (userInfo && isOpen) {
      setFormData(prev => ({
        ...prev,
        recipient_name: userInfo.username || "",
        recipient_phone: userInfo.phone || "",
        recipient_address: userInfo.address || ""
      }));
    }
  }, [userInfo, isOpen]);

  // Cleanup pending order when component unmounts (if user navigated away)
  useEffect(() => {
    return () => {
      // When component unmounts and there's still a pending order in sessionStorage
      // it means user either closed the page or navigated away without completing payment
      const pendingId = sessionStorage.getItem("pendingMomoOrderId");
      
      if (pendingId) {
        console.log("🗑️ UserPay component unmounting with pending order, cleaning up:", pendingId);
        // Use fetch with keepalive to ensure request completes even if page unloads
        api.post(
          "OrderController.php",
          { orderId: parseInt(pendingId) },
          { params: { action: "delete" }, timeout: 5000 }
        ).then(() => {
          sessionStorage.removeItem("pendingMomoOrderId");
        }).catch(err => {
          console.error("❌ Error in cleanup on unmount:", err);
        });
      }
    }; 
  }, []);

  // Handle modal close - delete pending order if not completed
  // When user closes modal without completing MoMo payment
  const handleClose = async () => {
    const pendingId = sessionStorage.getItem("pendingMomoOrderId");
    
    if (pendingId) {
      console.log("🗑️ User closed payment modal without completing, deleting order:", pendingId);
      try {
        await api.post(
          "OrderController.php",
          { orderId: parseInt(pendingId) },
          { params: { action: "delete" } }
        );
        console.log("✅ Deleted pending order on modal close");
      } catch (err) {
        console.error("❌ Error deleting pending order on close:", err);
      }
      sessionStorage.removeItem("pendingMomoOrderId");
    }
    
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      payment_method: method
    }));
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const handlePaymentClick = () => {
    // Validate form
    if (!formData.recipient_name.trim() || !formData.recipient_phone.trim() || !formData.recipient_address.trim()) {
      showNotification("Vui lòng điền đầy đủ thông tin giao hàng", "error");
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmPayment = async () => {
  setIsProcessing(true);

  try {
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Nếu chọn MoMo
    if (formData.payment_method === "momo") {
      const response = await apiGateway.post("momo.php", {
        amount: totalAmount,
        userId: user?.id,
        cartItems: cartItems,
        address: formData.recipient_address,
        phone: formData.recipient_phone,
        name: formData.recipient_name
      });

      const data = response.data;

      console.log("MoMo:", data);

      if (data.payUrl && data.orderId) {
        // Store orderId in sessionStorage only
        // This will be cleared when user completes payment in PaymentCallback
        sessionStorage.setItem("pendingMomoOrderId", data.orderId.toString());
        console.log("🔗 Redirecting to MoMo with orderId:", data.orderId);
        window.location.href = data.payUrl;
        return;
      } else {
        showNotification("Không tạo được link MoMo", "error");
      }
    }

    //  COD 
    const paymentData = {
      accountId: user?.id || 1,
      totalAmount: totalAmount,
      paymentMethod: formData.payment_method,
      recipientName: formData.recipient_name,
      recipientPhone: formData.recipient_phone,
      recipientAddress: formData.recipient_address,
      notes: "",
      cartItems: cartItems,
    };

    const response = await api.post("OrderController.php",
      paymentData,
      { params: { action: "create" } }
    );

    if (response.data.success) {
      showNotification("Thanh toán thành công!", "success");

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }

      setTimeout(() => {
        onClose();
        navigate("/user?tab=order");
      }, 2000);
    } else {
      showNotification("Thanh toán thất bại", "error");
    }

  } catch (err) {
    console.error(err);
    showNotification("Lỗi thanh toán", "error");
  } finally {
    setIsProcessing(false);
  }
};

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center sticky top-0">
          <h2 className="text-2xl font-bold">Thông tin thanh toán</h2>
          <button
            onClick={handleClose}
            className="text-2xl hover:bg-blue-800 p-2 rounded transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Phần 1: Thông tin giao hàng */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin giao hàng</h3>
            
            <div className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={userInfo?.email || ""}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>

              {/* Tên người nhận */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="recipient_name"
                  value={formData.recipient_name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên người nhận"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="recipient_phone"
                  value={formData.recipient_phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ giao hàng <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="recipient_address"
                  value={formData.recipient_address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ giao hàng"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Phần 2: Phương thức thanh toán */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Phương thức thanh toán</h3>
            
            <div className="space-y-3">
              {/* Trực tiếp */}
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition"
                style={{
                  borderColor: formData.payment_method === "direct" ? "#2563eb" : "#d1d5db",
                  backgroundColor: formData.payment_method === "direct" ? "#eff6ff" : "#fff"
                }}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="direct"
                  checked={formData.payment_method === "direct"}
                  onChange={() => handlePaymentMethodChange("direct")}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="ml-4">
                  <span className="font-semibold text-gray-900">Thanh toán trực tiếp</span>
                  <p className="text-sm text-gray-500">Thanh toán khi nhận hàng</p>
                </div>
              </label>
              {/* MOMO */}
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition"
                style={{
                  borderColor: formData.payment_method === "momo" ? "#2563eb" : "#d1d5db",
                  backgroundColor: formData.payment_method === "momo" ? "#eff6ff" : "#fff"
                }}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="momo"
                  checked={formData.payment_method === "momo"}
                  onChange={() => handlePaymentMethodChange("momo")}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="ml-4">
                  <span className="font-semibold text-gray-900">Thanh toán MoMo</span>
                  <p className="text-sm text-gray-500">Thanh toán qua ví điện tử MoMo</p>
                </div>
              </label>
            </div>
          </div>

          {/* Phần 3: Chi tiết đơn hàng */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Chi tiết đơn hàng</h3>
            
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-6 py-3 font-semibold text-gray-700">Tên sản phẩm</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Giá</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Số lượng</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900">{item.name}</td>
                      <td className="px-6 py-3 text-gray-700">{(parseFloat(item.price) || 0).toLocaleString('vi-VN')} VND</td>
                      <td className="px-6 py-3 text-gray-700">{item.quantity}</td>
                      <td className="px-6 py-3 text-gray-900 font-semibold text-right">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phần 4: Tổng tiền và nút thanh toán */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-6 rounded-lg gap-4">
            <div>
              <p className="text-gray-600 mb-2">Tổng giá đơn hàng:</p>
              <p className="text-4xl font-bold text-green-600">
                {totalAmount.toLocaleString('vi-VN')} VND
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleClose}
                className="flex-1 md:flex-none px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handlePaymentClick}
                className="flex-1 md:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Tiến hành thanh toán
              </button>
            </div>
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Xác nhận thanh toán"
        message={formData.payment_method === "momo" 
          ? "Xác nhận thanh toán MoMo?" 
          : "Xác nhận thanh toán trực tiếp?"}
        onConfirm={handleConfirmPayment}
        onCancel={() => setShowConfirmDialog(false)}
        confirmText="OK"
        cancelText="Hủy"
        isLoading={isProcessing}
      />
    </div>
  );
}
