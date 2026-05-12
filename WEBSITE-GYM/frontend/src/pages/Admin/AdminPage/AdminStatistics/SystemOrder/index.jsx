import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function SectionTitle({ index, title, subtitle }) {
	return (
		<div className="mb-5 flex items-end justify-between gap-3">
			<div>
				<h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
					<span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-red-500 text-sm">
						{index}
					</span>
					{title}
				</h2>
				{subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
			</div>
		</div>
	);
}

function Panel({ title, children, className = "" }) {
	return (
		<div className={`rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg ${className}`}>
			<h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
			{children}
		</div>
	);
}

function EmptyState() {
	return <p className="text-slate-400">Không có dữ liệu</p>;
}

function formatOrderStatus(status) {
	const statusMap = {
		delivered: "Đã giao",
		pending: "Chờ xử lý",
		cancelled: "Đã hủy",
		processing: "Đang xử lý",
		shipping: "Đang giao",
		confirmed: "Đã xác nhận",
		shipped: "Đã gửi hàng",
	};
	return statusMap[status] || status;
}

function statusBadgeClass(status) {
	if (status === "delivered") return "bg-emerald-600";
	if (status === "pending") return "bg-amber-600";
	if (status === "cancelled") return "bg-red-600";
	if (status === "confirmed") return "bg-cyan-600";
	return "bg-sky-600";
}

const formatVnd = (value) => `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} VND`;

export default function SystemOrder({ ordersByStatus = [], recentOrders = [] }) {
	const [activeSubTab, setActiveSubTab] = useState("chart");

	const subTabs = [
		{ id: "chart", label: "Biểu đồ trạng thái" },
		{ id: "recent", label: "Đơn gần nhất" },
	];

	const chartData = useMemo(
		() =>
			(Array.isArray(ordersByStatus) ? ordersByStatus : []).map((item) => ({
				...item,
				count: Number(item?.count) || 0,
				total_amount: Number(item?.total_amount) || 0,
				status_label: formatOrderStatus(item?.status),
			})),
		[ordersByStatus]
	);

	return (
		<section className="mb-10">
			<SectionTitle index="3" title="Quản Lý Đơn Hàng" subtitle="Trạng thái và danh sách đơn gần nhất" />

			<div className="mb-6 rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
				<div className="flex flex-wrap gap-2">
					{subTabs.map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveSubTab(tab.id)}
							className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
								activeSubTab === tab.id
									? "bg-red-600 text-white"
									: "bg-slate-700 text-slate-200 hover:bg-slate-600"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{activeSubTab === "chart" && (
				<Panel title="Số lượng đơn theo trạng thái">
					{chartData.length > 0 ? (
						<ResponsiveContainer width="100%" height={380}>
							<BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="#475569" />
								<XAxis dataKey="status_label" stroke="#94a3b8" interval={0} minTickGap={0} tickMargin={8} />
								<YAxis yAxisId="left" stroke="#94a3b8" allowDecimals={false} />
								<YAxis yAxisId="right" orientation="right" stroke="#94a3b8" width={120} tickFormatter={(value) => formatVnd(value)} />
								<Tooltip
									contentStyle={{
										backgroundColor: "#0f172a",
										border: "1px solid #334155",
										color: "#e2e8f0",
									}}
									formatter={(value, name, item) => {
										if (item?.dataKey === "total_amount") {
											return formatVnd(value);
										}
										return value;
									}}
								/>
								<Legend />
								<Bar yAxisId="left" dataKey="count" name="Số đơn" fill="#38bdf8" radius={[8, 8, 0, 0]} />
								<Bar yAxisId="right" dataKey="total_amount" name="Tổng tiền" fill="#f59e0b" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<EmptyState />
					)}
				</Panel>
			)}

			{activeSubTab === "recent" && (
				<Panel title="Đơn hàng gần nhất">
					<div className="overflow-x-auto">
						<table className="w-full text-sm text-slate-100">
							<thead>
								<tr className="border-b border-slate-600">
									<th className="text-left p-2">ID</th>
									<th className="text-left p-2">Người dùng</th>
                                    <th className="text-left p-2">Email</th>
									<th className="text-left p-2">Trạng thái</th>
									<th className="text-right p-2">Giá trị</th>
								</tr>
							</thead>
							<tbody>
								{(Array.isArray(recentOrders) ? recentOrders : []).map((order) => (
									<tr key={order.id} className="border-b border-slate-700 hover:bg-slate-700/40">
										<td className="p-2 font-semibold">{order.id}</td>
										<td className="p-2">{order.username}</td>
										<td className="p-2">{order.email}</td>
										<td className="p-2">
											<span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadgeClass(order.status)}`}>
												{formatOrderStatus(order.status)}
											</span>
										</td>
										<td className="p-2 text-right font-semibold">{formatVnd(order.total_amount)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Panel>
			)}
		</section>
	);
}
