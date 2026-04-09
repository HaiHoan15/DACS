import React, { useState, useEffect } from "react";
import ProductCard from "../_Components/ProductCard";
import Footer from "../_Components/Footer";
import Pagination from "../../../components/Pagination";
import api from "../../../API/api";

export default function ProductPage() {
  const [sortOption, setSortOption] = useState("Mặc định");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Trạng thái lưu trữ các bộ lọc đã chọn
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  
  // Trạng thái cho dữ liệu từ backend
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm xử lý khi tick/bỏ tick một Danh Mục
  // const handleCategoryChange = (cat) => {
  //   setSelectedCategories(prev => 
  //     prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
  //   );
  // };

  // Hàm xử lý khi tick/bỏ tick một Mức Giá
  const handlePriceChange = (priceOpt) => {
    setSelectedPrices(prev => 
      prev.includes(priceOpt) ? prev.filter(p => p !== priceOpt) : [...prev, priceOpt]
    );
  };

  // Fetch categories và products từ backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken") || "temp-token";

        // Fetch categories
        const categoriesResponse = await api.get("CategoryController.php", {
          params: {
            action: "getAll",
          },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.categories || []);
        }

        // Fetch products
        const productsResponse = await api.get("ProductController.php", {
          params: {
            action: "getAll",
          },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (productsResponse.data.success) {
          setProducts(productsResponse.data.products || []);
        } else {
          setError(productsResponse.data.message || "Lỗi khi lấy danh sách sản phẩm");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi kết nối server");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Scroll to top khi currentPage thay đổi
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [currentPage]);

  // Hàm phân tích các khoảng giá
  const checkPriceMatch = (price, priceFilters) => {
    if (priceFilters.length === 0) return true; // Không chọn gì thì hiển thị hết
    return priceFilters.some(filter => {
      if (filter === "Dưới 500.000đ") return price < 500000;
      if (filter === "500.000đ - 1.000.000đ") return price >= 500000 && price <= 1000000;
      if (filter === "1.000.000đ - 2.000.000đ") return price >= 1000000 && price <= 2000000;
      if (filter === "Trên 2.000.000đ") return price > 2000000;
      return false;
    });
  };

  // 1. Lọc sản phẩm trước (Bộ lọc AND giữa Danh Mục và Mức Giá)
  let filteredProducts = products.filter(p => {
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category_name);
    const matchPrice = checkPriceMatch(p.price, selectedPrices);
    return matchCategory && matchPrice;
  });

  // 2. Chạy hàm sắp xếp lên kết quả đã lọc
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "Giá tăng dần") return a.price - b.price;
    if (sortOption === "Giá giảm dần") return b.price - a.price;
    return 0; // "Mặc định" giữ nguyên thứ tự
  });

  // 3. Reset page khi filter hoặc sort thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedPrices, sortOption]);

  // 4. Tính toán phân trang
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <div 
        className="min-h-screen bg-slate-50 py-16 px-4 relative flex flex-col items-center"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 14V0h2v14h14v2H16v14h-2V16H0v-2h14z' fill='rgba(0,0,0,0.03)'/%3E%3C/svg%3E")`
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-100 to-transparent pointer-events-none z-0"></div>

        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 uppercase tracking-tight">TẤT CẢ <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">SẢN PHẨM</span></h1>
          <p className="text-gray-500 text-lg">Danh sách các gói dịch vụ và phụ kiện đang mở bán.</p>
        </div>

        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 relative z-10">
          
          {/* CỘT TRÁI: SIDEBAR LỌC (Filter) */}
          <aside className="w-full lg:w-1/4 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-8 h-fit">
            
            {/* Mục Danh Mục Sản Phẩm */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm border-b pb-2">Danh mục</h3>
              <div className="space-y-3">
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <label key={cat.id} className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => {
                          setSelectedCategories(prev => 
                            prev.includes(cat.name) ? prev.filter(c => c !== cat.name) : [...prev, cat.name]
                          );
                        }}
                        className="w-5 h-5 text-red-500 rounded border-gray-300 focus:ring-red-500 cursor-pointer transition-all" 
                      />
                      <span className={`transition-colors font-medium ${selectedCategories.includes(cat.name) ? "text-red-600 font-bold" : "text-gray-600 group-hover:text-red-500"}`}>
                        {cat.name}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Đang tải danh mục...</p>
                )}
              </div>
            </div>

            {/* Mục Giá */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm border-b pb-2">Mức giá</h3>
              <div className="space-y-3">
                {["Dưới 500.000đ", "500.000đ - 1.000.000đ", "1.000.000đ - 2.000.000đ", "Trên 2.000.000đ"].map(price => (
                  <label key={price} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedPrices.includes(price)}
                      onChange={() => handlePriceChange(price)}
                      className="w-5 h-5 text-red-500 rounded border-gray-300 focus:ring-red-500 cursor-pointer transition-all" 
                    />
                    <span className={`transition-colors font-medium ${selectedPrices.includes(price) ? "text-red-600 font-bold" : "text-gray-600 group-hover:text-red-500"}`}>
                      {price}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* CỘT PHẢI: DANH SÁCH (Sắp xếp + Grid Thẻ) */}
          <main className="w-full lg:w-3/4 flex flex-col gap-6">
            
            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-24 bg-white/50 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm">
                <div className="text-center">
                  <p className="text-gray-600 text-lg mb-4">Đang tải dữ liệu sản phẩm...</p>
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-md rounded-2xl border border-red-200 shadow-sm">
                <div className="text-5xl mb-4 opacity-50">⚠️</div>
                <h3 className="text-xl font-bold text-red-700 mb-2">Lỗi khi tải dữ liệu</h3>
                <p className="text-red-500 text-center max-w-sm">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
            
            <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <span className="text-gray-600 font-medium">Hiển thị {sortedProducts.length} kết quả</span>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="font-bold text-gray-800">Sắp xếp theo:</span>
                {["Mặc định", "Giá tăng dần", "Giá giảm dần"].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setSortOption(opt)}
                    className={`px-3 py-1 rounded-md transition-all ${
                      sortOption === opt 
                      ? "bg-red-50 text-red-600 font-bold border border-red-200" 
                      : "text-gray-600 hover:bg-gray-100 font-medium"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Sản Phẩm */}
            {displayedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {displayedProducts.map(product => {
                   // Transform dữ liệu từ backend để tương thích với ProductCard
                   const transformedProduct = {
                     ...product,
                     category: product.category_name,
                     image: product.avatar?.startsWith('http') ? product.avatar : `/uploads/products/${product.avatar}`
                   };
                   return <ProductCard key={product.id} product={transformedProduct} />;
                 })}
              </div>
            ) : (
              // Bổ sung màn hình Empty State tuyệt đẹp khi lọc không ra kết quả
              <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm">
                <div className="text-5xl mb-4 opacity-50">🔍</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy gói tập nào</h3>
                <p className="text-gray-500 text-center max-w-sm">Rất tiếc bộ lọc của bạn quá khắt khe. Vui lòng thử chọn lại tiêu chí khác nhé!</p>
                <button 
                  onClick={() => { setSelectedCategories([]); setSelectedPrices([]); }}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-red-500 to-yellow-500 hover:opacity-90 text-white rounded-full font-bold shadow-md transition-all active:scale-95"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            {/* Pagination */}
            {sortedProducts.length > 0 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}

              </>
            )}

          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
