export default function Banner() {
  return (
    <section
      className="relative w-full min-h-[600px] flex items-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/about-page/banner-1.png')" }}
    >

      {/* Overlay màu bên trái  */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-gray/80 via-white/40 to-transparent" />
      </div>

      <div className="relative w-full pl-6 md:pl-20">

        {/* CONTENT */}
        <div data-aos="fade-right" className="max-w-2xl">

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            <span className="text-gray-900">Vượt qua </span>
            <span className="text-red-500">giới hạn</span>
            <br />
            <span className="text-gray-900">Nâng tầm </span>
            <span className="bg-gradient-to-r from-yellow-500 to-red-500 bg-clip-text text-transparent">
              sức mạnh
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-6">
            THREEGYM là không gian tập luyện hiện đại, là nơi bạn có thể phá vỡ <br /> mọi giới hạn cơ thể và nâng cao sức khỏe.
            Với hệ thống máy móc tiên tiến, huấn luyện viên chuyên nghiệp và cộng đồng tập luyện năng động.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex gap-4">
            <a
              href="/service"
              className="px-6 py-3 bg-red-500 hover:bg-yellow-400 text-white font-semibold rounded-full transition duration-300 shadow-lg hover:shadow-yellow-400/40"
            >
              Đăng ký ngay
            </a>
            
          </div>

        </div>

      </div>

      {/* Gradient line dưới */}
      <div className="absolute bottom-0 left-0 w-full h-[10px] bg-gradient-to-r from-red-500 to-yellow-400"></div>
    </section>
  );
}