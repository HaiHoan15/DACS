import { useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

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

function formatMembershipStatus(status) {
	const statusMap = {
		active: "Đang hoạt động",
		expired: "Hết hạn",
	};
	return statusMap[status] || status;
}

export default function SystemMember({ membershipStatus = [], membersByPackage = [], mostFrequentMembers = [] }) {
	const [activeSubTab, setActiveSubTab] = useState("status");

	const subTabs = [
		{ id: "status", label: "Trạng thái hội viên" },
		{ id: "package", label: "Theo gói dịch vụ" },
		{ id: "checkin", label: "Top check-in" },
	];

	const membershipStatusDisplay = useMemo(
		() =>
			(Array.isArray(membershipStatus) ? membershipStatus : []).map((entry) => ({
				...entry,
				status_label: formatMembershipStatus(entry?.status),
				count: Number(entry?.count) || 0,
			})),
		[membershipStatus]
	);

	return (
		<section className="mb-10">
			<SectionTitle index="5" title="Hội Viên" subtitle="Tình trạng gói và tần suất check-in" />

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

			{activeSubTab === "status" && (
				<Panel title="Trạng thái hội viên">
					{membershipStatusDisplay.length > 0 ? (
						<ResponsiveContainer width="100%" height={340}>
							<PieChart>
								<Pie data={membershipStatusDisplay} dataKey="count" nameKey="status_label" cx="50%" cy="50%" outerRadius={120} label>
									{membershipStatusDisplay.map((entry, index) => (
										<Cell key={`membership-cell-${entry.status || index}`} fill={COLORS[index % COLORS.length]} />
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

			{activeSubTab === "package" && (
				<Panel title="Hội viên theo gói dịch vụ">
					<div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
						{(Array.isArray(membersByPackage) ? membersByPackage : []).map((pkg) => (
							<div key={pkg.id} className="rounded-xl bg-slate-700/70 p-4">
								<h4 className="font-semibold text-white mb-2">{pkg.package_name}</h4>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
									<div>
										<p className="text-slate-400">Tổng</p>
										<p className="text-lg font-bold text-white">{pkg.total_members}</p>
									</div>
									<div>
										<p className="text-slate-400">Đang hoạt động</p>
										<p className="text-lg font-bold text-emerald-400">{pkg.active_members}</p>
									</div>
									<div>
										<p className="text-slate-400">Hết hạn</p>
										<p className="text-lg font-bold text-red-400">{pkg.expired_members}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</Panel>
			)}

			{activeSubTab === "checkin" && (
				<Panel title="Top 5 hội viên check-in nhiều nhất">
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
						{(Array.isArray(mostFrequentMembers) ? mostFrequentMembers : []).map((member, idx) => (
							<div key={member.id} className="rounded-xl bg-slate-700/70 p-4">
								<p className="text-sm text-slate-400">Top {idx + 1}</p>
								<p className="font-semibold text-white mt-1 truncate">{member.username}</p>
								<p className="text-xs text-slate-400 truncate">{member.email}</p>
								<p className="text-2xl font-bold text-cyan-400 mt-3">{member.checkin_count}</p>
								<p className="text-xs text-slate-400">lần check-in</p>
							</div>
						))}
					</div>
				</Panel>
			)}
		</section>
	);
}
