import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { getAllNews, getCategories, getLatestNews, news_categories } from "../../../API/news";
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

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const stripHtml = (html) => html?.replace(/<[^>]*>/g, "") || "";

export default function NewsPage() {
  const [allNews, setAllNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null); // null = Tất cả
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 300));
      setCategories(getCategories());
      setLatestNews(getLatestNews(5));
      setAllNews(getAllNews());
      setLoading(false);
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchKeyword(searchInput.trim());
    setSelectedCategory(null);
  };

  const clearSearch = () => {
    setSearchKeyword("");
    setSearchInput("");
  };

  const filteredNews = allNews
    .filter((n) => selectedCategory === null || n.category_id === selectedCategory)
    .filter((n) => {
      if (!searchKeyword) return true;
      const kw = searchKeyword.toLowerCase();
      return (
        n.title.toLowerCase().includes(kw) ||
        n.summary?.toLowerCase().includes(kw) ||
        stripHtml(n.content).toLowerCase().includes(kw)
      );
    });

  const featured = filteredNews[0] || null;
  const rest = filteredNews.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ---- Hero ---- */}
      <section className="np-hero">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
          alt="hero"
          className="np-hero-img"
        />
        <div className="np-hero-overlay" />
        <div className="np-hero-content">
          <span className="np-hero-tag">ThreeGym Media</span>
          <h1 className="np-hero-title">Tin Tức &amp; Sự Kiện</h1>
          <p className="np-hero-sub">Cập nhật thông tin mới nhất từ ThreeGym</p>
          <form onSubmit={handleSearch} className="np-hero-search">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="np-hero-search-btn" aria-label="Tìm kiếm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="16"
                height="16"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* ---- Main ---- */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 flex-grow">

        {/* Filter bar */}
        <div className="np-fade-up np-fade-up-1 flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="np-filters">
            <button
              onClick={() => { setSelectedCategory(null); clearSearch(); }}
              className={`np-filter-btn ${selectedCategory === null && !searchKeyword ? "active" : ""}`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); clearSearch(); }}
                className={`np-filter-btn ${selectedCategory === cat.id ? "active" : ""}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {searchKeyword && (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              Kết quả:{" "}
              <span className="font-semibold text-red-600">"{searchKeyword}"</span>
              <button
                onClick={clearSearch}
                className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 flex items-center justify-center text-xs transition-colors"
                aria-label="Xóa tìm kiếm"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Content + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ---- Main content ---- */}
          <div className="w-full lg:w-[65%]">
            {loading ? (
              <div className="space-y-6">
                <div className="np-skeleton h-80 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="np-skeleton h-48 rounded-xl" />
                      <div className="np-skeleton h-5 w-3/4" />
                      <div className="np-skeleton h-4 w-full" />
                      <div className="np-skeleton h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="np-empty bg-white rounded-2xl border border-gray-100 shadow-sm">
                <span className="np-empty-icon">📰</span>
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  Không tìm thấy bài viết
                </p>
                <p className="text-sm text-gray-400">
                  Thử tìm kiếm với từ khóa khác hoặc xem tất cả bài viết
                </p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Featured article */}
                {featured && (
                  <Link
                    to={`/news/${featured.id}`}
                    className="np-featured np-fade-up np-fade-up-2"
                  >
                    <div className="np-featured-img-wrap">
                      <img
                        src={
                          featured.image?.startsWith("http")
                            ? featured.image
                            : `/uploads/news/${featured.image}`
                        }
                        alt={featured.title}
                        className="np-featured-img"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop";
                        }}
                      />
                    </div>
                    <div className="np-featured-overlay">
                      <span className={`np-cat-badge ${getCatClass(featured.category_id)}`}>
                        {getCatName(featured.category_id)}
                      </span>
                      <h2 className="np-featured-title">{featured.title}</h2>
                      <div className="np-featured-meta">
                        <span>✍ {featured.author}</span>
                        <span className="np-featured-meta-dot" />
                        <span>📅 {formatDate(featured.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Article grid */}
                {rest.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 np-fade-up np-fade-up-3">
                    {rest.map((article) => (
                      <Link
                        key={article.id}
                        to={`/news/${article.id}`}
                        className="np-card"
                      >
                        <div className="np-card-img-wrap">
                          <img
                            src={
                              article.image?.startsWith("http")
                                ? article.image
                                : `/uploads/news/${article.image}`
                            }
                            alt={article.title}
                            className="np-card-img"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop";
                            }}
                          />
                        </div>
                        <div className="np-card-body">
                          <span className={`np-cat-badge ${getCatClass(article.category_id)}`}>
                            {getCatName(article.category_id)}
                          </span>
                          <h3 className="np-card-title">{article.title}</h3>
                          <p className="np-card-excerpt">
                            {article.summary || stripHtml(article.content).slice(0, 120)}
                          </p>
                          <div className="np-card-meta">
                            <span>{article.author}</span>
                            <span className="np-card-meta-dot" />
                            <span>{formatDate(article.created_at)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>

          {/* ---- Sidebar ---- */}
          <aside className="w-full lg:w-[35%] space-y-5 np-fade-up np-fade-up-4">

            {/* Latest news */}
            <div className="np-sidebar-box">
              <div className="np-sidebar-heading">🔥 Bài viết mới nhất</div>
              {latestNews.map((item) => (
                <Link key={item.id} to={`/news/${item.id}`} className="np-sidebar-item">
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
                    <p className="np-sidebar-item-date">{formatDate(item.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Categories */}
            <div className="np-sidebar-box pb-2">
              <div className="np-sidebar-heading">📂 Danh mục</div>
              <div className="pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setSearchKeyword(""); setSearchInput(""); }}
                    className="np-sidebar-cat-btn"
                  >
                    <span>{cat.name}</span>
                    <span className="np-sidebar-cat-count">
                      {allNews.filter((n) => n.category_id === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>

    
    </div>
  );
}
