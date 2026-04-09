import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const { name, category, price, image, description } = product;

  // Hàm format giá với dấu chấm và VND
  const formatPrice = (priceValue) => {
    return Math.floor(priceValue).toLocaleString('vi-VN') + ' VND';
  };

  return (
    <div className="group relative w-full h-[380px] rounded-xl overflow-hidden bg-white shadow-md border border-gray-200 flex flex-col hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 cursor-pointer">
      
      {/* 1. Phần hình ảnh sản phẩm */}
      <div className="h-1/2 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Ngăn chặn infinite loop nếu ảnh fallback cũng bị lỗi tải (gây trắng trang)
            const fallbackSrc = "images/error/product-2.jpg"; // Đường dẫn ảnh lỗi chung
            if (e.currentTarget.src !== fallbackSrc) {
              e.currentTarget.src = fallbackSrc;
            }
          }}
        />
      </div>
      
      {/* 2. Phần nội dung mặc định của thẻ */}
      <div className="p-5 flex flex-col h-1/2 justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{name}</h3>
          <p className="text-emerald-600 font-medium text-sm mb-2">{category}</p>
        </div>
        
        {/* Bảng giá và nút Mua ngay nằm cùng 1 hàng */}
        <div className="flex justify-between items-center relative z-20">
          <div className="flex flex-col">
             <span className="text-xs text-gray-500">Giá bán</span>
             <span className="text-xl font-bold text-red-600">{formatPrice(price)}</span>
          </div>
          <Link to="/login" className="bg-gradient-to-r from-red-500 to-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap text-center">
            Mua ngay
          </Link>
        </div>
      </div>

      {/* 3. Lớp phủ Mô tả (hiện lên khi hover chuột) */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-start z-10 border border-yellow-400">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{name}</h3>
        <p className="text-gray-700 text-base leading-relaxed">{description}</p>
      </div>

    </div>
  );
}
