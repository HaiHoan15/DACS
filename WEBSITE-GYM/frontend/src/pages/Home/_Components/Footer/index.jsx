import { NavLink } from "react-router-dom";
import {
    FaFacebook, FaInstagram, FaYoutube, FaTiktok,
    FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe,
    FaDumbbell, FaClock, FaChevronRight, FaHeart,
} from "react-icons/fa";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const quickLinks = [
    { label: "Trang chủ", path: "/" },
    { label: "Giới thiệu", path: "/about" },
    { label: "Dịch vụ", path: "/service" },
    { label: "Sản phẩm", path: "/product" },
    { label: "Tin tức", path: "/news" },
];

const services = [
    "Tập gym cơ bản",
    "Antigravity Training",
    "Yoga & Stretching",
    "Functional Training",
    "Personal Training",
    "Cardio & Endurance",
];

const policies = [
    { label: "Chính sách đổi trả", href: "#" },
    { label: "Chính sách bảo mật", href: "#" },
    { label: "Chính sách vận chuyển", href: "#" },
    { label: "Điều khoản sử dụng", href: "#" },
];

const socials = [
    { icon: <FaFacebook />, label: "Facebook", href: "#", hoverBg: "hover:bg-blue-600" },
    { icon: <FaInstagram />, label: "Instagram", href: "#", hoverBg: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500" },
    { icon: <FaYoutube />, label: "YouTube", href: "#", hoverBg: "hover:bg-red-600" },
    { icon: <FaTiktok />, label: "TikTok", href: "#", hoverBg: "hover:bg-gray-700" },
];

const contacts = [
    { icon: <FaMapMarkerAlt />, text: "69 Nguyễn Hải Hoàng, Quận 69, TP.HCM" },
    { icon: <FaPhone />, text: "6969 696 969" },
    { icon: <FaEnvelope />, text: "threegym@gmail.com" },
    { icon: <FaGlobe />, text: "www.threegym.com" },
];

const hours = [
    { days: "Thứ 2 – Thứ 6", time: "5:00 – 22:00" },
    { days: "Thứ 7 – Chủ nhật", time: "6:00 – 21:00" },
];

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN HEADING
// ─────────────────────────────────────────────────────────────────────────────
function ColHeading({ children }) {
    return (
        <h4 className="text-white font-bold text-sm mb-6 flex items-center gap-2 uppercase tracking-widest">
            <span className="w-5 h-[2px] bg-gradient-to-r from-red-500 to-yellow-500 rounded-full" />
            {children}
        </h4>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative bg-black/85 border-t border-red-900/40 overflow-hidden">
            {/* ── Top gradient line ── */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            <div className="absolute top-[2px] left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

            {/* ── Background glows ── */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[250px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-yellow-900/8 rounded-full blur-[100px] pointer-events-none" />

            {/* ── Grid pattern subtle ── */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)",
                    backgroundSize: "80px 80px",
                }}
            />

            {/* ════════════════════════════════════════════════════════════════════ */}
            {/* MAIN CONTENT                                                        */}
            {/* ════════════════════════════════════════════════════════════════════ */}
            <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-10 lg:gap-8 mb-14">

                    {/* ── COL 1: Brand ─────────────────────────────────────────────── */}
                    <div className="xl:col-span-2 sm:col-span-2 lg:col-span-2 xl:col-span-2">
                        {/* Logo */}
                        <NavLink to="/" className="inline-flex items-center gap-3 mb-5 group">
                            <img
                                src="/images/logo/logo.png"
                                alt="ThreeGYM Logo"
                                className="w-13 h-13 object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                            <span className="text-2xl font-black tracking-tight">
                                <span className="text-red-500 group-hover:text-red-400 transition-colors">THREE</span>
                                <span className="text-yellow-500 group-hover:text-yellow-400 transition-colors ml-1">GYM</span>
                            </span>
                        </NavLink>

                        <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
                            ThreeGym – Không gian tập luyện hiện đại, nơi cung cấp sản phẩm và
                            dịch vụ thể hình chất lượng cao giúp bạn nâng tầm sức mạnh và thể lực.
                            Cùng chúng tôi chinh phục mọi giới hạn!
                        </p>

                        {/* Social icons */}
                        <div className="flex gap-2.5">
                            {socials.map((s, i) => (
                                <a
                                    key={i}
                                    href={s.href}
                                    aria-label={s.label}
                                    title={s.label}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                    bg-white/5 border border-white/10 text-gray-400
                    ${s.hoverBg} hover:text-white hover:border-transparent hover:scale-110 hover:shadow-lg
                    transition-all duration-300`}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── COL 2: Quick links ───────────────────────────────────────── */}
                    <div>
                        <ColHeading>Liên kết nhanh</ColHeading>
                        <ul className="space-y-3">
                            {quickLinks.map((link, i) => (
                                <li key={i}>
                                    <NavLink
                                        to={link.path}
                                        className="text-gray-400 hover:text-yellow-400 text-sm transition-colors duration-300 flex items-center gap-2 group"
                                    >
                                        <FaChevronRight className="text-[8px] text-red-500/0 group-hover:text-red-500 transition-all duration-300 -translate-x-1 group-hover:translate-x-0" />
                                        {link.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── COL 3: Services ──────────────────────────────────────────── */}
                    <div>
                        <ColHeading>Dịch vụ</ColHeading>
                        <ul className="space-y-3">
                            {services.map((s, i) => (
                                <li key={i} className="text-gray-400 text-sm flex items-center gap-2">
                                    <FaDumbbell className="text-red-500/50 text-[10px] flex-shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── COL 4: Contact + Hours ───────────────────────────────────── */}
                    <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
                        <ColHeading>Liên hệ (Địa chỉ fake)</ColHeading>
                        <ul className="space-y-3.5 mb-6">
                            {contacts.map((c, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="text-red-400 text-sm mt-0.5 flex-shrink-0">{c.icon}</span>
                                    {c.href ? (
                                        <a href={c.href} className="text-gray-400 text-sm hover:text-yellow-400 transition-colors duration-300 break-all">
                                            {c.text}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 text-sm">{c.text}</span>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* Hours */}
                        <div className="pt-4 border-t border-white/6">
                            <p className="flex items-center gap-2 text-white font-semibold text-xs uppercase tracking-wider mb-3">
                                <FaClock className="text-yellow-500" /> Giờ mở cửa
                            </p>
                            {hours.map((h, i) => (
                                <div key={i} className="flex justify-between text-sm mb-1.5">
                                    <span className="text-gray-500">{h.days}</span>
                                    <span className="text-yellow-400 font-semibold">{h.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* POLICIES ROW                                                    */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <div className="border-t border-white/6 pt-6 pb-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {policies.map((p, i) => (
                        <a
                            key={i}
                            href={p.href}
                            className="text-gray-500 hover:text-yellow-400 text-xs transition-colors duration-300"
                        >
                            {p.label}
                        </a>
                    ))}
                </div>

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* COPYRIGHT BAR                                                   */}
                {/* ════════════════════════════════════════════════════════════════ */}
                <div className="border-t border-white/6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-gray-600 text-sm text-center sm:text-left">
                        © {year}{" "}
                        <span className="text-red-500 font-bold">THREE</span>
                        <span className="text-yellow-500 font-bold">GYM</span>
                        . All rights reserved.
                    </p>
                    <p className="text-gray-700 text-xs flex items-center gap-1">
                        Designed with <FaHeart className="text-red-500 text-[10px] animate-pulse" /> by ThreeGYM Team
                    </p>
                </div>
            </div>
        </footer>
    );
}
