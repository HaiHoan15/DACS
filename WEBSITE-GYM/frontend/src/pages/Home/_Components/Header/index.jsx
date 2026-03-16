import { NavLink } from "react-router-dom";
import ImporterButton from "../ImporterButton";

const navItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Giới thiệu", path: "/about" },
    { label: "Dịch vụ", path: "/service" },
    { label: "Sản phẩm", path: "/product" },
    { label: "Tin tức", path: "/news" },
];

const Header = () => {

    return (
        <header className="bg-black/95 backdrop-blur sticky top-0 z-50 border-b border-red-900">
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

                {/* User */}
                <div className="ml-auto flex items-center gap-3">
                    <NavLink to="/account">
                        <ImporterButton />
                    </NavLink>
                </div>
            </div>
        </header>
    );
};

export default Header;