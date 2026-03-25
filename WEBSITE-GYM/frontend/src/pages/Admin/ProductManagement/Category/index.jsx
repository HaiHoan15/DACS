import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";

export default function Category() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch danh sách categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("authToken") || "temp-token";
        const response = await api.get("CategoryController.php", {
          params: {
            action: "getAll",
          },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setCategories(response.data.categories || []);
        } else {
          setNotification({
            message: response.data.message || "Lỗi khi lấy danh sách danh mục",
            type: "error",
          });
        }
      } catch (error) {
        setNotification({
          message: error.response?.data?.message || "Lỗi kết nối server",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    navigate("dashboard/add");
  };

  const handleEdit = (categoryId) => {
    navigate(`dashboard/edit/${categoryId}`);
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa danh mục "${categoryName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken") || "temp-token";
      const response = await api.post(
        "CategoryController.php",
        {
          action: "delete",
          categoryId: categoryId,
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setCategories(categories.filter((c) => c.id !== categoryId));
        setNotification({
          message: "Xóa danh mục thành công!",
          type: "success",
        });
      } else {
        setNotification({
          message: response.data.message || "Lỗi khi xóa danh mục",
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Lỗi kết nối server",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">
          <svg className="animate-spin h-8 w-8 mb-4 mx-auto" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              opacity="0.3"
            />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header với nút Thêm */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Danh mục sản phẩm</h2>
          <p className="text-gray-400">Tổng: {categories.length} danh mục</p>
        </div>
        <button
          onClick={handleAddCategory}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm danh mục
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            Không có danh mục nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Tên danh mục
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 text-sm text-gray-300">{category.id}</td>
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category.id)}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition font-medium text-xs"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium text-xs"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
