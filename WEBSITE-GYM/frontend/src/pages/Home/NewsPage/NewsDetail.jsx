import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import { getNewsById, getLatestNews, news_categories } from "../../../API/news";
import "./NewsPage.css";

// ---- Helpers ----
const getCatName = (catId) => {
  const c = news_categories.find((x) => x.id === catId);
  return c ? c.name : "Tin tức";
};

const getCatClass = (catId) => {
  const map = { 1: "np-cat-1", 2: "np-cat-2", 3: "np-cat-3" };
  return map[catId] || "np-cat-1";
};

const formatDateFull = (dateStr) =>
  new Date(dateStr).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatDateShort = (dateStr) =>
  new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function NewsDetail() {
  const { newsId } = useParams();
  const [article, setArticle] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 300));
      const n = getNewsById(newsId);
      if (n) {
        setArticle(n);
      } else {
        setError("Không tìm thấy bài viết");
      }
      setLatestNews(getLatestNews(5));
      setLoading(false);
    };
    if (newsId) load();
  }, [newsId]);

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 py-12 flex-grow space-y-5">
          <div className="np-skeleton h-5 w-48 rounded-full" />
          <div className="np-skeleton h-10 w-3/4 rounded-xl" />
          <div className="np-skeleton h-5 w-56 rounded-full" />
          <div className="np-skeleton h-96 w-full rounded-2xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="np-skeleton h-5 w-full rounded" />
            ))}
          </div>
        </div>

      </div>
    );
  }

  /* ---- Error state ---- */
  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <span style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.35 }}>📰</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy bài viết</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            to="/news"
            className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold text-sm hover:bg-red-700 transition-colors"
          >
            ← Quay lại trang tin tức
          </Link>
        </div>
       
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-4 py-10 flex-grow">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 np-fade-up flex-wrap">
          <Link to="/" className="hover:text-red-600 transition-colors font-medium">
            Trang chủ
          </Link>
          <span className="text-gray-300">›</span>
          <Link to="/news" className="hover:text-red-600 transition-colors font-medium">
            Tin tức
          </Link>
          <span className="text-gray-300">›</span>
          <span className={`np-cat-badge ${getCatClass(article.category_id)}`}>
            {getCatName(article.category_id)}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* ---- Article ---- */}
          <article className="w-full lg:w-[65%] np-fade-up np-fade-up-1">

            {/* Header */}
            <header className="mb-7">
              <span className={`np-cat-badge ${getCatClass(article.category_id)} mb-3 inline-block`}>
                {getCatName(article.category_id)}
              </span>

              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-5 tracking-tight">
                {article.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500 pb-5 border-b border-gray-200 flex-wrap">
                {/* Author avatar */}
                <div className="flex items-center gap-2.5">
                  <div className="np-author-avatar">
                    {article.author?.[0]?.toUpperCase() || "A"}
                  </div>
                  <span className="font-semibold text-gray-700">{article.author}</span>
                </div>

                <span className="text-gray-300 hidden sm:block">·</span>

                <div className="flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{formatDateFull(article.created_at)}</span>
                </div>
              </div>
            </header>

            {/* Hero image */}
            <img
              src={
                article.image?.startsWith("http")
                  ? article.image
                  : `/uploads/news/${article.image}`
              }
              alt={article.title}
              className="np-article-hero"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop";
              }}
            />

            {/* Summary */}
            {article.summary && (
              <div className="np-article-summary">{article.summary}</div>
            )}

            {/* Body */}
            <div
              className="np-article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Back */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white transition-all duration-300"
              >
                ← Quay lại trang tin tức
              </Link>
            </div>
          </article>

          {/* ---- Sidebar ---- */}
          <aside className="w-full lg:w-[35%] np-fade-up np-fade-up-2">
            <div className="np-sidebar-box sticky top-4">
              <div className="np-sidebar-heading">🔥 Bài viết mới nhất</div>
              {latestNews.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className={`np-sidebar-item ${
                    item.id === article.id ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <img
                    src={
                      item.image?.startsWith("http")
                        ? item.image
                        : `/uploads/news/${item.image}`
                    }
                    alt={item.title}
                    className="np-sidebar-thumb"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=150&auto=format&fit=crop";
                    }}
                  />
                  <div>
                    <p className="np-sidebar-item-title">{item.title}</p>
                    <p className="np-sidebar-item-date">{formatDateShort(item.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>

        </div>
      </div>
      
    </div>
  );
}
