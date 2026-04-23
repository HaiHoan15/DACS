import { useState } from "react";
import { apiGateway } from "../../../../API/api";
import "./ServicePay.css";

export default function ServicePay({ isOpen, onClose, plan, userInfo, activeService }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !plan) return null;

  const priceNum = parseInt(plan.price.replace(/\./g, ""), 10);

  async function handlePayment() {
    setError("");
    setLoading(true);
    try {
      const res = await apiGateway.post("momo_service.php", {
        userId:      userInfo.id,
        packageId:   plan.dbId,
        amount:      priceNum,
        packageName: plan.name,
      });

      if (res.data.success && res.data.payUrl) {
        // Lưu để PaymentCallback có thể đọc nếu URL params bị thiếu
        sessionStorage.setItem("pendingMomoUserId",    String(userInfo.id));
        sessionStorage.setItem("pendingMomoPackageId", String(plan.dbId));
        window.location.href = res.data.payUrl;
      } else {
        setError(res.data.message || "Không thể khởi tạo thanh toán. Vui lòng thử lại.");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="svcpay-overlay" onClick={onClose}>
      <div className="svcpay-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="svcpay-header">
          <h2 className="svcpay-title">Xác nhận đăng ký</h2>
          <button className="svcpay-close" onClick={onClose} disabled={loading}>✕</button>
        </div>

        {/* Warning: switching plan */}
        {activeService && (
          <div className="svcpay-warning">
            <span className="svcpay-warning-icon">⚠️</span>
            <p>
              Gói <strong>{activeService.package_name}</strong> hiện tại của bạn sẽ{" "}
              <strong>hết hiệu lực</strong> khi đăng ký gói mới này.
            </p>
          </div>
        )}

        {/* Package summary */}
        <div className="svcpay-pkg">
          <div className="svcpay-pkg-icon">{plan.icon}</div>
          <div className="svcpay-pkg-info">
            <p className="svcpay-pkg-name">{plan.title}</p>
            <p className="svcpay-pkg-dur">Thời hạn: {plan.duration_days} ngày</p>
          </div>
          <div className="svcpay-pkg-price">
            <span className="svcpay-pkg-amount">{plan.price}</span>
            <span className="svcpay-pkg-unit"> VNĐ/tháng</span>
          </div>
        </div>

        {/* User info */}
        <div className="svcpay-user">
          <h3 className="svcpay-section-title">Thông tin tài khoản</h3>
          <div className="svcpay-field">
            <label>Email</label>
            <input type="text" value={userInfo.email || ""} readOnly />
          </div>
          <div className="svcpay-field">
            <label>Họ tên</label>
            <input type="text" value={userInfo.username || ""} readOnly />
          </div>
          <div className="svcpay-field">
            <label>Số điện thoại</label>
            <input type="text" value={userInfo.phone || "(chưa cập nhật)"} readOnly />
          </div>
        </div>

        {/* Payment notice */}
        <div className="svcpay-notice">
          <img
            src="images/logo/momo.png"
            alt="MoMo"
            className="svcpay-momo-logo"
          />
          <p>Chỉ thanh toán online qua <strong>MoMo ATM</strong></p>
        </div>

        {error && <p className="svcpay-error">{error}</p>}

        {/* Actions */}
        <div className="svcpay-actions">
          <button className="svcpay-btn-cancel" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button className="svcpay-btn-pay" onClick={handlePayment} disabled={loading}>
            {loading ? "Đang xử lý..." : "Thanh toán MoMo"}
          </button>
        </div>
      </div>
    </div>
  );
}
