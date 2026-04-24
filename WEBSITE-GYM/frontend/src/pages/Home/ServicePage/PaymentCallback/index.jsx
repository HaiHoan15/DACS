import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../../API/api";

export default function ServicePaymentCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading]         = useState(true);
  const [message, setMessage]         = useState("Đang xác nhận đăng ký dịch vụ...");
  const [messageType, setMessageType] = useState("loading"); // loading | success | error | warning

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        const query      = new URLSearchParams(location.search);
        const resultCode = query.get("resultCode");
        const userId     = query.get("userId")    || sessionStorage.getItem("pendingMomoUserId");
        const packageId  = query.get("packageId") || sessionStorage.getItem("pendingMomoPackageId");

        if (!userId || !packageId) {
          if (mounted) {
            setMessage("Không tìm thấy thông tin đăng ký dịch vụ.");
            setMessageType("error");
            setLoading(false);
          }
          setTimeout(() => { if (mounted) navigate("/service"); }, 2500);
          return;
        }

        if (resultCode === "0") {
          // Thanh toán thành công → ghi DB active
          const res = await api.post(
            "ServiceController.php",
            {
              userId: parseInt(userId),
              packageId: parseInt(packageId),
              source: "user_purchase",
              paymentMethod: "momo",
            },
            { params: { action: "createActive" } }
          );

          if (mounted) {
            if (res.data?.success) {
              setMessage("Đăng ký thành công! Gói dịch vụ của bạn đã được kích hoạt.");
              setMessageType("success");
            } else {
              setMessage("Thanh toán xong nhưng không thể kích hoạt gói. Vui lòng liên hệ hỗ trợ.");
              setMessageType("warning");
            }
          }
        } else {
          // Hủy hoặc lỗi → không ghi DB gì cả
          if (mounted) {
            setMessage("Thanh toán bị hủy. Gói dịch vụ chưa được đăng ký.");
            setMessageType("error");
          }
        }
      } catch (err) {
        console.error("ServicePaymentCallback error:", err);
        if (mounted) {
          setMessage("Lỗi xử lý. Vui lòng thử lại sau.");
          setMessageType("error");
        }
      } finally {
        sessionStorage.removeItem("pendingMomoUserId");
        sessionStorage.removeItem("pendingMomoPackageId");
        if (mounted) setLoading(false);
        setTimeout(() => { if (mounted) navigate("/service"); }, 2500);
      }
    };

    handleCallback();
    return () => { mounted = false; };
  }, [location, navigate]);

  // ─── Styles (inline, mirrors the order PaymentCallback) ───────────────────

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    padding: "20px",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "20px",
    padding: "60px 40px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
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
    borderTop: "4px solid #7c3aed",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  const iconStyle = {
    fontSize: "80px",
    marginBottom: "20px",
    animation: messageType === "success" ? "bounce 0.6s ease-in-out" : "none",
  };

  const messageStyle = {
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "20px",
    color:
      messageType === "success"
        ? "#10b981"
        : messageType === "error"
        ? "#ef4444"
        : "#f59e0b",
  };

  const subStyle = {
    fontSize: "13px",
    color: "#9ca3af",
    marginTop: "15px",
    fontStyle: "italic",
  };

  const stylesheet = `
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
    @keyframes bounce  { 0%,100%{transform:scale(1);} 50%{transform:scale(1.1);} }
  `;

  return (
    <>
      <style>{stylesheet}</style>
      <div style={containerStyle}>
        <div style={cardStyle}>
          {loading ? (
            <>
              <div style={spinnerStyle} />
              <h1 style={{ fontSize: "26px", color: "#1f2937", margin: "0 0 10px" }}>
                Đang xử lý...
              </h1>
              <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6" }}>
                Vui lòng đợi trong khi chúng tôi kích hoạt gói dịch vụ của bạn.
              </p>
            </>
          ) : (
            <>
              <div style={iconStyle}>
                {messageType === "success" && "✓"}
                {messageType === "error"   && "✕"}
                {messageType === "warning" && "⚠"}
              </div>
              <h2 style={messageStyle}>{message}</h2>
              <p style={subStyle}>Chuyển về trang dịch vụ trong 2 giây...</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
