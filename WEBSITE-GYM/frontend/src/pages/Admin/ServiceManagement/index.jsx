import { useState, useEffect, useCallback } from "react";
import Notification from "../../../components/Notification";
import api from "../../../API/api";
import GrantServiceModal from "./add";
import DeleteServiceModal from "./delete";

const PACKAGES = [
  { value: 1, label: "NORMAL" },
  { value: 2, label: "PRO"    },
  { value: 3, label: "VIP"    },
];

const STATUSES = [
  { value: "active",  label: "Đang hoạt động" },
  { value: "expired", label: "Đã hết hạn"     },
];

const PKG_BADGE = {
  NORMAL: "bg-blue-100   text-blue-800   dark:bg-blue-900   dark:text-blue-200",
  PRO:    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  VIP:    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const STATUS_BADGE = {
  active:  "bg-green-100 text-green-800 dark:bg-green-900  dark:text-green-200",
  expired: "bg-red-100   text-red-800   dark:bg-red-900    dark:text-red-200",
};

export default function ServiceManagement() {
  const [services,     setServices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [notification, setNotification] = useState(null);

  // Filters
  const [search,       setSearch]       = useState("");
  const [pkgFilter,    setPkgFilter]    = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Tặng gói modal
  const [showGrant,    setShowGrant]    = useState(false);

  // Xóa gói modal
  const [showDelete,   setShowDelete]   = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("ServiceController.php", { params: { action: "getAll" } });
      if (res.data.success) {
        setServices(res.data.services || []);
      } else {
        notify(res.data.message || "Lỗi khi tải dữ liệu", "error");
      }
    } catch {
      notify("Lỗi kết nối server", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const notify = (message, type = "success") => setNotification({ message, type });

  // ─── Update helpers ───────────────────────────────────────────────────────
  const handlePackageChange = async (svc, newPackageId) => {
    const pid = parseInt(newPackageId);
    try {
      const res = await api.post(
        "ServiceController.php",
        { userServiceId: svc.id, packageId: pid },
        { params: { action: "updateService" } }
      );
      if (res.data.success) {
        const pkgLabel = PACKAGES.find(p => p.value === pid)?.label ?? svc.package_name;
        setServices(prev => prev.map(s =>
          s.id === svc.id ? { ...s, package_id: pid, package_name: pkgLabel } : s
        ));
        notify("Đã cập nhật gói dịch vụ");
      } else {
        notify(res.data.message || "Cập nhật thất bại", "error");
      }
    } catch {
      notify("Lỗi khi cập nhật gói", "error");
    }
  };

  const handleStatusChange = async (svc, newStatus) => {
    try {
      const res = await api.post(
        "ServiceController.php",
        { userServiceId: svc.id, status: newStatus },
        { params: { action: "updateService" } }
      );
      if (res.data.success) {
        setServices(prev => prev.map(s =>
          s.id === svc.id ? { ...s, status: newStatus } : s
        ));
        notify("Đã cập nhật tình trạng");
      } else {
        notify(res.data.message || "Cập nhật thất bại", "error");
      }
    } catch {
      notify("Lỗi khi cập nhật tình trạng", "error");
    }
  };

  // ─── Filter ───────────────────────────────────────────────────────────────
  const filtered = services.filter(s => {
    const q         = search.toLowerCase();
    const textMatch = !q || s.username?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    const pkgMatch  = pkgFilter    === "all" || Number(s.package_id) === parseInt(pkgFilter);
    const stMatch   = statusFilter === "all" || s.status     === statusFilter;
    return textMatch && pkgMatch && stMatch;
  });

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Đang tải dữ liệu dịch vụ...</p>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Quản lý dịch vụ
        </h1>

        {/* ── Toolbar ── */}
        <div className="mb-5 flex flex-col md:flex-row gap-4 items-start md:items-end">

          {/* Tìm kiếm — trái */}
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Tìm kiếm theo tên hoặc email
            </label>
            <input
              type="text"
              placeholder="Nhập tên hoặc email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bộ lọc — phải */}
          <div className="flex gap-3 flex-shrink-0">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Gói dịch vụ
              </label>
              <select
                value={pkgFilter}
                onChange={e => setPkgFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                {PACKAGES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tình trạng
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowGrant(true)}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition whitespace-nowrap shadow"
              >
                Tặng gói
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowDelete(true)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition whitespace-nowrap shadow"
              >
                Xóa gói
              </button>
            </div>
          </div>
        </div>

        {/* Số lượng kết quả */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Hiển thị <strong>{filtered.length}</strong> / {services.length} bản ghi
        </p>

        {/* ── Bảng ── */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 dark:text-gray-500">
              Không có dữ liệu phù hợp.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                  <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">#</th>
                  <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Tên</th>
                  <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                  <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Gói dịch vụ</th>
                  <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Ngày bắt đầu</th>
                  <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Ngày kết thúc</th>
                  <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((svc, idx) => (
                  <tr
                    key={svc.id ?? `user-${svc.user_id}`}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-5 py-3 text-gray-400 dark:text-gray-500">{idx + 1}</td>

                    {/* Tên */}
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {svc.username}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      {svc.email}
                    </td>

                    {/* Gói dịch vụ — thay đổi được */}
                    <td className="px-5 py-3">
                      <select
                        value={svc.package_id ?? ""}
                        onChange={e => handlePackageChange(svc, e.target.value)}
                        disabled={!svc.id}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-blue-400
                          ${!svc.id ? "bg-gray-100 text-gray-500 cursor-not-allowed" : (PKG_BADGE[svc.package_name] ?? "bg-gray-100 text-gray-700")}`}
                      >
                        {!svc.id && <option value="">Chưa đăng ký</option>}
                        {PACKAGES.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Ngày bắt đầu */}
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {svc.start_date || "-"}
                    </td>

                    {/* Ngày kết thúc */}
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {svc.end_date || "-"}
                    </td>

                    {/* Tình trạng — thay đổi được */}
                    <td className="px-5 py-3">
                      <select
                        value={svc.status ?? ""}
                        onChange={e => handleStatusChange(svc, e.target.value)}
                        disabled={!svc.id}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-blue-400
                          ${!svc.id ? "bg-gray-100 text-gray-500 cursor-not-allowed" : (STATUS_BADGE[svc.status] ?? "bg-gray-100 text-gray-700")}`}
                      >
                        {!svc.id && <option value="">Chưa đăng ký</option>}
                        {STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Tặng gói modal ── */}
      <GrantServiceModal
        isOpen={showGrant}
        onClose={() => setShowGrant(false)}
        onGranted={() => {
          fetchServices();
          notify("Đã tặng gói dịch vụ thành công!");
        }}
      />

      {/* ── Xóa gói modal ── */}
      <DeleteServiceModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onDeleted={() => {
          fetchServices();
          notify("Đã xóa gói dịch vụ thành công!");
        }}
      />
    </div>
  );
}