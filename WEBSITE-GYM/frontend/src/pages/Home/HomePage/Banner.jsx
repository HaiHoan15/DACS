import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { NavLink } from "react-router-dom";

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-start pt-32 bg-[#F5F5F5] overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/background/home-background.jpg"
          alt="gym"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay sáng bên trái (không blur toàn bộ nữa) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-white/80 via-white/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-2xl" data-aos="fade-up">

          {/* Title nhỏ */}
          <p className="text-red-500 font-semibold mb-3 tracking-wide font-bold">
            CHÀO MỪNG ĐẾN VỚI
          </p>

          {/* Logo + Title */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src="/images/logo/logo.png"
              alt="logo"
              className="w-20 h-20 object-contain"
            />

            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              <span className="text-red-500">THREE</span>
              <span className="text-yellow-400">GYM</span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-lg leading-relaxed mb-8 font-bold">
            Nơi bạn bứt phá giới hạn bản thân với hệ thống thiết bị hiện đại,
            huấn luyện viên chuyên nghiệp và môi trường tập luyện đầy năng lượng.
            Hãy bắt đầu hành trình thay đổi cơ thể của bạn ngay hôm nay.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 flex-wrap">
            <NavLink
              to="/service"
              className="
                px-8 py-4 rounded-full font-bold text-white text-lg
                bg-gradient-to-r from-red-500 to-orange-400
                shadow-lg hover:scale-105 transition-all duration-300
              "
            >
              Bắt đầu ngay
            </NavLink>

            <NavLink
              to="/about"
              className="
                px-8 py-4 rounded-full font-bold text-lg
                border-2 border-gray-400 text-gray-700
                hover:bg-black/80 hover:text-white hover:border-black/80
                hover:scale-105 hover:shadow-lg hover:shadow-black/20
                transition-all duration-300
              "
            >
              Tìm hiểu thêm
            </NavLink>
          </div>

        </div>
      </div>
    </section>
  );
}