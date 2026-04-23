import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../API/api";
import ServicePay from "./ServicePay";
import "./ServicePage.css";

const plans = [
  {
    key: "normal",
    dbId: 1,
    duration_days: 30,
    icon: "🏋️",
    name: "NORMAL",
    title: "Gói Thường",
    desc: "Lý tưởng để bắt đầu hành trình tập luyện của bạn.",
    price: "250.000",
    cardClass: "",
    iconClass: "svc-card-icon--normal",
    checkClass: "svc-feature-check--normal",
    btnClass: "svc-btn--normal",
    btnLabel: "Đăng ký ngay",
    badge: null,
    features: [
      { text: "Tham gia tập tại tất cả chi nhánh ThreeGym", isNew: false },
      { text: "Sử dụng toàn bộ thiết bị tập luyện", isNew: false },
      { text: "Giờ tập linh hoạt từ 5:00 – 22:00", isNew: false },
      { text: "Tủ đồ cá nhân miễn phí", isNew: false },
      { text: "Hỗ trợ kỹ thuật tập luyện cơ bản", isNew: false },
    ],
  },
  {
    key: "pro",
    dbId: 2,
    duration_days: 30,
    icon: "⚡",
    name: "PRO",
    title: "Gói Nâng Cao",
    desc: "Dành cho người muốn phát triển bản thân toàn diện.",
    price: "350.000",
    cardClass: "svc-card--featured",
    iconClass: "svc-card-icon--pro",
    checkClass: "svc-feature-check--pro",
    btnClass: "svc-btn--pro",
    btnLabel: "Đăng ký ngay",
    badge: { label: "Phổ biến nhất", cls: "svc-badge--popular" },
    features: [
      { text: "Tham gia tập tại tất cả chi nhánh ThreeGym", isNew: false },
      { text: "Sử dụng toàn bộ thiết bị tập luyện", isNew: false },
      { text: "Giờ tập linh hoạt từ 5:00 – 22:00", isNew: false },
      { text: "Tủ đồ cá nhân miễn phí", isNew: false },
      { text: "Tham gia các lớp học tập luyện mở tại chi nhánh", isNew: true },
      { text: "Ưu tiên đặt lịch lớp học trực tuyến", isNew: true },
    ],
  },
  {
    key: "vip",
    dbId: 3,
    duration_days: 30,
    icon: "👑",
    name: "VIP",
    title: "Gói Cao Cấp",
    desc: "Trải nghiệm đỉnh cao với công nghệ AI tiên tiến.",
    price: "500.000",
    cardClass: "svc-card--vip",
    iconClass: "svc-card-icon--vip",
    checkClass: "svc-feature-check--vip",
    btnClass: "svc-btn--vip",
    btnLabel: "Đăng ký ngay",
    badge: { label: "VIP", cls: "svc-badge--vip" },
    features: [
      { text: "Tham gia tập tại tất cả chi nhánh ThreeGym", isNew: false },
      { text: "Sử dụng toàn bộ thiết bị tập luyện", isNew: false },
      { text: "Giờ tập linh hoạt từ 5:00 – 22:00", isNew: false },
      { text: "Tủ đồ cá nhân miễn phí", isNew: false },
      { text: "Tham gia các lớp học tập luyện mở tại chi nhánh", isNew: false },
      { text: "Ưu tiên đặt lịch lớp học trực tuyến", isNew: false },
      { text: "Sử dụng AI chăm sóc sức khỏe tiên tiến của ThreeGym", isNew: true },
      { text: "Phân tích sức khỏe & lộ trình tập luyện cá nhân hóa", isNew: true },
    ],
  },
];

export default function ServicePage() {
  const navigate    = useNavigate();
  const user        = useSelector((state) => state.auth.user);

  const [activeService,    setActiveService]    = useState(null);  // {package_id, package_name, ...}
  const [showPayModal,     setShowPayModal]     = useState(false);
  const [selectedPlan,     setSelectedPlan]     = useState(null);
  const [showSwitchAlert,  setShowSwitchAlert]  = useState(false);
  const [pendingPlan,      setPendingPlan]      = useState(null);

  // Fetch user's active service
  useEffect(() => {
    if (!user?.id) return;
    api
      .get("ServiceController.php", { params: { action: "getUserService", userId: user.id } })
      .then((res) => {
        if (res.data?.success) setActiveService(res.data.service);
      })
      .catch(() => {});
  }, [user]);

  function handleRegister(plan) {
    if (!user) {
      navigate("/login");
      return;
    }
    // Already subscribed to this plan — do nothing
    if (activeService && activeService.package_id === plan.dbId) return;

    if (activeService && activeService.package_id !== plan.dbId) {
      // Switching plan — ask confirmation first
      setPendingPlan(plan);
      setShowSwitchAlert(true);
    } else {
      setSelectedPlan(plan);
      setShowPayModal(true);
    }
  }

  function confirmSwitch() {
    setShowSwitchAlert(false);
    setSelectedPlan(pendingPlan);
    setPendingPlan(null);
    setShowPayModal(true);
  }

  return (
    <div className="svc-page">
      {/* ---- Hero ---- */}
      <section className="svc-hero">
        <div className="svc-hero-bg" />
        <div className="svc-hero-blob svc-hero-blob-1" />
        <div className="svc-hero-blob svc-hero-blob-2" />
        <div className="svc-hero-blob svc-hero-blob-3" />

        <div className="svc-hero-content">
          <span className="svc-hero-eyebrow">Bảng giá dịch vụ</span>
          <h1 className="svc-hero-title">
            Chọn gói phù hợp với <br />
            <span className="highlight-red">THREE</span>{" "}
            <span className="highlight-orange">GYM</span>
          </h1>
          <p className="svc-hero-desc">
            Đa dạng gói tập luyện linh hoạt, đáp ứng mọi nhu cầu từ người mới bắt đầu đến
            thành viên chuyên nghiệp — tất cả tại cùng một hệ thống.
          </p>

          {/* Stats */}
          <div className="svc-stats">
            <div className="svc-stat-item">
              <span className="svc-stat-num">10<span>+</span></span>
              <span className="svc-stat-label">Chi nhánh</span>
            </div>
            <div className="svc-stat-item">
              <span className="svc-stat-num">5.000<span>+</span></span>
              <span className="svc-stat-label">Thành viên</span>
            </div>
            <div className="svc-stat-item">
              <span className="svc-stat-num">50<span>+</span></span>
              <span className="svc-stat-label">Huấn luyện viên</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Pricing ---- */}
      <section className="svc-section">
        <div className="svc-section-header">
          <span className="svc-section-tag">Gói thành viên</span>
          <h2 className="svc-section-title">Lựa chọn gói phù hợp với bạn</h2>
          <p className="svc-section-subtitle">
            Tất cả các gói đều bao gồm quyền truy cập toàn bộ hệ thống chi nhánh —
            không giới hạn thời gian, không ràng buộc dài hạn.
          </p>
        </div>

        <div className="svc-pricing-grid">
          {plans.map((plan) => (
            <div key={plan.key} className={`svc-card ${plan.cardClass}`}>
              {/* Badge */}
              {plan.badge && (
                <span className={`svc-badge ${plan.badge.cls}`}>{plan.badge.label}</span>
              )}

              {/* Icon */}
              <div className={`svc-card-icon ${plan.iconClass}`}>
                {plan.icon}
              </div>

              {/* Name & description */}
              <p className="svc-plan-name">{plan.name}</p>
              <h3 className="svc-plan-title">{plan.title}</h3>
              <p className="svc-plan-desc">{plan.desc}</p>

              {/* Price */}
              <div className="svc-price-block">
                <div className="svc-price">
                  <span className="svc-price-amount">{plan.price}</span>
                  <span className="svc-price-currency">VNĐ</span>
                  <span className="svc-price-period">/ tháng</span>
                </div>
              </div>

              {/* Features */}
              <ul className="svc-features">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className={`svc-feature-item${f.isNew ? " svc-feature-item--new" : ""}`}
                  >
                    <span className={`svc-feature-check ${plan.checkClass}`}>✓</span>
                    <span className="svc-feature-text">{f.text}</span>
                  </li>
                ))}
              </ul>

              {/* Register button */}
              {activeService && activeService.package_id === plan.dbId ? (
                <button className={`svc-btn svc-btn--registered`} type="button" disabled>
                  ✓ Đã đăng ký
                </button>
              ) : (
                <button
                  className={`svc-btn ${plan.btnClass}`}
                  type="button"
                  onClick={() => handleRegister(plan)}
                >
                  {plan.btnLabel}
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="svc-note">
          Cần tư vấn thêm? &nbsp;
          <a href="#">Liên hệ với chúng tôi</a> — đội ngũ ThreeGym luôn sẵn sàng hỗ trợ.
        </p>
      </section>

      {/* ─── Switch-plan confirmation ─── */}
      {showSwitchAlert && pendingPlan && (
        <div className="svc-overlay" onClick={() => setShowSwitchAlert(false)}>
          <div className="svc-alert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="svc-alert-icon">⚠️</div>
            <h3 className="svc-alert-title">Thay đổi gói đăng ký</h3>
            <p className="svc-alert-body">
              Gói <strong>{activeService?.package_name}</strong> hiện tại của bạn sẽ{" "}
              <strong>hết hiệu lực</strong> nếu bạn đăng ký gói{" "}
              <strong>{pendingPlan.title}</strong>. Bạn có muốn tiếp tục?
            </p>
            <div className="svc-alert-actions">
              <button className="svc-alert-btn-cancel" onClick={() => setShowSwitchAlert(false)}>
                Hủy
              </button>
              <button className="svc-alert-btn-confirm" onClick={confirmSwitch}>
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ServicePay modal ─── */}
      <ServicePay
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        plan={selectedPlan}
        userInfo={user}
        activeService={activeService}
      />
    </div>
  );
}
