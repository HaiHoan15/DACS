import { useEffect, useState } from "react";
import AOS from "aos";

export default function TeamSection() {
    const trainers = [
        { name: "Nguyễn Minh Anh", desc: "Chuyên PT thể hình", image: "/images/about-page/trainer-1.jpg", specialty: "PT Bodybuilding" },
        { name: "Trần Hoàng Phúc", desc: "Chuyên cardio", image: "/images/about-page/trainer-2.jpg", specialty: "Cardio Training" },
        { name: "Lê Thanh Tùng", desc: "Yoga & Fitness", image: "/images/about-page/trainer-3.png", specialty: "Yoga" },
        { name: "Phạm Quốc Bảo", desc: "Gym nâng cao", image: "/images/about-page/trainer-4.png", specialty: "Advanced Training" },
        { name: "Đặng Gia Huy", desc: "PT chuyên sâu", image: "/images/about-page/trainer-5.jpg", specialty: "Personal Training" },
        { name: "Võ Minh Quân", desc: "Bodybuilding", image: "/images/about-page/trainer-6.jpg", specialty: "Bodybuilding" },
        { name: "Huỳnh Anh Khoa", desc: "Crossfit", image: "/images/about-page/trainer-7.png", specialty: "Crossfit" },
        { name: "Bùi Thành Đạt", desc: "Giảm cân", image: "/images/about-page/trainer-8.jpg", specialty: "Weight Loss" },
    ];

    //  clone để loop mượt
    const extended = [...trainers, ...trainers];

    const developers = [
        { name: "Nguyễn Hải Hoàng", desc: "Trụ cột chính trong phần phát triển hệ thống website THREEGYM.", image: "/images/about-page/dev-1.jpg", role: "Full Stack Developer" },
        { name: "Cao Đoàn Minh Trung", desc: "Nà ná na nà đoàn Cao đ... (chả biết ghi gì nên để đây đó)", image: "/images/about-page/dev-2.jpg", role: "Frontend Developer" },
        { name: "Trần Nguyễn Quốc Thái", desc: "Quốc vướng ThaiLan... (chả biết ghi gì nên để đây đó)", image: "/images/about-page/dev-3.jpg", role: "Backend Developer" },
    ];

    const [index, setIndex] = useState(0);

    useEffect(() => {
        AOS.init({ duration: 1000, once: false });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => prev + 1);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden"
            style={{ backgroundImage: "url('/images/about-page/trainer.jpg')" }}>

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
                <div className="absolute top-10 left-10 w-72 h-72 bg-red-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
            </div>

            {/* ================= TRAINERS SECTION ================= */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 mb-20 md:mb-32 relative z-10">

                {/* Header */}
                <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
                    <p className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full text-white text-sm font-semibold mb-4">
                        🏋️ ĐỘI NGŨ NHÂN VIÊN
                    </p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
                        Đội ngũ <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">Huấn luyện viên</span> hàng đầu
                    </h2>
                    <p className="text-gray-600 text-lg font-bold max-w-2xl mx-auto">
                        Những huấn luyện viên chuyên nghiệp với kinh nghiệm hơn 10 năm, sẵn sàng giúp bạn đạt mục tiêu fitness
                    </p>
                </div>

                {/* Slider Container */}
                <div className="relative group">
                    <div className="overflow-hidden rounded-2xl">
                        <div
                            className="flex transition-transform duration-700 ease-out"
                            style={{
                                transform: `translateX(-${index * 25}%)`,
                            }}
                        >
                            {extended.map((item, i) => (
                                <div key={i} className="w-1/4 px-2 md:px-3 flex-shrink-0">
                                    <div
                                        className="group/card h-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white backdrop-blur-sm border border-white/20 hover:border-red-400/50"
                                        data-aos="zoom-in"
                                        data-aos-delay={i % 4 * 100}
                                    >
                                        {/* Image Container */}
                                        <div className="relative overflow-hidden h-64 md:h-72 bg-gradient-to-br from-gray-200 to-gray-300">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>

                                            {/* Badge */}
                                            <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                {item.specialty}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 md:p-5 text-center">
                                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                                                {item.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm md:text-base">
                                                {item.desc}
                                            </p>
                                            <div className="mt-4 flex justify-center gap-2">
                                                {[...Array(3)].map((_, idx) => (
                                                    <div key={idx} className="w-1 h-1 rounded-full bg-gradient-to-r from-red-500 to-yellow-400"></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                        {trainers.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${i === index % trainers.length
                                    ? 'bg-gradient-to-r from-red-500 to-yellow-400 w-8'
                                    : 'bg-gray-300 w-2 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>

            </div>

            {/* ================= DEVELOPERS SECTION ================= */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">

                {/* Header */}
                <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
                    <p className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full text-white text-sm font-semibold mb-4">
                        💻 PHÁT TRIỂN
                    </p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
                        Đội ngũ <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Phát triển</span> chuyên nghiệp
                    </h2>
                    <p className="text-gray-600 text-lg font-bold max-w-2xl mx-auto">
                        Những lập trình viên tài năng đang vận hành hệ thống THREEGYM với công nghệ hiện đại
                    </p>
                </div>

                {/* Developer Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                    {developers.map((dev, i) => (
                        <div
                            key={i}
                            className="group/dev relative"
                            data-aos="flip-left"
                            data-aos-delay={i * 100}
                        >
                            <div className="relative h-full bg-gray-300 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-400/50">

                                {/* Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover/dev:opacity-100 transition-opacity duration-500"></div>

                                {/* Image Container */}
                                <div className="relative w-full h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                    <img
                                        src={dev.image}
                                        alt={dev.name}
                                        className="w-full h-full object-cover group-hover/dev:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                                </div>

                                {/* Content */}
                                <div className="relative p-6 md:p-7">
                                    <h3 className="font-bold text-gray-900 text-xl mb-2 group-hover/dev:text-blue-600 transition-colors">
                                        {dev.name}
                                    </h3>

                                    <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-3">
                                        {dev.desc}
                                    </p>

                                    {/* Divider */}
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-5"></div>

                                    {/* Skills dots */}
                                    {/* <div className="flex justify-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600"></div>
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                                    </div> */}
                                    <div className="absolute bottom-4 left-4 right-4 bg-white backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-bold text-blue-600 text-center">
                                        {dev.role}
                                    </div>
                                </div>
                            </div>

                            {/* Hover glow effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover/dev:opacity-10 blur transition-opacity duration-500 pointer-events-none"></div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Gradient line */}
            <div className="absolute bottom-0 left-0 w-full h-[10px] bg-gradient-to-r from-red-500 to-yellow-400"></div>

        </section>
    );
}