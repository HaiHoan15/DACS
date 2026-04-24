import { Link, useLocation } from "react-router-dom";

const menuItems = [
	{ key: "dashboard", label: "Thống kê", href: "/admin" },
	{ key: "user", label: "Người dùng", href: "/admin/UserManagement" },
	{ key: "confirm", label: "Xác nhận", href: "/admin/MemberConfirmationManagement" },
	{ key: "service", label: "Dịch vụ", href: "/admin/ServiceManagement" },
	{ key: "product", label: "Sản phẩm", href: "/admin/ProductManagement" },
	{ key: "order", label: "Đơn hàng", href: "/admin/OrderManagement" },
	{ key: "warehouse", label: "Kho", href: "/admin/WarehouseManagement" },
	{ key: "room", label: "Phòng", href: "/admin/RoomManagement" },
];

export default function AdminDashboard({ isCollapsed = false, onToggle }) {
	const location = useLocation();

	return (
		<aside
			className={`h-[calc(100vh-85px)] sticky top-[85px] bg-gray-950 border-r border-gray-800 text-white transition-all duration-300 ${
				isCollapsed ? "w-20" : "w-72"
			}`}
		>
			<div className="h-full flex flex-col">
				<div className="p-4 border-b border-gray-800">
					<button
						type="button"
						onClick={onToggle}
						className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 flex items-center justify-center text-lg font-bold"
						aria-label={isCollapsed ? "Mở dashboard" : "Thu dashboard"}
					>
						<span className="inline-block transition-transform duration-300">
							{isCollapsed ? ">" : "<"}
						</span>
					</button>
				</div>

				<nav className="p-3 space-y-1 flex-1 overflow-y-auto">
					{menuItems.map((item) => {
						const isActive =
							item.href === "/admin"
								? location.pathname === "/admin"
								: location.pathname.startsWith(item.href);

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
