import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../../API/api";
import Notification from "../../../../../components/Notification";

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("authToken") || "temp-token";
        const response = await api.get("ProductController.php", {
          params: {
            action: "getById",
            productId: productId,
          },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setProduct(response.data.product);
        } else {
          setNotification({
            message: response.data.message || "Lỗi khi lấy chi tiết sản phẩm",
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

    fetchProduct();
  }, [productId]);

  const getImageUrl = (avatar) => {
    if (!avatar) {
      return "/images/error/product.png";
    }
    return avatar.startsWith("http") ? avatar : `/uploads/products/${avatar}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    const value = Number(price);
    if (Number.isNaN(value)) return "0";
    return value.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/admin/ProductManagement")}
            className="mb-4 text-gray-400 hover:text-gray-300 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div className="text-center text-gray-400 py-12 bg-gray-800 rounded-lg border border-gray-700">
            <p>Không tìm thấy sản phẩm</p>
          </div>
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

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/ProductManagement")}
            className="mb-4 text-gray-400 hover:text-gray-300 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-red-500">CHI TIẾT</span>
            <span className="text-yellow-500 ml-2">SẢN PHẨM</span>
          </h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <div className="flex justify-center mb-8 pb-8 border-b border-gray-700">
            <img
              src={getImageUrl(product.avatar)}
              alt={product.name}
              className="w-56 h-56 object-cover rounded-lg border-2 border-gray-600"
              onError={(e) => {
                e.target.src = "/images/error/product.png";
              }}
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tên sản phẩm
              </label>
              <p className="text-lg text-white font-semibold">{product.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  ID sản phẩm
                </label>
                <p className="text-lg text-white font-semibold">{product.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Danh mục
                </label>
                <p className="text-lg text-white font-semibold">{product.category_name || "N/A"}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Giá sản phẩm
              </label>
              <p className="text-2xl text-yellow-500 font-bold">
                {formatPrice(product.price)} đ
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Mô tả
              </label>
              <div
                className="text-gray-300 bg-gray-700 rounded p-4 border border-gray-600 overflow-auto max-h-96"
                dangerouslySetInnerHTML={{
                  __html: product.description || "<p>Không có mô tả</p>",
                }}
                style={{
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Ngày tạo
                </label>
                <p className="text-lg text-white font-semibold">
                  {formatDate(product.created_at)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Ngày cập nhật
                </label>
                <p className="text-lg text-white font-semibold">
                  {formatDate(product.updated_at)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={() => navigate(`/admin/ProductManagement/Product/dashboard/edit/${product.id}`)}
                className="flex-1 py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => navigate("/admin/ProductManagement")}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
