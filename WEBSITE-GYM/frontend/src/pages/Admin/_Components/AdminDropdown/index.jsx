import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../../../redux/authSlice";
import MenuButton from "../../../../components/MenuButton";

const AdminDropdown = () => {
    const [open, setOpen] = useState(false);
    const [timestamp] = useState(() => Date.now());
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        setOpen(false);
        // quay về trang login sau khi đăng xuất
        navigate("/login", { replace: true });
    };

    // đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [open]);

    if (!user) return null;

    const defaultUserImage = "/images/error/user.png";

    // Lấy URL avatar từ user.avatarUrl hoặc xây dựng từ avatar filename
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

    return (
        <div ref={menuRef} className="relative inline-block">
            {/* Hamburger button */}
            <MenuButton
                isOpen={open}
                onChange={() => setOpen(!open)}
                id="user-dropdown-toggle"
            />

            {/* Dropdown menu */}
            {open && (
                <div className="absolute right-0 mt-3 z-50 w-64 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08),0_15px_15px_-6px_rgba(0,0,0,0.06)] transition-all duration-300">
                    {/* User information header */}
                    <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-red-500 to-yellow-500 flex items-center gap-3">
                        <img
                            src={userImageSrc}
                            alt="avatar"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = defaultUserImage;
                            }}
                            className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        />
                        <p className="text-white font-semibold truncate">
                            {user?.username || "Người dùng"}
                        </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                        {/* Thông tin chi tiết */}
                        <NavLink
                            to="/admin/profile"
                            onClick={() => setOpen(false)}
                            className="group relative flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-all duration-200"
                        >
                            <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-y-100 scale-y-80" />
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors duration-200">
                                <svg
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    className="h-5 w-5 text-blue-600 group-hover:text-[#2b6cb0]"
                                >
                                    <path
                                        clipRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        fillRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-[#1a365d]">
                                Thông tin chi tiết
                            </span>
                        </NavLink>

                        <NavLink
                            to="/admin/password"
                            onClick={() => setOpen(false)}
                            className="group relative flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 transition-all duration-200"
                        >
                            <div className="absolute left-0 top-0 h-full w-1 bg-yellow-500 rounded-r opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-y-100 scale-y-80" />
                            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center mr-3 group-hover:bg-yellow-200 transition-colors duration-200">
                                <svg
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5 text-yellow-700"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 11c0 .73-.2 1.41-.55 2m1.8-6.6A5.002 5.002 0 0012 6a5 5 0 00-5 5v1a2 2 0 00-2 2v3a2 2 0 002 2h10a2 2 0 002-2v-3a2 2 0 00-2-2v-1a5 5 0 00-3.75-4.6z"
                                    />
                                </svg>
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-yellow-700">
                                Đổi mật khẩu
                            </span>
                        </NavLink>

                        {/* Đăng xuất */}
                        <button
                            onClick={handleLogout}
                            className="group relative flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 transition-all duration-200 text-left"
                        >
                            <div className="absolute left-0 top-0 h-full w-1 bg-red-500 rounded-r opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-y-100 scale-y-80" />
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors duration-200">
                                <svg
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    className="h-5 w-5 text-red-500 group-hover:text-red-600"
                                >
                                    <path
                                        clipRule="evenodd"
                                        d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                                        fillRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-red-600">
                                Đăng xuất
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDropdown;
