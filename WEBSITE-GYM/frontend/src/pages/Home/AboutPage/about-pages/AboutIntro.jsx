export default function AboutIntro() {
    return (
        <section
            className="relative w-full min-h-[600px] flex items-center bg-cover bg-center"
            style={{ backgroundImage: "url('/images/about-page/about-intro-2.png')" }}
        >
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

                {/* LEFT CONTENT */}
                <div data-aos="fade-right">

                    {/* Title */}
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
                        <span className="text-gray-900">Giới thiệu về </span>
                        <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                            THREEGYM
                        </span>
                    </h2>

                    {/* Line */}
                    <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-yellow-400 mb-6 rounded-full"></div>

                    {/* Content */}
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">
                        THREEGYM không chỉ là một phòng tập, mà còn là nơi bạn bắt đầu hành trình thay đổi bản thân.
                        Chúng tôi mang đến môi trường tập luyện hiện đại, trang bị đầy đủ máy móc tiên tiến cùng đội ngũ huấn luyện viên giàu kinh nghiệm.
                    </p>

                    <p className="text-gray-700 leading-relaxed">
                        Với cộng đồng năng động và tinh thần không ngừng phát triển, THREEGYM sẽ giúp bạn vượt qua giới hạn,
                        nâng cao sức khỏe và xây dựng lối sống tích cực mỗi ngày.
                    </p>

                    {/* Highlight */}
                    <div className="mt-8 flex flex-wrap gap-4">
                        <span className="px-4 py-2 bg-red-500/10 text-red-500 rounded-full text-sm font-semibold">
                            💪 Thiết bị hiện đại
                        </span>
                        <span className="px-4 py-2 bg-yellow-400/20 text-yellow-600 rounded-full text-sm font-semibold">
                            🔥 HLV chuyên nghiệp
                        </span>
                        <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold">
                            ⚡ Môi trường năng động
                        </span>
                    </div>

                </div>

                {/* RIGHT IMAGE */}
                <div
                    className="w-full max-w-[500px] rounded-2xl shadow-xl object-cover transition duration-500 hover:scale-105"
                    data-aos="fade-left"
                >
                    <img
                        src="/images/about-page/about-intro-1.jpg" //  tự thay ảnh
                        alt="About gym"
                        className="w-full max-w-[500px] rounded-2xl shadow-xl object-cover"
                    />
                </div>
            </div>
            {/* Gradient line dưới */}
            <div className="absolute bottom-0 left-0 w-full h-[10px] bg-gradient-to-r from-red-500 to-yellow-400"></div>
        </section>
    );
}