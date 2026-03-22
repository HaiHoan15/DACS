export default function MissionVision() {
    const data = [
        {
            title: "Sứ mệnh",
            desc: "Mang đến môi trường tập luyện hiện đại, giúp mọi người cải thiện sức khỏe, vượt qua giới hạn và xây dựng lối sống tích cực.",
            image: "/images/about-page/mission-vision-2.webp",
        },
        {
            title: "Tầm nhìn",
            desc: "Trở thành hệ thống phòng gym hàng đầu, ứng dụng công nghệ hiện đại và tạo ra cộng đồng tập luyện mạnh mẽ.",
            image: "/images/about-page/mission-vision-3.jpg",
        },
        {
            title: "Giá trị",
            desc: "Cam kết chất lượng – Tận tâm với khách hàng – Không ngừng đổi mới – Xây dựng cộng đồng năng động, chất lượng.",
            image: "/images/about-page/mission-vision-4.jpg",
        },
    ];

    return (
        <section
            className="relative py-20 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/about-page/mission-vision-1.png')" }}
        >
            {/* Gradient line */}
            <div className="absolute top-0 left-0 w-full h-[10px] bg-gradient-to-r from-red-500 to-yellow-400"></div>

            <div className="max-w-7xl mx-auto px-6">

                {/* Title */}
                <h2
                    className="text-3xl md:text-5xl font-extrabold text-center mb-16"
                    data-aos="fade-up"
                >
                    <span className="text-gray-900">Sứ mệnh – Tầm nhìn – </span>
                    <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                        Giá trị
                    </span>
                </h2>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-8">

                    {data.map((item, index) => (
                        <div
                            key={index}
                            data-aos="zoom-in"
                            data-aos-delay={index * 100}
                            className="group bg-black/50 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-[0_0_30px_rgba(255,0,0,0.3)] transition duration-300 hover:-translate-y-2 border border-white/10"
                        >

                            {/* IMAGE */}
                            <div className="mb-4 overflow-hidden rounded-xl">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-[180px] object-cover transition duration-500 group-hover:scale-110"
                                />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold mb-3 text-white text-center group-hover:text-red-400 transition">
                                {item.title}
                            </h3>

                            {/* Line */}
                            <div className="w-10 h-[3px] bg-gradient-to-r from-red-500 to-yellow-400 mb-4 mx-auto rounded-full"></div>

                            {/* Desc */}
                            <p className="text-gray-300 text-sm font-bold leading-relaxed text-center">
                                {item.desc}
                            </p>

                        </div>
                    ))}

                </div>

            </div>
            {/* Gradient line */}
            <div className="absolute bottom-0 left-0 w-full h-[10px] bg-gradient-to-r from-red-500 to-yellow-400"></div>
        </section>
    );
}