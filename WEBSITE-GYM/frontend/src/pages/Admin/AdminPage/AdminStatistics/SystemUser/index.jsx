import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#ef4444", "#06b6d4", "#3b82f6", "#f97316", "#22c55e", "#8b5cf6"];

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

function Panel({ title, children }) {
	return (
		<div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg">
			<h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
			{children}
		</div>
	);
}

function EmptyState() {
	return <p className="text-slate-400">Không có dữ liệu</p>;
}

function formatRole(role) {
	const roleMap = {
		admin: "Quản trị",
		user: "Người dùng",
		teacher: "Huấn luyện viên",
	};
	return roleMap[role] || role;
}

export default function SystemUser({ usersByRole = [], userRegistration = [] }) {
	const [activeSubTab, setActiveSubTab] = useState("role");

	const subTabs = [
		{ id: "role", label: "Vai trò người dùng" },
		{ id: "registration", label: "Đăng ký theo tháng" },
	];

	const usersByRoleDisplay = useMemo(
		() =>
			(Array.isArray(usersByRole) ? usersByRole : []).map((entry) => ({
				...entry,
				role: formatRole(entry.role),
				count: Number(entry?.count) || 0,
			})),
		[usersByRole]
	);

	const userRegistrationDisplay = useMemo(
		() =>
			(Array.isArray(userRegistration) ? userRegistration : []).map((entry) => {
				const label = typeof entry?.month_label === "string" ? entry.month_label : "";
				const [year, month] = label.split("-");
				return {
					...entry,
					count: Number(entry?.count) || 0,
					month_label_display: year && month ? `${month}/${year}` : label,
				};
			}),
		[userRegistration]
	);

	return (
		<section className="mb-10">
			<SectionTitle index="4" title="Người Dùng" subtitle="Cơ cấu vai trò và đăng ký theo tháng" />

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

			{activeSubTab === "role" && (
				<Panel title="Người dùng theo vai trò">
					{usersByRoleDisplay.length > 0 ? (
						<ResponsiveContainer width="100%" height={320}>
							<PieChart>
								<Pie data={usersByRoleDisplay} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={110} label>
									{usersByRoleDisplay.map((entry, index) => (
										<Cell key={`role-cell-${entry.role || index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					) : (
						<EmptyState />
					)}
				</Panel>
			)}

			{activeSubTab === "registration" && (
				<Panel title="Đăng ký người dùng theo tháng">
					{userRegistrationDisplay.length > 0 ? (
						<ResponsiveContainer width="100%" height={320}>
							<BarChart data={userRegistrationDisplay} margin={{ top: 10, right: 20, left: 10, bottom: 6 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="#475569" />
								<XAxis dataKey="month_label_display" stroke="#94a3b8" />
								<YAxis stroke="#94a3b8" allowDecimals={false} />
								<Tooltip
									contentStyle={{
										backgroundColor: "#0f172a",
										border: "1px solid #334155",
										color: "#e2e8f0",
									}}
									labelFormatter={(label) => `Tháng: ${label}`}
								/>
								<Legend formatter={() => "Số lượng đăng ký"} />
								<Bar dataKey="count" name="Số lượng đăng ký" fill="#22c55e" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<EmptyState />
					)}
				</Panel>
			)}
		</section>
	);
}
