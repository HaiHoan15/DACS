import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../_Components/Footer";
import { getAllNews, getCategories, getLatestNews } from "../../../API/news";
import api from "../../../API/api";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for filter and search
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        // =============== CÁCH 1: LẤY TỪ MOCK DATA (GIẢ LẬP) ===============
        // Fake delay
        await new Promise(resolve => setTimeout(resolve, 300));

        setCategories(getCategories());
        setLatestNews(getLatestNews(5));

        let allNews = getAllNews();
        if (searchKeyword) {
          const kw = searchKeyword.toLowerCase();
          allNews = allNews.filter(n => 
            n.title.toLowerCase().includes(kw) || 
            n.summary.toLowerCase().includes(kw) || 
            n.content.toLowerCase().includes(kw)
          );
        }
        setNews(allNews);

        // =============== CÁCH 2: LẤY TỪ DATABASE THẬT (BỎ COMMENT KHI ĐÃ TẠO BẢNG) ===============
        /*
        // Fetch categories
        const catRes = await api.get("NewsController.php", { params: { action: "getCategories" } });
        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
        }

        // Fetch latest news
        const latestRes = await api.get("NewsController.php", { params: { action: "getLatest", limit: 5 } });
        if (latestRes.data.success) {
          setLatestNews(latestRes.data.news || []);
        }

        // Fetch all news or search
        const newsRes = await api.get("NewsController.php", { 
          params: { 
            action: searchKeyword ? "search" : "getAll",
            keyword: searchKeyword 
          } 
        });
        
        if (newsRes.data.success) {
          setNews(newsRes.data.news || []);
        } else {
          setError(newsRes.data.message || "Không thể tải tin tức");
        }
        */

      } catch (err) {
        setError("Lỗi khi tải dữ liệu tin tức");
      } finally {
        setLoading(false);
      }
    };
    fetchNewsData();
  }, [searchKeyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchKeyword(searchInput);
  };

  // Filter news by category
  const filteredNews = selectedCategory === "Tất cả" 
    ? news 
    : news.filter(item => item.category_name === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Decorative Banner (No title) */}
      <div 
        className="w-full h-48 md:h-64 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')` }}
      >
        <div className="w-full h-full bg-black/20"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 py-8 flex-grow">
        
        {/* Categories & Search Row */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 gap-4">
          <div className="flex flex-wrap gap-2 md:gap-4 items-center">
            <button 
              onClick={() => setSelectedCategory("Tất cả")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${selectedCategory === "Tất cả" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${selectedCategory === cat.name ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Bar - Aligned Right */}
          <form onSubmit={handleSearch} className="w-full md:w-auto flex items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
            <input 
              type="text" 
              placeholder="Tìm kiếm tin tức..." 
              className="bg-transparent border-none focus:ring-0 outline-none w-full md:w-64 text-sm text-gray-700"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="text-gray-500 hover:text-red-500 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main News Area - left side */}
          <div className="w-full lg:w-2/3">
            {loading ? (
              <div className="text-center py-10">Đang tải tin tức...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-10">{error}</div>
            ) : filteredNews.length > 0 ? (
              <div className="flex flex-col gap-6">
                
                {/* Featured (1st) Article */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                  <Link to={`/news/${filteredNews[0].id}`} className="block">
                    <div className="w-full h-80 overflow-hidden">
                      <img 
                        src={filteredNews[0].image?.startsWith('http') ? filteredNews[0].image : `/uploads/news/${filteredNews[0].image}`} 
                        alt={filteredNews[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/800x500?text=News"; }}
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                        {filteredNews[0].title}
                      </h2>
                      <p className="text-gray-600 line-clamp-3 mb-4">{filteredNews[0].content?.replace(/<[^>]*>?/gm, '')}</p>
                      <div className="text-sm text-gray-400 font-medium">{new Date(filteredNews[0].created_at).toLocaleDateString("vi-VN")}</div>
                    </div>
                  </Link>
                </div>

                {/* Sub Articles - Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNews.slice(1).map(article => (
                    <div key={article.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group flex flex-col">
                      <Link to={`/news/${article.id}`} className="flex-grow flex flex-col">
                        <div className="w-full h-48 overflow-hidden">
                          <img 
                            src={article.image?.startsWith('http') ? article.image : `/uploads/news/${article.image}`} 
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=News"; }}
                          />
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-grow">
                            {article.content?.replace(/<[^>]*>?/gm, '')}
                          </p>
                          <div className="text-xs text-gray-400 font-medium mt-auto">
                            {new Date(article.created_at).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-lg">Không tìm thấy bài viết nào.</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Latest News */}
          <div className="w-full lg:w-1/3">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                <h3 className="text-xl font-bold uppercase tracking-wide text-gray-900">Bài viết mới nhất</h3>
              </div>
              
              <div className="flex flex-col gap-6">
                {latestNews.length > 0 ? latestNews.map(item => (
                  <Link to={`/news/${item.id}`} key={item.id} className="group flex gap-4 items-start">
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
                      <img 
                        src={item.image?.startsWith('http') ? item.image : `/uploads/news/${item.image}`} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=News"; }}
                      />
                    </div>
                    <div className="flex flex-col justify-between pt-1">
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-3 group-hover:text-red-600 transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <span className="text-xs text-gray-400 font-medium mt-2 block">
                        {new Date(item.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </Link>
                )) : (
                  <p className="text-sm text-gray-500">Chưa có bài viết mới.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
