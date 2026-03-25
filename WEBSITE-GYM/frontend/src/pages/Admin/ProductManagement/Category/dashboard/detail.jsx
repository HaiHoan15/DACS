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

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!category) {
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
          <p>Không tìm thấy danh mục</p>
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
        <h2 className="text-2xl font-bold text-white">Chi tiết danh mục</h2>
      </div>

      {/* Category Info Card */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
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
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center text-gray-400">
            <p>Không có sản phẩm nào trong danh mục này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="bg-gray-800 text-gray-200 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Hình</th>
                  <th className="px-4 py-3">Tên sản phẩm</th>
                  <th className="px-4 py-3">Giá</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-700 hover:bg-gray-800 transition"
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
                    <td className="px-4 py-3">{product.price?.toLocaleString("vi-VN")} đ</td>
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
  );
}
