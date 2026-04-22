import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function PaymentCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const status = query.get("status");

  useEffect(() => {
    // MoMo callback: status=success is payment successful
    if (status === "success") {
      alert("Thanh toán thành công ✅");
    } else {
      alert("Thanh toán thất bại ❌");
    }

    // redirect sau 2s
    setTimeout(() => {
      navigate("/user?tab=order");
    }, 2000);

  }, [location, navigate, status]);

  return (
    <div style={{ padding: 50, textAlign: "center" }}>
      <h1>Đang xử lý thanh toán...</h1>
    </div>
  );
}