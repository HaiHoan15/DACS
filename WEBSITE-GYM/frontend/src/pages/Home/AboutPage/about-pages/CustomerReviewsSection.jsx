import { FaStar, FaQuoteLeft } from "react-icons/fa";

const reviews = [
  {
    name: "Nguyễn Minh Khoa",
    role: "Hội viên 6 tháng",
    avatar: "NK",
    stars: 5,
    text: "ThreeGYM có không gian rất hiện đại và máy móc đầy đủ. Sau 3 tháng tập mình đã giảm được 8kg. Sẽ tiếp tục gắn bó lâu dài!",
    gradient: "from-red-600 to-orange-500",
    delay: 0,
  },
  {
    name: "Trần Thị Hoa",
    role: "Hội viên 1 năm",
    avatar: "TH",
    stars: 5,
    text: "Huấn luyện viên rất nhiệt tình và hỗ trợ từng bài tập rất chi tiết. Mình rất hài lòng với chất lượng dịch vụ tại đây.",
    gradient: "from-yellow-500 to-orange-400",
    delay: 150,
  },
  {
    name: "Phạm Văn Long",
    role: "Hội viên Premium",
    avatar: "VL",
    stars: 5,
    text: "Đây là phòng gym tốt nhất mình từng tập. Không gian rộng rãi, sạch sẽ và rất chuyên nghiệp. Cực kỳ đáng đồng tiền!",
    gradient: "from-orange-500 to-red-500",
    delay: 300,
  },
];

export default function CustomerReviewsSection() {
  return (
    <section className="relative py-24 bg-[#080c14] overflow-hidden">
      {/* Top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

      {/* Background glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/8 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block text-xs font-bold tracking-[4px] uppercase text-yellow-400 mb-4">
            ⭐ Đánh giá từ khách hàng
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
            Khách hàng{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400">
              nói gì về chúng tôi?
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Hơn 98% hội viên hài lòng và sẵn lòng giới thiệu ThreeGYM cho bạn
            bè và gia đình.
          </p>
        </div>

        {/* Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div
              key={i}
              data-aos="zoom-in"
              data-aos-delay={review.delay}
              className="
                group relative rounded-2xl p-8
                bg-white/3 border border-white/8
                hover:border-white/20 hover:-translate-y-2
                transition-all duration-500
              "
            >
              {/* Quote icon */}
              <FaQuoteLeft className="text-red-500/30 text-5xl mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(review.stars)].map((_, j) => (
                  <FaStar key={j} className="text-yellow-400 text-lg" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-300 text-base leading-relaxed mb-8 italic">
                "{review.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                {/* Avatar circle */}
                <div
                  className={`
                    w-12 h-12 rounded-full
                    bg-gradient-to-br ${review.gradient}
                    flex items-center justify-center
                    text-white font-bold text-base
                    shadow-lg flex-shrink-0
                  `}
                >
                  {review.avatar}
                </div>

                <div>
                  <p className="font-bold text-white">{review.name}</p>
                  <p className="text-gray-500 text-sm">{review.role}</p>
                </div>
              </div>

              {/* Bottom accent */}
              <div
                className={`
                  absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full
                  bg-gradient-to-r ${review.gradient}
                  transition-all duration-500 rounded-b-2xl
                `}
              />
            </div>
          ))}
        </div>

        {/* Overall rating */}
        <div
          className="mt-14 flex flex-col items-center gap-3"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="text-yellow-400 text-2xl" />
            ))}
          </div>
          <p className="text-gray-400 text-center">
            <span className="text-white font-bold text-xl">5.0/5</span> — Đánh
            giá trung bình từ hơn{" "}
            <span className="text-yellow-400 font-semibold">500+ hội viên</span>
          </p>
        </div>
      </div>
    </section>
  );
}
