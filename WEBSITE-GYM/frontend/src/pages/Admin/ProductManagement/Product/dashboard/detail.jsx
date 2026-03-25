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

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        <button
          onClick={() => navigate("/admin/ProductManagement")}
          className="text-gray-400 hover:text-white transition"
        >
          ← Quay lại
        </button>
        <div className="text-center text-gray-400 py-12">
          <p>Không tìm thấy sản phẩm</p>
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

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/ProductManagement")}
          className="text-gray-400 hover:text-white transition"
        >
          ← Quay lại
        </button>
        <h2 className="text-2xl font-bold text-white">Chi tiết sản phẩm</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Image */}
        <div className="md:col-span-1">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <img
              src={getImageUrl(product.avatar)}
              alt={product.name}
              className="w-full h-100 object-cover rounded-lg mb-4"
              onError={(e) => {
                e.target.src = "/images/error/product.png";
              }}
            />
          </div>
        </div>

        {/* Product Information */}
        <div className="md:col-span-2">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Tên sản phẩm
              </label>
              <p className="text-xl text-white font-semibold">{product.name}</p>
            </div>

            {/* Product ID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  ID sản phẩm
                </label>
                <p className="text-white">{product.id}</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Danh mục
                </label>
                <p className="text-white">{product.category_name || "N/A"}</p>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Giá sản phẩm
              </label>
              <p className="text-2xl text-yellow-500 font-bold">
                {product.price?.toLocaleString("vi-VN")} đ
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Mô tả
              </label>
              <div 
                className="text-gray-300 bg-gray-700 rounded p-4 border border-gray-600 overflow-auto max-h-96"
                dangerouslySetInnerHTML={{
                  __html: product.description || "<p>Không có mô tả</p>"
                }}
                style={{
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Ngày tạo
                </label>
                <p className="text-sm text-gray-300">
                  {formatDate(product.created_at)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Ngày cập nhật
                </label>
                <p className="text-sm text-gray-300">
                  {formatDate(product.updated_at)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => navigate(`/admin/ProductManagement/Product/dashboard/edit/${product.id}`)}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => navigate("/admin/ProductManagement")}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
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
