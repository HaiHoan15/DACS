import { useState } from "react";
import Category from "./Category";
import Product from "./Product";

export default function ProductManagement() {
  const [activeTab, setActiveTab] = useState("product");

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-red-500">QUẢN LÝ</span>
            <span className="text-yellow-500 ml-2">SẢN PHẨM</span>
          </h1>
          <p className="text-gray-400">Quản lý danh mục và sản phẩm của cửa hàng</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("product")}
            className={`px-6 py-3 font-medium transition border-b-2 ${activeTab === "product"
                ? "text-red-500 border-red-500"
                : "text-gray-400 border-transparent hover:text-gray-300"
              }`}
          >
            Sản phẩm
          </button>
          <button
            onClick={() => setActiveTab("category")}
            className={`px-6 py-3 font-medium transition border-b-2 ${activeTab === "category"
                ? "text-red-500 border-red-500"
                : "text-gray-400 border-transparent hover:text-gray-300"
              }`}
          >
            Danh mục
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "category" && <Category />}
        {activeTab === "product" && <Product />}
      </div>
    </div>
  );
}