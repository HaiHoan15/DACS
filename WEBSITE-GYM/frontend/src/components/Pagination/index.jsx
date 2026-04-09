import React, { useState } from "react";

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) {
  const [inputPage, setInputPage] = useState(currentPage);

  // Hàm xử lý khi người dùng nhập số trang
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = parseInt(inputPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setInputPage(page);
    } else {
      alert(`Vui lòng nhập số từ 1 đến ${totalPages}`);
      setInputPage(currentPage);
    }
  };

  // Hàm tạo danh sách page numbers để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Số trang hiển thị trực tiếp (không tính ellipsis)

    if (totalPages <= maxVisible + 2) {
      // Nếu tổng số trang ít, hiển thị hết
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang 1
      pages.push(1);

      // Tính phạm vi trang xung quanh trang hiện tại
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Luôn hiển thị trang cuối cùng
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col items-center justify-center gap-6 mt-10">
      {/* Pagination buttons */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Back button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed bg-gray-100"
              : "text-blue-600 hover:bg-blue-50 active:scale-95"
          }`}
        >
          ← Back
        </button>

        {/* Page numbers */}
        {pages.map((page, idx) => (
          <div key={idx}>
            {page === "..." ? (
              <span className="px-2 py-2 text-gray-400">...</span>
            ) : (
              <button
                onClick={() => {
                  onPageChange(page);
                  setInputPage(page);
                }}
                disabled={page === currentPage}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  page === currentPage
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
                }`}
              >
                {page}
              </button>
            )}
          </div>
        ))}

        {/* Next button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed bg-gray-100"
              : "text-blue-600 hover:bg-blue-50 active:scale-95"
          }`}
        >
          Next →
        </button>
      </div>

      {/* Go to page input */}
      <form onSubmit={handleGoToPage} className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Đến trang:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all active:scale-95"
        >
          Go
        </button>
      </form>

      {/* Page info */}
      <div className="text-sm text-gray-500">
        Trang <span className="font-bold text-gray-700">{currentPage}</span> / <span className="font-bold text-gray-700">{totalPages}</span>
      </div>
    </div>
  );
}
