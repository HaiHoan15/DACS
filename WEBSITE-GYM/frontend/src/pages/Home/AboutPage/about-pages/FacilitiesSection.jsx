import { MdFitnessCenter, MdSelfImprovement, MdShower } from "react-icons/md";
import {
  FaDumbbell,
  FaRunning,
  FaVolumeUp,
} from "react-icons/fa";

const facilities = [
  {
    icon: <MdFitnessCenter className="text-4xl" />,
    title: "Máy tập hiện đại",
    desc: "Hệ thống máy tập chuẩn quốc tế, đầy đủ chức năng cho mọi nhóm cơ.",
    color: "from-red-600 to-red-400",
    delay: 0,
  },
  {
    icon: <FaRunning className="text-4xl" />,
    title: "Khu Cardio & Antigravity",
    desc: "Khu Cardio & Antigravity Training chuyên nghiệp với trang thiết bị tối tân.",
    color: "from-orange-500 to-yellow-400",
    delay: 100,
  },
  {
    icon: <FaDumbbell className="text-4xl" />,
    title: "Tạ tự do",
    desc: "Khu tạ tự do với đầy đủ thiết bị từ nhẹ đến nặng cho mọi trình độ.",
    color: "from-yellow-500 to-green-400",
    delay: 200,
  },
  {
    icon: <MdSelfImprovement className="text-4xl" />,
    title: "Yoga & Functional",
    desc: "Phòng tập Yoga – Stretching – Functional Training không gian riêng biệt.",
    color: "from-green-500 to-teal-400",
    delay: 300,
  },
  {
    icon: <MdShower className="text-4xl" />,
    title: "Locker & Phòng tắm",
    desc: "Hệ thống Locker, phòng tắm và khu thay đồ sạch sẽ, tiện nghi.",
    color: "from-teal-500 to-blue-400",
    delay: 400,
  },
  {
    icon: <FaVolumeUp className="text-4xl" />,
    title: "Không gian hiện đại",
    desc: "Không gian rộng rãi, điều hòa mát mẻ và hệ thống âm thanh chuyên nghiệp.",
    color: "from-blue-500 to-purple-400",
    delay: 500,
  },
];

export default function FacilitiesSection() {
  return (
    <section className="relative py-24 bg-[#080c14] overflow-hidden">
      {/* Background accent */}
      {/* <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600" /> */}
      <div className="absolute -top-40 right-0 w-96 h-96 bg-red-600/8 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 left-0 w-96 h-96 bg-yellow-500/8 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block text-xs font-bold tracking-[4px] uppercase text-red-400 mb-4">
            🏢 Cơ sở vật chất
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
            Không gian tập luyện{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400">
              đẳng cấp
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            ThreeGYM tự hào sở hữu cơ sở hạ tầng hiện đại, đáp ứng mọi nhu
            cầu tập luyện của bạn — từ cardio đến sức mạnh.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((item, i) => (
            <div
              key={i}
              data-aos="fade-up"
              data-aos-delay={item.delay}
              className="
                group relative rounded-2xl p-7 overflow-hidden
                bg-white/3 border border-white/8
                hover:border-white/20 hover:-translate-y-2
                transition-all duration-500 cursor-default
              "
            >
              {/* Gradient glow on hover */}
              <div
                className={`
                  absolute inset-0 opacity-0 group-hover:opacity-10
                  bg-gradient-to-br ${item.color}
                  transition-opacity duration-500 rounded-2xl
                `}
              />

              {/* Icon */}
              <div
                className={`
                  inline-flex items-center justify-center
                  w-16 h-16 rounded-2xl mb-5
                  bg-gradient-to-br ${item.color}
                  text-white shadow-lg
                `}
              >
                {item.icon}
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>

              {/* Bottom accent line */}
              <div
                className={`
                  absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full
                  bg-gradient-to-r ${item.color}
                  transition-all duration-500
                `}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
