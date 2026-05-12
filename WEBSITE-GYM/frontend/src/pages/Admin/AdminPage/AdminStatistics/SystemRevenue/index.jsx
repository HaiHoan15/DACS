import { useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const COLORS = ["#ef4444", "#06b6d4", "#3b82f6", "#f97316", "#22c55e", "#8b5cf6", "#facc15", "#14b8a6"];

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

function formatCurrency(value) {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(Number(value) || 0);
}

export default function SystemRevenue({
	revenueByDay,
	revenueByMonth,
	revenueByPaymentMethod,
	revenueByProduct,
	serviceRevenue,
	revenueByService,
	topTotalSpenders,
}) {
	const [activeSubTab, setActiveSubTab] = useState("day");

	const subTabs = [
		{ id: "day", label: "Theo ngày" },
		{ id: "month", label: "Theo tháng" },
		{ id: "product", label: "Sản phẩm" },
		{ id: "service", label: "Dịch vụ" },
		{ id: "top10", label: "Top 10" },
	];

	const paymentMethodData = useMemo(
		() =>
			(Array.isArray(revenueByPaymentMethod) ? revenueByPaymentMethod : [])
				.map((item) => ({
					...item,
					payment_method_label:
						item?.payment_method === "direct"
							? "Thanh toán trực tiếp"
							: item?.payment_method === "momo"
								? "Thanh toán Momo"
								: item?.payment_method || "Khác",
					revenue: Number(item?.revenue) || 0,
					order_count: Number(item?.order_count) || 0,
				}))
				.filter((item) => item.revenue > 0),
		[revenueByPaymentMethod]
	);

	const revenueByDayDisplay = useMemo(
		() =>
			(Array.isArray(revenueByDay) ? revenueByDay : []).map((item) => ({
				...item,
				revenue: Number(item?.revenue) || 0,
				order_count: Number(item?.order_count) || 0,
				date_label: typeof item?.date === "string" ? item.date.split("-").reverse().join("/") : item?.date,
			})),
		[revenueByDay]
	);

	const serviceRevenueData = useMemo(
		() =>
			(Array.isArray(revenueByService) ? revenueByService : []).map((item) => ({
				...item,
				total_revenue: Number(item?.total_revenue) || 0,
				transaction_count: Number(item?.transaction_count) || 0,
			})),
		[revenueByService]
	);

	const revenueByMonthDisplay = useMemo(
		() =>
			(Array.isArray(revenueByMonth) ? revenueByMonth : []).map((item) => {
				const monthLabel = typeof item?.month_label === "string" ? item.month_label : "";
				const [year, month] = monthLabel.split("-");
				return {
					...item,
					revenue: Number(item?.revenue) || 0,
					order_count: Number(item?.order_count) || 0,
					month_label_display: year && month ? `${month}/${year}` : monthLabel,
				};
			}),
		[revenueByMonth]
	);

	const formatVnd = (value) => `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} VND`;

	return (
		<section className="mb-10">
			<SectionTitle index="2" title="Thống Kê Doanh Thu" subtitle="Theo ngày, tháng và phương thức thanh toán" />

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

			{activeSubTab === "day" && (
				<Panel title="Doanh thu theo ngày (30 ngày)">
					{revenueByDayDisplay.length > 0 ? (
						<ResponsiveContainer width="100%" height={360}>
							<BarChart data={revenueByDayDisplay} key="rev-day-chart" margin={{ top: 10, right: 20, left: 28, bottom: 6 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="#475569" />
								<XAxis dataKey="date_label" stroke="#94a3b8" />
								<YAxis yAxisId="left" stroke="#94a3b8" width={120} tickFormatter={(value) => formatVnd(value)} />
								<YAxis yAxisId="right" orientation="right" stroke="#94a3b8" allowDecimals={false} />
								<Tooltip
									contentStyle={{
										backgroundColor: "#0f172a",
										border: "1px solid #334155",
										color: "#e2e8f0",
									}}
									labelFormatter={(label) => `Ngày: ${label}`}
									formatter={(value, name, item) => {
										if (item?.dataKey === "revenue") {
											return new Intl.NumberFormat("vi-VN").format(Number(value) || 0);
										}
										return value;
									}}
								/>
								<Legend />
								<Bar yAxisId="left" dataKey="revenue" name="Doanh thu" fill="#22c55e" radius={[6, 6, 0, 0]} />
								<Bar yAxisId="right" dataKey="order_count" name="Số đơn" fill="#38bdf8" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<EmptyState />
					)}
				</Panel>
			)}

			{activeSubTab === "month" && (
				<Panel title="Doanh thu theo tháng (12 tháng)">
					{revenueByMonthDisplay.length > 0 ? (
						<ResponsiveContainer width="100%" height={360}>
							<BarChart data={revenueByMonthDisplay} key="rev-month-chart" margin={{ top: 10, right: 20, left: 28, bottom: 6 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="#475569" />
								<XAxis dataKey="month_label_display" stroke="#94a3b8" />
								<YAxis stroke="#94a3b8" width={120} tickFormatter={(value) => formatVnd(value)} />
								<Tooltip
									contentStyle={{
										backgroundColor: "#0f172a",
										border: "1px solid #334155",
										color: "#e2e8f0",
									}}
									labelFormatter={(label) => `Tháng: ${label}`}
									formatter={(value, name, item) => {
										if (item?.dataKey === "revenue") {
											return new Intl.NumberFormat("vi-VN").format(Number(value) || 0);
										}
										return value;
									}}
								/>
								<Legend />
								<Bar dataKey="revenue" name="Doanh thu" fill="#38bdf8" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<EmptyState />
					)}
				</Panel>
			)}

			{activeSubTab === "product" && (
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
					<Panel title="Doanh thu theo phương thức (sản phẩm)">
						{paymentMethodData.length > 0 ? (
							<ResponsiveContainer width="100%" height={360}>
								<PieChart key="payment-method-chart">
									<Pie
										data={paymentMethodData}
										dataKey="revenue"
										nameKey="payment_method_label"
										cx="50%"
										cy="50%"
										outerRadius={120}
										label={({ value }) => `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} VND`}
									>
										{paymentMethodData.map((entry, index) => (
											<Cell key={`payment-cell-${entry.payment_method || index}`} fill={COLORS[index % COLORS.length]} />
										))}
									</Pie>
									<Tooltip formatter={(value) => `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} VND`} />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						) : (
							<EmptyState />
						)}
					</Panel>

					<Panel title="Doanh thu theo sản phẩm">
						<div className="overflow-x-auto">
							<table className="w-full text-sm text-slate-100">
								<thead>
									<tr className="border-b border-slate-600">
										<th className="text-left p-2">Sản phẩm</th>
										<th className="text-right p-2">Doanh thu</th>
										<th className="text-right p-2">Số lượng</th>
									</tr>
								</thead>
								<tbody>
									{revenueByProduct.map((product) => (
										<tr key={product.id} className="border-b border-slate-700 hover:bg-slate-700/40">
											<td className="p-2">{product.product_name}</td>
											<td className="p-2 text-right font-semibold">{formatVnd(product.total_revenue)}</td>
											<td className="p-2 text-right">{product.total_quantity}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</Panel>
				</div>
			)}

			{activeSubTab === "service" && (
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
					<Panel title="Doanh thu theo gói dịch vụ">
						{serviceRevenueData.length > 0 ? (
							<ResponsiveContainer width="100%" height={360}>
								<BarChart data={serviceRevenueData} key="rev-service-chart" margin={{ top: 10, right: 20, left: 28, bottom: 6 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="#475569" />
									<XAxis dataKey="service_name" stroke="#94a3b8" />
									<YAxis stroke="#94a3b8" width={120} tickFormatter={(value) => formatVnd(value)} />
									<Tooltip
										contentStyle={{
											backgroundColor: "#0f172a",
											border: "1px solid #334155",
											color: "#e2e8f0",
										}}
										formatter={(value, name, item) => {
											if (item?.dataKey === "total_revenue") {
												return `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} VND`;
											}
											return value;
										}}
									/>
									<Legend />
									<Bar dataKey="total_revenue" name="Doanh thu" fill="#22c55e" radius={[8, 8, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						) : (
							<EmptyState />
						)}
					</Panel>

					<Panel title="Tổng quan doanh thu dịch vụ">
						<div className="space-y-4">
							<div className="rounded-xl bg-slate-700/70 p-4">
								<p className="text-slate-400 text-sm">Tổng doanh thu</p>
								<p className="text-2xl font-bold text-emerald-400 mt-1">{formatVnd(serviceRevenue?.totalRevenue || 0)}</p>
							</div>
							<div className="rounded-xl bg-slate-700/70 p-4">
								<p className="text-white font-bold">Số giao dịch <p className="text-slate-400 text-sm font-normal">Số lần kích hoạt gói dịch vụ từ Admin và User trả phí</p></p>
								<p className="text-2xl font-bold text-cyan-400 mt-1">{serviceRevenue?.transactionCount || 0}</p>
							</div>
							<div className="rounded-xl bg-slate-700/70 p-4">
								<p className="text-white font-bold">Số giao dịch có doanh thu <p className="text-slate-400 text-sm font-normal">Số lần kích hoạt gói dịch vụ từ User trả phí</p></p>
								<p className="text-2xl font-bold text-amber-400 mt-1">{serviceRevenueData.length}</p>
							</div>
						</div>
					</Panel>
				</div>
			)}

			{activeSubTab === "top10" && (
				<Panel title="Top 10 người dùng chi nhiều tiền nhất (Dịch vụ + Sản phẩm)">
					<div className="overflow-x-auto">
						<table className="w-full text-sm text-slate-100">
							<thead>
								<tr className="border-b border-slate-600">
									<th className="text-left p-2">#</th>
									<th className="text-left p-2">Người dùng</th>
									<th className="text-right p-2">Dịch vụ</th>
									<th className="text-right p-2">Sản phẩm</th>
									<th className="text-right p-2">Tổng chi</th>
								</tr>
							</thead>
							<tbody>
								{topTotalSpenders.map((user, idx) => (
									<tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/40">
										<td className="p-2 font-semibold">{idx + 1}</td>
										<td className="p-2">
											<p className="font-medium">{user.username}</p>
											<p className="text-xs text-slate-400">{user.email}</p>
										</td>
										<td className="p-2 text-right">{formatCurrency(user.service_spent)}</td>
										<td className="p-2 text-right">{formatCurrency(user.product_spent)}</td>
										<td className="p-2 text-right font-semibold text-emerald-400">{formatCurrency(user.total_spent)}</td>
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
