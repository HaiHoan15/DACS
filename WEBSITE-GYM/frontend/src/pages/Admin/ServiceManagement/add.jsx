import { useState, useEffect, useCallback } from "react";
import api from "../../../API/api";
import Pagination2 from "../../../components/Pagination2";
import { useSelector } from "react-redux";

const PACKAGES = [
  { value: 1, label: "NORMAL" },
  { value: 2, label: "PRO"    },
  { value: 3, label: "VIP"    },
];

const PAGE_SIZE = 5;

export default function GrantServiceModal({ isOpen, onClose, onGranted }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [allUsers,     setAllUsers]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [granting,     setGranting]     = useState(null); // userId being granted
  const [search,       setSearch]       = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  // Selected package per user  { [userId]: packageValue }
  const [selectedPkgs, setSelectedPkgs] = useState({});

  // ─── Fetch users without active service ─────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("ServiceController.php", {
        params: { action: "getUsersWithoutService" },
      });
      if (res.data.success) {
        setAllUsers(res.data.users || []);
      }
    } catch {
      // silently ignore — parent will show errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setCurrentPage(1);
      setSelectedPkgs({});
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  // ─── Filter + paginate ───────────────────────────────────────────────────────
  const filtered = allUsers.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(currentPage, totalPages);
  const pageUsers   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page when search changes
  useEffect(() => { setCurrentPage(1); }, [search]);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  function getPkg(userId) {
    return selectedPkgs[userId] ?? 1;
  }

  function setPkg(userId, val) {
    setSelectedPkgs((prev) => ({ ...prev, [userId]: Number(val) }));
  }

  async function handleGrant(user) {
    const packageId = getPkg(user.id);
    setGranting(user.id);
    try {
      const res = await api.post(
        "ServiceController.php",
        {
          userId: user.id,
          packageId,
          source: "admin_grant",
          adminId: currentUser?.id || null,
          paymentMethod: "admin_action",
        },
        { params: { action: "createActive" } }
      );
      if (res.data.success) {
        // Remove user from list
        setAllUsers((prev) => prev.filter((u) => u.id !== user.id));
        if (onGranted) onGranted();
      }
    } catch {
      // ignore — parent handles notification
    } finally {
      setGranting(null);
    }
  }

  if (!isOpen) return null;

  const pkgLabel = (userId) =>
    PACKAGES.find((p) => p.value === getPkg(userId))?.label ?? "NORMAL";

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
            🎁 Tặng gói dịch vụ
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
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* ── User list ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {loading ? (
            <p className="text-center text-gray-400 py-8 text-sm">Đang tải danh sách...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              {allUsers.length === 0
                ? "Tất cả người dùng đã đăng ký gói dịch vụ."
                : "Không tìm thấy người dùng phù hợp."}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                  <th className="pb-2 pr-4">Tên</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Gói</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {pageUsers.map((user) => {
                  const isGranting = granting === user.id;
                  const pkg = pkgLabel(user.id);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {/* Tên */}
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {user.username}
                      </td>

                      {/* Email */}
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                        {user.email}
                      </td>

                      {/* Chọn gói */}
                      <td className="py-3 pr-4">
                        <select
                          value={getPkg(user.id)}
                          onChange={(e) => setPkg(user.id, e.target.value)}
                          disabled={isGranting}
                          className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          {PACKAGES.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Nút tặng */}
                      <td className="py-3">
                        <button
                          onClick={() => handleGrant(user)}
                          disabled={isGranting}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold whitespace-nowrap transition"
                        >
                          {isGranting
                            ? "Đang xử lý..."
                            : `Thêm ${pkg} cho ${user.username}`}
                        </button>
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
            {filtered.length} người dùng chưa có gói dịch vụ
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
