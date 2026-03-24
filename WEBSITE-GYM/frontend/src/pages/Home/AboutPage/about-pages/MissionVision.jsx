import { useEffect } from "react";
import AOS from "aos";

export default function MissionVision() {
    const data = [
        {
            title: "Sứ mệnh",
            desc: "Mang đến môi trường tập luyện hiện đại, giúp mọi người cải thiện sức khỏe, vượt qua giới hạn và xây dựng lối sống tích cực.",
            image: "/images/about-page/mission-vision-2.webp",
            icon: "🎯",
            color: "from-red-500 to-orange-500"
        },
        {
            title: "Tầm nhìn",
            desc: "Trở thành hệ thống phòng gym hàng đầu, ứng dụng công nghệ hiện đại và tạo ra cộng đồng tập luyện mạnh mẽ.",
            image: "/images/about-page/mission-vision-3.jpg",
            icon: "🚀",
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "Giá trị",
            desc: "Cam kết chất lượng – Tận tâm với khách hàng – Không ngừng đổi mới – Xây dựng cộng đồng năng động, chất lượng.",
            image: "/images/about-page/mission-vision-4.jpg",
            icon: "💎",
            color: "from-purple-500 to-pink-500"
        },
    ];

    useEffect(() => {
        AOS.init({ duration: 1000, once: false });
    }, []);

    return (
        <section
            className="relative py-24 md:py-32 overflow-hidden"
            style={{
                backgroundImage: "url('/images/about-page/mission-vision-1.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed"
            }}
        >
            {/* Gradient line */}
            <div className="absolute top-0 left-0 w-full h-[10px] bg-gradient-to-r from-red-500 to-yellow-400"></div>

            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
                <div className="absolute top-20 right-10 w-72 h-72 bg-red-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-80 h-80 bg-yellow-400 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">

                {/* Title */}
                <div className="text-center mb-12 md:mb-20" data-aos="fade-up">
                    <p className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full text-white text-sm font-semibold mb-4">
                        ⭐ CORE VALUES
                    </p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
                        <span className="text-gray-900">Sứ mệnh – Tầm nhìn – </span>
                        <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                            Giá trị
                        </span>
                    </h2>
                    <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
                        Ba trụ cột giúp THREEGYM trở thành nơi lý tưởng để bạn theo đuổi đam mê fitness
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6 md:gap-8">

                    {data.map((item, index) => (
                        <div
                            key={index}
                            data-aos="flip-left"
                            data-aos-delay={index * 100}
                            className="group relative overflow-hidden"
                        >
                            {/* Card Container */}
                            <div className="relative h-full bg-white/70 backdrop-blur-lg rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/40 hover:border-white/80 overflow-hidden">

                                {/* Gradient Background on Hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                                {/* IMAGE Container */}
                                <div className="relative h-56 md:h-64 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                                    {/* Icon Badge */}
                                    <div className="absolute top-4 right-4 text-4xl bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/40">
                                        {item.icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="relative p-6 md:p-8">
                                    {/* Title */}
                                    <h3 className={`text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                                        {item.title}
                                    </h3>

                                    {/* Divider Line */}
                                    <div className={`w-12 h-1 bg-gradient-to-r ${item.color} rounded-full mb-4`}></div>

                                    {/* Description */}
                                    <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium line-clamp-4 group-hover:line-clamp-none transition-all">
                                        {item.desc}
                                    </p>

                                    {/* Bottom Accent */}
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className={`h-1 flex-1 bg-gradient-to-r ${item.color} opacity-30`}></div>
                                    </div>
                                </div>

                                {/* Glow Effect on Hover */}
                                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 pointer-events-none`}></div>
                            </div>

                        </div>
                    ))}

                </div>

            </div>

            {/* Gradient line */}
            <div className="absolute bottom-0 left-0 w-full h-[10px] bg-gradient-to-r from-red-500 to-yellow-400"></div>
        </section>
    );
}