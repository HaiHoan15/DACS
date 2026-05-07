import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../../API/api";
import Notification from "../../../../../components/Notification";

export default function CategoryDetail() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch category and related products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken") || "temp-token";

        // Fetch category
        const categoryResponse = await api.get("CategoryController.php", {
          params: {
            action: "getById",
            categoryId: categoryId,
          },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (categoryResponse.data.success) {
          setCategory(categoryResponse.data.category);
        } else {
          setNotification({
            message: categoryResponse.data.message || "Lỗi khi lấy danh mục",
            type: "error",
          });
        }

        // Fetch products by category
        const productsResponse = await api.get("ProductController.php", {
          params: {
            action: "getByCategoryId",
            categoryId: categoryId,
          },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (productsResponse.data.success) {
          setProducts(productsResponse.data.products || []);
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

    fetchData();
  }, [categoryId]);

  const handleViewProductDetail = (productId) => {
    navigate(`/admin/ProductManagement/product/dashboard/detail/${productId}`);
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/ProductManagement/product/dashboard/edit/${productId}`);
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}" không?`)) {
      try {
        const token = localStorage.getItem("authToken") || "temp-token";
        const response = await api.post(
          "ProductController.php",
          {
            action: "delete",
            productId: productId,
          },
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setNotification({
            message: response.data.message || "Xóa sản phẩm thành công",
            type: "success",
          });
          setProducts(products.filter((p) => p.id !== productId));
        } else {
          setNotification({
            message: response.data.message || "Lỗi khi xóa sản phẩm",
            type: "error",
          });
        }
      } catch (error) {
        setNotification({
          message: error.response?.data?.message || "Lỗi kết nối server",
          type: "error",
        });
      }
    }
  };

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

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/admin/ProductManagement")}
            className="mb-4 text-gray-400 hover:text-gray-300 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div className="text-center text-gray-400 py-12 bg-gray-800 rounded-xl border border-gray-700">
            <p>Không tìm thấy danh mục</p>
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

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-2">
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
            <span className="text-yellow-500 ml-2">DANH MỤC</span>
          </h1>
        </div>

      {/* Category Info Card */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Tên danh mục
          </label>
          <h3 className="text-2xl font-bold text-white">{category.name}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              ID danh mục
            </label>
            <p className="text-gray-300">{category.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Số lượng sản phẩm
            </label>
            <p className="text-gray-300">{products.length} sản phẩm</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Ngày tạo
            </label>
            <p className="text-gray-300">{formatDate(category.created_at)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Ngày cập nhật
            </label>
            <p className="text-gray-300">{formatDate(category.updated_at)}</p>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">
          Sản phẩm trong danh mục ({products.length})
        </h3>

        {products.length === 0 ? (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center text-gray-400">
            <p>Không có sản phẩm nào trong danh mục này</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-800 rounded-xl border border-gray-700 shadow">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="bg-gray-700 border-b-2 border-gray-600">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide text-gray-300 text-xs">ID</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide text-gray-300 text-xs">Hình</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide text-gray-300 text-xs">Tên sản phẩm</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide text-gray-300 text-xs">Giá</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide text-gray-300 text-xs">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                  >
                    <td className="px-4 py-3">{product.id}</td>
                    <td className="px-4 py-3">
                      <img
                        src={getImageUrl(product.avatar)}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => {
                          e.target.src = "/images/error/product.png";
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{formatPrice(product.price)} đ</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleViewProductDetail(product.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-xs"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
