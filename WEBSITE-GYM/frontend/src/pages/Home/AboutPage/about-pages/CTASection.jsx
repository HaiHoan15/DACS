import { NavLink } from "react-router-dom";
import { FaDumbbell, FaFire, FaGift } from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";

const benefits = [
  "Tập thử miễn phí 1 ngày",
  "Giảm 30% cho hội viên mới",
  "Tham gia cộng đồng fitness năng động",
];

export default function CTASection() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #1a0303 0%, #0d0d0d 40%, #1a0d00 100%)",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-600/20 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[80px]" />

      {/* Top + Bottom decorative border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600" />

      {/* Decorative "THREEGYM" background text */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <span
          className="text-[180px] md:text-[260px] font-black tracking-tighter opacity-[0.025] text-white select-none"
          style={{ lineHeight: 1 }}
        >
          THREEGYM
        </span>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Fire badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-semibold mb-8"
          data-aos="fade-down"
        >
          <FaFire className="animate-pulse" />
          Ưu đãi có hạn – Đừng bỏ lỡ!
        </div>

        {/* Heading */}
        <h2
          className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight"
          data-aos="fade-up"
          data-aos-delay="50"
        >
          🔥 Bắt đầu hành trình{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400 block">
            thay đổi cơ thể ngay hôm nay!
          </span>
        </h2>

        {/* Sub */}
        <p
          className="text-gray-400 text-xl mb-10"
          data-aos="fade-up"
          data-aos-delay="150"
        >
          👉 Đăng ký ngay để trải nghiệm{" "}
          <span className="text-yellow-400 font-semibold">
            Antigravity Training
          </span>{" "}
          độc quyền tại ThreeGYM!
        </p>

        {/* Benefit list */}
        <ul
          className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          {benefits.map((b, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-gray-300 font-medium"
            >
              <MdCheckCircle className="text-green-400 text-xl flex-shrink-0" />
              {b}
            </li>
          ))}
        </ul>

        {/* Buttons */}
        <div
          className="flex flex-wrap justify-center gap-4"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <NavLink
            to="/service"
            className="
              group flex items-center gap-3
              px-10 py-4 rounded-full font-bold text-xl text-white
              bg-gradient-to-r from-red-600 to-red-500
              shadow-xl shadow-red-600/40
              hover:shadow-red-500/70 hover:scale-105
              transition-all duration-300
              animate__animated animate__pulse animate__infinite animate__slow
            "
          >
            <FaDumbbell className="group-hover:rotate-12 transition-transform" />
            Đăng ký ngay
          </NavLink>

          <NavLink
            to="/product"
            className="
              flex items-center gap-3
              px-10 py-4 rounded-full font-bold text-xl
              text-yellow-400 border-2 border-yellow-400/50
              hover:bg-yellow-400/10 hover:border-yellow-400 hover:scale-105
              transition-all duration-300
            "
          >
            <FaGift />
            Xem gói tập
          </NavLink>
        </div>
      </div>
    </section>
  );
}
