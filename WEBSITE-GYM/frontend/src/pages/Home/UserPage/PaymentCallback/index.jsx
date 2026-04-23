import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../../API/api";

export default function PaymentCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Đang xử lý thanh toán...");
  const [messageType, setMessageType] = useState("loading"); // loading, success, error, warning

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const query = new URLSearchParams(location.search);
        const resultCode = query.get("resultCode");
        const orderId = query.get("orderId");

        if (!orderId) {
          setMessage("Không tìm thấy đơn hàng");
          setMessageType("error");
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
            setMessage("Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.");
            setMessageType("success");
          } else {
            setMessage("Lỗi cập nhật trạng thái đơn hàng");
            setMessageType("warning");
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
            setMessage("Thanh toán bị hủy. Đơn hàng đã được xóa.");
            setMessageType("error");
          } else {
            setMessage("Không thể xóa đơn hàng");
            setMessageType("warning");
          }
          // Clear pending order flag - order was deleted by PaymentCallback
          sessionStorage.removeItem("pendingMomoOrderId");
        }
      } catch (err) {
        console.error("Payment callback error:", err);
        setMessage("Lỗi xử lý thanh toán");
        setMessageType("error");
      } finally {
        setLoading(false);
        setTimeout(() => navigate("/user?tab=order"), 2000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "20px",
    padding: "60px 40px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    maxWidth: "500px",
    width: "100%",
    animation: "slideUp 0.5s ease-out",
  };

  const spinnerStyle = {
    width: "80px",
    height: "80px",
    margin: "0 auto 30px",
    border: "4px solid #f0f0f0",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  const iconStyle = {
    fontSize: "80px",
    marginBottom: "20px",
    animation: messageType === "success" ? "bounce 0.6s ease-in-out" : "none",
  };

  const messageStyle = {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "20px",
    color: messageType === "success" ? "#10b981" : messageType === "error" ? "#ef4444" : "#f59e0b",
  };

  const detailStyle = {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "20px",
    lineHeight: "1.6",
  };

  const countdownStyle = {
    fontSize: "13px",
    color: "#9ca3af",
    marginTop: "15px",
    fontStyle: "italic",
  };

  const styleSheet = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `;

  return (
    <>
      <style>{styleSheet}</style>
      <div style={containerStyle}>
        <div style={cardStyle}>
          {loading ? (
            <>
              <div style={spinnerStyle}></div>
              <h1 style={{ fontSize: "28px", color: "#1f2937", margin: "0 0 10px 0" }}>
                Đang xử lý...
              </h1>
              <p style={detailStyle}>Vui lòng chờ trong khi chúng tôi xác nhận thanh toán của bạn</p>
            </>
          ) : (
            <>
              <div style={iconStyle}>
                {messageType === "success" && "✓"}
                {messageType === "error" && "✕"}
                {messageType === "warning" && "⚠"}
              </div>
              <h2 style={messageStyle}>{message}</h2>
              <p style={countdownStyle}>Chuyển hướng về trang đơn hàng trong 2 giây...</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}