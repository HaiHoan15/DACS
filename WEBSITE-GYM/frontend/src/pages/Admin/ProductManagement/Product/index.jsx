import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";

export default function Product() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch all products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("authToken") || "temp-token";
        const response = await api.get("ProductController.php", {
          params: {
            action: "getAll",
          },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setProducts(response.data.products || []);
        } else {
          setNotification({
            message: response.data.message || "Lỗi khi lấy danh sách sản phẩm",
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

    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    navigate("/admin/ProductManagement/product/dashboard/add");
  };

  const handleViewDetail = (productId) => {
    navigate(`/admin/ProductManagement/product/dashboard/detail/${productId}`);
  };

  const handleEdit = (productId) => {
    navigate(`/admin/ProductManagement/product/dashboard/edit/${productId}`);
  };

  const handleDelete = async (productId, productName) => {
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

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>Đang tải dữ liệu...</p>
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

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Danh sách sản phẩm</h2>
        <button
          onClick={handleAddProduct}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg hover:from-red-700 hover:to-yellow-600 transition"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>Chưa có sản phẩm nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-800 text-gray-200 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Hình</th>
                <th className="px-4 py-3">Tên sản phẩm</th>
                <th className="px-4 py-3">Danh mục</th>
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
                  <td className="px-4 py-3">{product.category_name || "N/A"}</td>
                  <td className="px-4 py-3">{product.price?.toLocaleString("vi-VN")} đ</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleViewDetail(product.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleEdit(product.id)}
                      className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-xs"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
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
  );
}
