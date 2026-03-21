export default function History() {
    const timeline = [
        {
            year: "2018",
            title: "Khởi đầu hành trình",
            desc: "THREEGYM được thành lập với sứ mệnh mang đến môi trường tập luyện chuyên nghiệp và hiện đại.",
            image: "/images/about-page/history-2.jpg",
        },
        {
            year: "2020",
            title: "Mở rộng quy mô",
            desc: "Nâng cấp hệ thống máy móc và mở rộng không gian tập luyện, thu hút hàng trăm hội viên.",
            image: "/images/about-page/history-3.jpg",
        },
        {
            year: "2022",
            title: "Phát triển cộng đồng",
            desc: "Xây dựng cộng đồng tập luyện năng động với nhiều chương trình huấn luyện chuyên sâu.",
            image: "/images/about-page/history-4.avif",
        },
        {
            year: "2024",
            title: "Định hướng tương lai",
            desc: "Ứng dụng công nghệ và AI vào quản lý tập luyện, nâng cao trải nghiệm người dùng.",
            image: "/images/about-page/history-5.webp",
        },
        {
            year: "2026",
            title: "Tập trung phát triển",
            desc: "Mở rộng mạng lưới phòng tập và nâng cao chất lượng dịch vụ tốt nhất cho khách hàng.",
            image: "/images/about-page/history-6.webp",
        },
    ];

    return (
        <section
            className="py-20 bg-repeat bg-top"
            style={{ backgroundImage: "url('/images/about-page/history-1.jpg')" }}
        >
            <div className="max-w-6xl mx-auto px-6">

                {/* Title */}
                <h2
                    className="text-3xl md:text-5xl font-extrabold text-center mb-16"
                    data-aos="fade-down"
                >
                    <span className="text-white">Lịch sử phát triển </span>
                    <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                        THREEGYM
                    </span>
                </h2>

                {/* Timeline */}
                <div className="relative">

                    {/* Line giữa (FIXED) */}
                    <div className="absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2 w-[3px] bg-gradient-to-b from-red-500 to-yellow-400"></div>

                    {timeline.map((item, index) => (
                        <div
                            key={index}
                            className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                                } ${index !== timeline.length - 1 ? "mb-16" : ""}`}
                            data-aos={index % 2 === 0 ? "fade-left" : "fade-right"}
                        >

                            {/* CONTENT */}
                            <div className="w-full md:w-1/2 px-6">
                                <div className="bg-white/90 backdrop-blur p-6 rounded-xl shadow-md hover:shadow-lg transition">

                                    {/* Image */}
                                    <div className="overflow-hidden rounded-lg mb-4">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-[250px] object-cover transition duration-500 hover:scale-105"
                                        />
                                    </div>

                                    {/* Text */}
                                    <h3 className="text-2xl font-bold mb-2 text-red-500">
                                        {item.year}
                                    </h3>

                                    <h4 className="text-xl font-semibold mb-2 text-gray-900">
                                        {item.title}
                                    </h4>

                                    <p className="text-gray-700">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Dot */}
                            <div className="hidden md:flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full border-4 border-white z-10">
                            </div>

                            {/* Spacer */}
                            <div className="w-full md:w-1/2"></div>

                        </div>
                    ))}

                </div>

            </div>
            {/* gradient line dưới đã chuyển sang MissionVision.jsx để tránh lỗi */}
        </section>
    );
}