import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";
import Pagination2 from "../../../../components/Pagination2";

export default function Product() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

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

  const formatPrice = (price) => {
    const value = Number(price);
    if (Number.isNaN(value)) return "0";
    return value.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
  };

  const categoryOptions = Array.from(
    new Set(products.map((product) => product.category_name).filter(Boolean))
  );

  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name
      ?.toLowerCase()
      .includes(searchTerm.trim().toLowerCase());
    const categoryMatch =
      selectedCategory === "all" || product.category_name === selectedCategory;
    return nameMatch && categoryMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Tìm kiếm theo tên sản phẩm
            </label>
            <input
              type="text"
              placeholder="Nhập tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Danh mục
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg hover:from-red-700 hover:to-yellow-600 transition"
            >
              + Thêm sản phẩm
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        Hiển thị <strong className="text-white">{filteredProducts.length}</strong> / {products.length} sản phẩm
      </p>

      {filteredProducts.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>Không có sản phẩm phù hợp</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-xl border border-gray-700 shadow">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-700 border-b-2 border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Hình</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tên sản phẩm</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Danh mục</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Giá</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
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
                  <td className="px-4 py-3">{product.category_name || "N/A"}</td>
                  <td className="px-4 py-3">{formatPrice(product.price)} đ</td>
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

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination2
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
