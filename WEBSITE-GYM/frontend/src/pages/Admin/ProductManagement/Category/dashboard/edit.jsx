import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../../API/api";
import Notification from "../../../../../components/Notification";

export default function EditCategory() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [formData, setFormData] = useState({
    name: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("authToken") || "temp-token";
        const response = await api.get("CategoryController.php", {
          params: {
            action: "getById",
            categoryId: categoryId,
          },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setFormData({
            name: response.data.category.name,
          });
        } else {
          setNotification({
            message: response.data.message || "Lỗi khi lấy danh mục",
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

    fetchCategory();
  }, [categoryId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setNotification({
        message: "Tên danh mục không được để trống",
        type: "error",
      });
      return false;
    }

    if (formData.name.length > 50) {
      setNotification({
        message: "Tên danh mục không được vượt quá 50 ký tự",
        type: "error",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken") || "temp-token";
      const response = await api.post(
        "CategoryController.php",
        {
          action: "update",
          categoryId: categoryId,
          name: formData.name.trim(),
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setNotification({
          message: "Cập nhật danh mục thành công!",
          type: "success",
        });
        
        // Redirect sau 1.5 giây
        setTimeout(() => {
          navigate("/admin/ProductManagement");
        }, 1500);
      } else {
        setNotification({
          message: response.data.message || "Lỗi khi cập nhật danh mục",
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Lỗi kết nối server",
        type: "error",
      });
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/ProductManagement")}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-red-500">SỬA</span>
            <span className="text-yellow-500 ml-2">DANH MỤC</span>
          </h1>
          <p className="text-gray-400">Chỉnh sửa thông tin danh mục sản phẩm</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          {/* ID (Read-only) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ID danh mục
            </label>
            <input
              type="text"
              value={categoryId}
              disabled
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed opacity-75"
            />
          </div>

          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên danh mục"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              maxLength={100}
            />
            <p className="text-xs text-gray-400 mt-1">{formData.name.length}/100 ký tự</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/ProductManagement")}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật danh mục"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
