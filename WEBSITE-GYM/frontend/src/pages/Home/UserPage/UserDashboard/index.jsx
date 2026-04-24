import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../../redux/authSlice";

function toSlug(s) {
	return (s || "")
		.toString()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-zA-Z0-9\s-]/g, "")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

export default function UserDashboard() {
	const user = useSelector((state) => state.auth.user);
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [isCollapsed, setIsCollapsed] = useState(false);

	const handleLogout = () => {
		dispatch(logout());
		navigate("/");
	};
	const userSlug = toSlug(user?.username || "");
	const basePath = userSlug ? `/user/${userSlug}` : "/user";

	const menuItems = [
		{ key: "account", label: "Tài khoản", href: `${basePath}` },
		{ key: "cart", label: "Giỏ hàng", href: `${basePath}/wishlist` },
		{ key: "orders", label: "Đơn hàng", href: `${basePath}/orders` },
		{ key: "room", label: "Phòng tập", href: `${basePath}/room` },
		{ key: "class", label: "Lớp học", href: `${basePath}/class` },
		{ key: "ai", label: "AI sức khỏe", href: `${basePath}/ai` },
		{ key: "logout", label: "Đăng xuất", href: "#", danger: true },
	];

	const avatarUrl = useMemo(() => {
		if (!user?.avatar) return "/images/icon/user.png";
		if (String(user.avatar).startsWith("http")) return user.avatar;
		return `/uploads/avatars/${user.avatar}`;
	}, [user?.avatar]);

	return (
		<aside
			className={`h-screen bg-gray-950 border-r border-gray-800 text-white transition-all duration-300 ${
				isCollapsed ? "w-20" : "w-72"
			}`}
		>
			<div className="h-full flex flex-col">
				<div className="p-4 border-b border-gray-800">
					<button
						type="button"
						onClick={() => setIsCollapsed((prev) => !prev)}
						className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 flex items-center justify-center text-lg font-bold"
						aria-label={isCollapsed ? "Mở dashboard" : "Thu dashboard"}
					>
						<span className="inline-block transition-transform duration-300">
							{isCollapsed ? ">" : "<"}
						</span>
					</button>
				</div>

				<div className="px-4 py-6 border-b border-gray-800 flex flex-col items-center">
					<img
						src={avatarUrl}
						alt={user?.username || "User avatar"}
						className={`rounded-full object-cover border-2 border-red-500 transition-all duration-300 ${
							isCollapsed ? "w-12 h-12" : "w-20 h-20"
						}`}
						onError={(e) => {
							e.target.src = "/images/icon/user.png";
						}}
					/>

					<div
						className={`mt-4 text-center transition-all duration-300 overflow-hidden ${
							isCollapsed ? "max-h-0 opacity-0" : "max-h-40 opacity-100"
						}`}
					>
						<p className="font-semibold text-base">{user?.username || "Người dùng"}</p>
						<p className="text-sm text-gray-400 mt-1 break-all">{user?.email || ""}</p>
					</div>
				</div>

				<nav className="p-3 space-y-1 flex-1 overflow-y-auto">
					{menuItems.map((item) => {
						const isActive = item.href !== "#" && location.pathname === item.href;
						if (item.key === "logout") {
							return (
							<button
								key={item.key}
								type="button"
								onClick={handleLogout}
								className="group flex items-center w-full rounded-lg px-3 py-2.5 transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300"
							>
								<span className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-800 text-xs font-bold text-gray-300 group-hover:bg-gray-700 transition-colors">
									{item.label.slice(0, 1)}
								</span>
								<span
									className={`ml-3 whitespace-nowrap transition-all duration-300 overflow-hidden ${
										isCollapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
									}`}
								>
									{item.label}
								</span>
							</button>
							);
						}
						return (
						<Link
							key={item.key}
							to={item.href}
							className={`group flex items-center rounded-lg px-3 py-2.5 transition-all duration-200 ${
								isActive
									? "text-white bg-gray-800"
									: "text-gray-200 hover:bg-gray-800 hover:text-white"
							}`}
						>
							<span className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-800 text-xs font-bold text-gray-300 group-hover:bg-gray-700 transition-colors">
								{item.label.slice(0, 1)}
							</span>

							<span
								className={`ml-3 whitespace-nowrap transition-all duration-300 overflow-hidden ${
									isCollapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
								}`}
							>
								{item.label}
							</span>
						</Link>
						);
					})}
				</nav>
			</div>
		</aside>
	);
}
