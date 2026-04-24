import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";

import LoginButton from "../../../../components/LoginButton";
import AdminDropdown from "../AdminDropdown";

const navItems = [
    // { label: "Thống kê", path: "/admin" },
    { label: "Người dùng", path: "/admin/UserManagement" },
    { label: "Xác nhận", path: "/admin/MemberConfirmationManagement" },
    { label: "Dịch vụ", path: "/admin/ServiceManagement" },
    { label: "Sản phẩm", path: "/admin/ProductManagement" },
    { label: "Đơn hàng", path: "/admin/OrderManagement" },
    { label: "Kho", path: "/admin/WarehouseManagement" },
    { label: "Phòng", path: "/admin/RoomManagement" },
    
];

const Header = () => {
    const user = useSelector((state) => state.auth.user);
    const location = useLocation();
    const defaultUserImage = "/images/error/user.png";
    const [timestamp] = useState(() => Date.now());

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
    const adminProfilePath = "/admin";
    const isAdminRouteActive = location.pathname.startsWith(adminProfilePath);

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
                        to="/admin"
                        className="text-2xl font-bold transition-colors"
                    >
                        <span className="text-red-500 hover:text-red-400">
                            THREE
                        </span>
                        <span className="text-yellow-500 hover:text-yellow-400 ml-1">
                            GYM
                        </span>
                        <span className="text-gray-300 hover:text-gray-400 ml-1">
                            ADMIN
                        </span>
                    </NavLink>
                </div>

                {/* Menu */}
                <nav className="
                    hidden md:flex items-center gap-5 text-lg font-medium
                    absolute left-1/2 -translate-x-1/2
                ">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            end
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

                                ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}
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
                                to={adminProfilePath}
                                className={() =>
                                    `flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm transition duration-300 min-w-0 ${isAdminRouteActive
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
                            </NavLink>

                            <AdminDropdown />
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