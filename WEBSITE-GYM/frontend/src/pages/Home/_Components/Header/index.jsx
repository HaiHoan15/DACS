import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

import LoginButton from "../../../../components/LoginButton";
import UserDropdown from "../UserDropdown";
import api from "../../../../API/api";

const PACKAGE_LABEL = { 1: "Member", 2: "Pro", 3: "VIP" };

const navItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Giới thiệu", path: "/about" },
    { label: "Dịch vụ", path: "/service" },
    { label: "Sản phẩm", path: "/product" },
    { label: "Tin tức", path: "/news" },
    { label: "TEST", path: "/test" },
];

const Header = () => {
    const user = useSelector((state) => state.auth.user);
    const location = useLocation();
    const defaultUserImage = "/images/error/user.png";
    const [timestamp] = useState(() => Date.now());
    const [memberLabel, setMemberLabel] = useState(null);

    useEffect(() => {
        if (!user?.id) return;
        api.get("ServiceController.php", { params: { action: "getUserService", userId: user.id } })
            .then((res) => {
                if (res.data?.success && res.data.service) {
                    setMemberLabel(PACKAGE_LABEL[res.data.service.package_id] ?? null);
                } else {
                    setMemberLabel(null);
                }
            })
            .catch(() => setMemberLabel(null));
    }, [user?.id]);

    const getAvatarUrl = () => {
        if (user?.avatarUrl) {
            // Thêm timestamp để tránh cache browser
            return `${user.avatarUrl}?t=${user.avatar ? user.avatar.split('_')[2] || timestamp : timestamp}`;
        }
        if (user?.avatar) {
            return `/backend/public/uploads/avatars/${user.avatar}`;
        }
        return defaultUserImage;
    };

    const userImageSrc = getAvatarUrl();
    // Admin redirect vào /admin, user redirect vào /user
    const profilePath = user?.role === "admin" ? "/admin" : "/user";
    const isProfileRouteActive = user?.role === "admin"
        ? location.pathname.startsWith("/admin")
        : location.pathname.startsWith("/user");

    return (
        <header className="bg-black/75 backdrop-blur sticky top-0 z-50 border-b border-red-900">
            <div className="max-w-7xl mx-auto relative flex items-center px-2 py-4">

                {/* Logo */}
                <div className="flex items-center gap-5">
                    <img
                        src="/images/logo/logo.png"
                        alt="Three GYM Logo"
                        className="w-15 h-15 object-contain scale-170"
                    />

                    <NavLink
                        to="/"
                        className="text-2xl font-bold transition-colors"
                    >
                        <span className="text-red-500 hover:text-red-400">
                            THREE
                        </span>
                        <span className="text-yellow-500 hover:text-yellow-400 ml-1">
                            GYM
                        </span>
                    </NavLink>
                </div>

                {/* Menu */}
                <nav className="
                    group hidden md:flex items-center gap-8 text-lg font-medium
                    absolute left-1/2 -translate-x-1/2
                ">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) =>
                                `
                                relative transition-colors duration-300
                                ${isActive ? "text-red-500" : "text-gray-300 hover:text-yellow-400"}

                                after:absolute
                                after:left-0
                                after:-bottom-1
                                after:h-[2px]
                                after:bg-red-500
                                after:transition-all
                                after:duration-300

                                after:w-0
                                hover:after:w-full

                                ${isActive ? "after:w-full group-hover:after:w-0" : ""}
                            `
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User Section */}
                <div className="ml-auto flex items-center gap-3">
                    {user ? (
                        // Đã đăng nhập
                        <div className="flex items-center gap-3">
                            {/* Avatar + tên user */}
                            <NavLink
                                to={profilePath}
                                className={() =>
                                    `flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm transition duration-300 min-w-0 ${isProfileRouteActive
                                        ? "bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg hover:bg-yellow-500 hover:shadow-yellow-500/50"
                                        : "bg-gray-700/50 text-gray-300 hover:bg-red-500 hover:text-white hover:shadow-md"
                                    }`
                                }
                            >
                                <img
                                    src={userImageSrc}
                                    alt="User avatar"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = defaultUserImage;
                                    }}
                                    className="w-8 h-8 rounded-full object-cover border border-gray-300"
                                />
                                <span
                                    className="font-medium max-w-[140px] truncate"
                                    title={user.username}
                                >
                                    {user.username}
                                </span>
                                {memberLabel && (
                                    <span className="text-xs font-semibold opacity-80 shrink-0">
                                        ({memberLabel})
                                    </span>
                                )}
                            </NavLink>

                            {/* nút giỏ hàng */}
                            {/* <NavLink to="/cart">
                                <CartButton />
                            </NavLink> */}

                            <UserDropdown />
                        </div>
                    ) : (
                        // Chưa đăng nhập
                        <NavLink to="/login">
                            <LoginButton />
                        </NavLink>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;