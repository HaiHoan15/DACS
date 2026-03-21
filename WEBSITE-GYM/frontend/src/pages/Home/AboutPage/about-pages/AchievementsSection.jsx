import { useEffect, useRef, useState } from "react";
import {
  FaUsers,
  FaUserTie,
  FaTrophy,
  FaSmile,
  FaFire,
} from "react-icons/fa";

const stats = [
  {
    icon: <FaUsers className="text-3xl" />,
    value: 5000,
    suffix: "+",
    label: "Hội viên đang tập luyện",
    color: "from-red-500 to-orange-400",
    delay: 0,
  },
  {
    icon: <FaUserTie className="text-3xl" />,
    value: 20,
    suffix: "+",
    label: "Huấn luyện viên chuyên nghiệp",
    color: "from-orange-500 to-yellow-400",
    delay: 150,
  },
  {
    icon: <FaTrophy className="text-3xl" />,
    value: 7,
    suffix: " năm",
    label: "Kinh nghiệm fitness",
    color: "from-yellow-500 to-green-400",
    delay: 300,
  },
  {
    icon: <FaSmile className="text-3xl" />,
    value: 98,
    suffix: "%",
    label: "Khách hàng hài lòng",
    color: "from-green-500 to-teal-400",
    delay: 450,
  },
  {
    icon: <FaFire className="text-3xl" />,
    value: 2000,
    suffix: "+",
    label: "Khách hàng đạt mục tiêu",
    color: "from-teal-500 to-blue-400",
    delay: 600,
  },
];

function CounterItem({ target, suffix, duration = 2000, started }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <span>
      {count.toLocaleString("vi-VN")}
      {suffix}
    </span>
  );
}

export default function AchievementsSection() {
  const sectionRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 50%, #0d0d0d 100%)",
      }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-red-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-yellow-500/15 rounded-full blur-[120px]" />
      </div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block text-xs font-bold tracking-[4px] uppercase text-yellow-400 mb-4">
            📊 Thành tựu nổi bật
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
            Con số{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
              biết nói
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Sau nhiều năm phát triển, ThreeGYM tự hào với những con số ấn tượng
            chứng minh chất lượng dịch vụ.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              data-aos="zoom-in"
              data-aos-delay={stat.delay}
              className="
                group relative text-center rounded-3xl p-8
                bg-white/3 border border-white/8
                hover:border-white/20 hover:-translate-y-2
                transition-all duration-500
              "
            >
              {/* Icon */}
              <div
                className={`
                  inline-flex items-center justify-center
                  w-14 h-14 rounded-2xl mb-5
                  bg-gradient-to-br ${stat.color} text-white
                  shadow-lg group-hover:scale-110 transition-transform duration-300
                `}
              >
                {stat.icon}
              </div>

              {/* Counter */}
              <div
                className={`
                  text-4xl font-black mb-2
                  text-transparent bg-clip-text bg-gradient-to-r ${stat.color}
                `}
              >
                <CounterItem
                  target={stat.value}
                  suffix={stat.suffix}
                  started={started}
                />
              </div>

              <p className="text-gray-400 text-sm leading-snug">
                {stat.label}
              </p>

              {/* Bottom glow on hover */}
              <div
                className={`
                  absolute bottom-0 left-1/2 -translate-x-1/2
                  w-0 group-hover:w-3/4 h-[2px]
                  bg-gradient-to-r ${stat.color}
                  transition-all duration-500 rounded-full
                `}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
