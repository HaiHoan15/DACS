import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../_Components/Footer";
import { getNewsById, getLatestNews } from "../../../API/news";
import api from "../../../API/api";

export default function NewsDetail() {
  const { newsId } = useParams();
  const [article, setArticle] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetail = async () => {
      try {
        setLoading(true);

        // =============== CÁCH 1: LẤY TỪ MOCK DATA (GIẢ LẬP) ===============
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const n = getNewsById(newsId);
        if (n) {
          setArticle(n);
        } else {
          setError("Không tìm thấy bài viết");
        }

        setLatestNews(getLatestNews(5));

        // =============== CÁCH 2: LẤY TỪ DATABASE THẬT (BỎ COMMENT KHI ĐÃ TẠO BẢNG) ===============
        /*
        // Lấy chi tiết bài viết
        const res = await api.get("NewsController.php", { 
          params: { action: "getById", newsId } 
        });
        
        if (res.data.success) {
          setArticle(res.data.news);
        } else {
          setError(res.data.message || "Không tìm thấy bài viết");
        }

        // Lấy tin mới nhất cho sidebar
        const latestRes = await api.get("NewsController.php", { 
          params: { action: "getLatest", limit: 5 } 
        });
        if (latestRes.data.success) {
          setLatestNews(latestRes.data.news || []);
        }
        */

      } catch (err) {
        setError("Lỗi khi tải dữ liệu chi tiết tin tức");
      } finally {
        setLoading(false);
      }
    };
    if (newsId) {
      fetchDetail();
    }
  }, [newsId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">Đang tải bài viết...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy bài viết</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/news" className="text-red-600 hover:underline">Quay lại trang tin tức</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-4 py-12 flex-grow">
        
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Article Focus */}
          <div className="w-full lg:w-[68%]">
            {/* Breakcrumb / Category */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-medium uppercase tracking-wide">
              <Link to="/news" className="hover:text-red-600 transition-colors">Tin tức</Link>
              <span>›</span>
              <span className="text-red-600">{article.category_name || "Bài viết"}</span>
            </div>

            {/* Normal Title (No banner here as requested) */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center text-sm text-gray-500 mb-8 pb-4 border-b border-gray-100 font-medium">
              <span>{new Date(article.created_at).toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Format like VNExpress: rich text content layout, strong semantic HTML */}
            <article 
              className="prose prose-lg max-w-none text-gray-800 
              prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-red-600 hover:prose-a:text-red-800
              prose-img:rounded-xl prose-img:shadow-sm"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />
          </div>

          {/* Right Sidebar - Latest News */}
          <div className="w-full lg:w-[32%] lg:pl-6 lg:border-l border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold uppercase text-gray-900">Bài viết mới nhất</h3>
              </div>
              
              <div className="flex flex-col gap-5">
                {latestNews.length > 0 ? latestNews.map(item => (
                  <Link to={`/news/${item.id}`} key={item.id} className="group flex gap-4 items-start">
                    <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      <img 
                        src={item.image?.startsWith('http') ? item.image : `/uploads/news/${item.image}`} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=News"; }}
                      />
                    </div>
                    <div className="flex flex-col pt-1">
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-3 group-hover:text-red-600 transition-colors leading-snug">
                        {item.title}
                      </h4>
                    </div>
                  </Link>
                )) : null}
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
