import { useEffect } from "react";
import AOS from "aos";

export default function ContactSection() {
    useEffect(() => {
        AOS.init({ duration: 1000, once: false });
    }, []);

    return (
        <section className="relative py-20" style={{ backgroundColor: "#0d0d0e" }}>
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-20 right-20 w-80 h-80 bg-red-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">

                {/* TITLE SECTION */}
                <div className="text-center mb-16 md:mb-20" data-aos="fade-up">
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full text-white text-sm font-semibold mb-4">
                        LIÊN HỆ VỚI CHÚNG TÔI
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4">
                        Hãy để <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">THREEGYM</span> đồng hành cùng với bạn
                    </h2>
                    <p className="text-gray-300 text-lg font-medium max-w-2xl mx-auto">
                        Liên hệ với chúng tôi ngay để được tư vấn về các gói tập luyện phù hợp với mục tiêu của bạn
                    </p>
                </div>

                {/* FORM CONTAINER */}
                <div className="max-w-4xl mx-auto" data-aos="zoom-in">

                    <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 hover:border-red-400/30 transition-all duration-500">

                        {/* GRID */}
                        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8">

                            {/* NAME */}
                            <div className="group">
                                <label className="block text-white font-bold mb-3 group-hover:text-red-400 transition-colors">
                                    Họ và tên <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập họ tên của bạn"
                                    className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:border-white/40"
                                />
                            </div>

                            {/* EMAIL */}
                            <div className="group">
                                <label className="block text-white font-bold mb-3 group-hover:text-yellow-400 transition-colors">
                                    Email <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:border-white/40"
                                />
                            </div>

                        </div>

                        {/* PHONE */}
                        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8">
                            <div className="group">
                                <label className="block text-white font-bold mb-3 group-hover:text-red-400 transition-colors">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    placeholder="0123 456 789"
                                    className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:border-white/40"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-white font-bold mb-3 group-hover:text-yellow-400 transition-colors">
                                    Nhu cầu
                                </label>
                                <select className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:border-white/40">
                                    <option className="text-gray-900">Chọn nhu cầu của bạn</option>
                                    <option className="text-gray-900">Tư vấn gói tập luyện</option>
                                    <option className="text-gray-900">Đăng ký thành viên</option>
                                    <option className="text-gray-900">Hỏi về huấn luyện viên</option>
                                    <option className="text-gray-900">Khác</option>
                                </select>
                            </div>
                        </div>

                        {/* MESSAGE */}
                        <div className="mb-8 group">
                            <label className="block text-white font-bold mb-3 group-hover:text-red-400 transition-colors">
                                Lời nhắn <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                rows="5"
                                placeholder="Bạn muốn gửi lời nhắn gì đến THREEGYM? Chúng tôi sẵn sàng lắng nghe..."
                                className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:border-white/40 resize-none"
                            />
                        </div>

                        {/* BUTTON */}
                        <div className="flex justify-center gap-4 md:gap-6">
                            <button className="relative group/btn px-10 md:px-12 py-4 rounded-full text-white font-bold text-lg 
                                bg-gradient-to-r from-red-500 to-yellow-500 
                                hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-500
                                overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-red-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    GỬI NGAY
                                </span>
                            </button>
                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}