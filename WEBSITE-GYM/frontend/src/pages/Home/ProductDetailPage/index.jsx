import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../API/api";
import Notification from "../../../components/Notification";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken") || "temp-token";
        
        // Fetch product detail
        const res = await api.get("ProductController.php", {
          params: { action: "getById", productId },
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.data.success) {
          setProduct(res.data.product);
        } else {
          setError(res.data.message || "Không tìm thấy sản phẩm");
        }
      // eslint-disable-next-line no-unused-vars
      } catch (_err) {
        setError("Lỗi kết nối hoặc không được phép truy cập server");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleDecreaseItem = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncreaseItem = () => {
    // Arbitrary limit
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  const handleBuyNow = async () => {
    if (isAddingToCart) return;
    
    try {
      setIsAddingToCart(true);
      const response = await api.post("WishlistController.php",
        { productId: product.id, quantity: quantity, userId: user?.id || 1 },
        { params: { action: "add" } }
      );
      
      if (response.data.success) {
        setNotification({
          message: `Đã thêm ${quantity} sản phẩm '${product.name}' vào giỏ hàng với tổng tiền: ${(product.price * quantity).toLocaleString('vi-VN')}đ`,
          type: "success"
        });
        setQuantity(1);
      } else {
        setNotification({
          message: response.data.message || "Không thể thêm vào giỏ hàng",
          type: "error"
        });
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      setNotification({
        message: "Lỗi kết nối server",
        type: "error"
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">Đang tải chi tiết sản phẩm...</p>
        </div>
       
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi tải sản phẩm</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/product" className="text-blue-600 hover:underline">← Quay lại danh sách sản phẩm</Link>
        </div>
      
      </div>
    );
  }

  // Formatting utils
  const displayPrice = parseInt(product.price, 10);
  const totalPrice = displayPrice * quantity;
  const imageUrl = product.avatar?.startsWith('http') ? product.avatar : `/uploads/products/${product.avatar}`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-4 py-8 flex-grow">
        
        {/* Breadcrumb and Back Button */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 text-lg font-medium">
          <div className="text-gray-500 flex items-center gap-2">
            <Link to="/product" className="hover:text-blue-600">Sản phẩm</Link>
            <span>/</span>
            <span className="text-gray-900">{product.category_name || 'Khác'}</span>
            <span>/</span>
            <span className="text-blue-600">{product.id}</span>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>

        {/* Main Product Section */}
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Left Column: Image */}
          <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden border border-gray-100" style={{ height: '500px' }}>
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover drop-shadow-md"
              onError={(e) => { e.target.src = "/images/error/product.png"; }}
            />
          </div>

          {/* Right Column: Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1a202c] mb-4">
              {product.name}
            </h1>
            
            <div className="flex flex-col gap-2 mb-6">
              {/* Optional Manufacturer (Not in DB, adding just to match layout structure visually) */}
              <p className="text-blue-600 font-medium">Thương hiệu: <span className="font-normal text-gray-700">GymTools</span></p>
              <p className="text-orange-600 font-medium">Thể loại: <span className="font-normal text-gray-700">{product.category_name || 'Dụng cụ tập gym'}</span></p>
            </div>

            <div className="text-gray-600 mb-10 leading-relaxed max-w-lg">
              {product.description || 'Sản phẩm tập gym cao cấp và an toàn.'}
            </div>

            {/* Quantity and Price Row */}
            <div className="flex items-end justify-between border-t border-gray-100 pt-8 mb-8">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Số lượng</span>
                <div className="flex items-center bg-gray-200 rounded-md select-none">
                  <button 
                    onClick={handleDecreaseItem}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-300 hover:text-black transition-colors rounded-l-md font-bold text-lg"
                  >
                    -
                  </button>
                  <div className="w-12 h-10 flex items-center justify-center bg-gray-100 font-medium border-x border-gray-300">
                    {quantity}
                  </div>
                  <button 
                    onClick={handleIncreaseItem}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-300 hover:text-black transition-colors rounded-r-md font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold text-gray-500">Thành tiền</span>
                <span className="text-4xl font-extrabold text-[#d95c1c]">
                  {totalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            {/* Buy Button */}
            <button 
              onClick={handleBuyNow}
              disabled={isAddingToCart}
              className="w-full bg-[#5252e6] hover:bg-[#3d3dcc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {isAddingToCart ? "Đang thêm..." : "Mua ngay"}
            </button>

          </div>
        </div>
      </div>
     
      {/* Notification */}
      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          showIcon={true}
        />
      )}
    </div>
  );
}