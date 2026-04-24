import { useState, useEffect, useCallback } from "react";
import api from "../../../API/api";
import Pagination2 from "../../../components/Pagination2";
import { useSelector } from "react-redux";

const PAGE_SIZE = 5;

const PKG_LABEL = { 1: "NORMAL", 2: "PRO", 3: "VIP" };
const STATUS_LABEL = { active: "Đang hoạt động", expired: "Đã hết hạn" };

export default function DeleteServiceModal({ isOpen, onClose, onDeleted }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [allUsers,    setAllUsers]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [deleting,    setDeleting]    = useState(null);   // userId being deleted
  const [confirm,     setConfirm]     = useState(null);   // user pending confirmation
  const [search,      setSearch]      = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Fetch users WITH a service ─────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("ServiceController.php", {
        params: { action: "getAll" },
      });
      if (res.data.success) {
        // Only rows that actually have a service record
        setAllUsers((res.data.services || []).filter((s) => s.id));
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setCurrentPage(1);
      setConfirm(null);
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  // ─── Filter + paginate ───────────────────────────────────────────────────────
  const filtered = allUsers.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const pageUsers  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [search]);

  // ─── Delete handler ──────────────────────────────────────────────────────────
  async function handleDelete(user) {
    setConfirm(null);
    setDeleting(user.user_id);
    try {
      const res = await api.post(
        "ServiceController.php",
        {
          userId: user.user_id,
          adminId: currentUser?.id || null,
          note: "Admin xóa gói từ ServiceManagement",
        },
        { params: { action: "deleteService" } }
      );
      if (res.data.success) {
        setAllUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));
        if (onDeleted) onDeleted();
      }
    } catch {
      // ignore — parent handles notification
    } finally {
      setDeleting(null);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            🗑️ Xóa gói dịch vụ
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* ── Search ── */}
        <div className="px-6 pt-4 pb-3">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          />
        </div>

        {/* ── User list ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {loading ? (
            <p className="text-center text-gray-400 py-8 text-sm">Đang tải danh sách...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              {allUsers.length === 0
                ? "Không có người dùng nào đang có gói dịch vụ."
                : "Không tìm thấy người dùng phù hợp."}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                  <th className="pb-2 pr-4">Tên</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Gói</th>
                  <th className="pb-2 pr-4">Tình trạng</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {pageUsers.map((user) => {
                  const isDeleting = deleting === user.user_id;
                  const pkgName    = PKG_LABEL[user.package_id] ?? user.package_name ?? "—";
                  const statusName = STATUS_LABEL[user.status]  ?? user.status ?? "—";
                  return (
                    <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {/* Tên */}
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {user.username}
                      </td>

                      {/* Email */}
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                        {user.email}
                      </td>

                      {/* Gói */}
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {pkgName}
                        </span>
                      </td>

                      {/* Tình trạng */}
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                          {statusName}
                        </span>
                      </td>

                      {/* Nút xóa */}
                      <td className="py-3">
                        {confirm?.user_id === user.user_id ? (
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Xác nhận?</span>
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={isDeleting}
                              className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
                            >
                              Xóa
                            </button>
                            <button
                              onClick={() => setConfirm(null)}
                              className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold transition"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirm(user)}
                            disabled={isDeleting}
                            className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-600 hover:text-white text-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition"
                          >
                            {isDeleting ? "Đang xóa..." : "Xóa gói"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <Pagination2
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <p className="text-xs text-gray-400">
            {filtered.length} người dùng đang có gói dịch vụ
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
