import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../../API/api";

export default function PaymentCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Đang xử lý thanh toán...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const query = new URLSearchParams(location.search);
        const resultCode = query.get("resultCode");
        const orderId = query.get("orderId");

        if (!orderId) {
          setMessage("❌ Lỗi: Không tìm thấy đơn hàng");
          setLoading(false);
          setTimeout(() => navigate("/user?tab=order"), 2000);
          return;
        }

        // resultCode="0" means success, anything else means failure/cancel
        if (resultCode === "0") {
          // Update order status to "confirmed"
          const response = await api.post(
            "OrderController.php",
            { orderId: parseInt(orderId), status: "confirmed" },
            { params: { action: "updateStatus" } }
          );

          if (response.data?.success) {
            setMessage("✅ Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.");
          } else {
            setMessage("⚠️ Lỗi cập nhật trạng thái đơn hàng");
          }
          // Clear pending order flag - user successfully completed payment
          sessionStorage.removeItem("pendingMomoOrderId");
        } else {
          // Payment failed, canceled, or resultCode missing - delete the order
          const response = await api.post(
            "OrderController.php",
            { orderId: parseInt(orderId) },
            { params: { action: "delete" } }
          );

          if (response.data?.success) {
            setMessage("❌ Thanh toán bị hủy. Đơn hàng đã được xóa.");
          } else {
            setMessage("⚠️ Không thể xóa đơn hàng");
          }
          // Clear pending order flag - order was deleted by PaymentCallback
          sessionStorage.removeItem("pendingMomoOrderId");
        }
      } catch (err) {
        console.error("Payment callback error:", err);
        setMessage("❌ Lỗi xử lý thanh toán");
      } finally {
        setLoading(false);
        setTimeout(() => navigate("/user?tab=order"), 2000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div style={{ padding: 50, textAlign: "center", minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {loading ? (
        <h1>⏳ Đang xử lý...</h1>
      ) : (
        <h2>{message}</h2>
      )}
      <p style={{ marginTop: 20, color: "#666" }}>Sẽ quay về trang đơn hàng trong 2 giây...</p>
    </div>
  );
}