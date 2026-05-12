import { useMemo } from "react";
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

export default function SystemRoom({ checkinsByRoom = [] }) {
	const chartData = useMemo(
		() =>
			(Array.isArray(checkinsByRoom) ? checkinsByRoom : []).map((item) => ({
				...item,
				checkin_count: Number(item?.checkin_count) || 0,
			})),
		[checkinsByRoom]
	);

	return (
		<section className="mb-10">
			<SectionTitle index="6" title="Phòng Tập" subtitle="Số lượt check-in theo từng phòng" />
			<Panel title="Biểu đồ lượt check-in theo phòng tập">
				{chartData.length > 0 ? (
					<ResponsiveContainer width="100%" height={340}>
						<BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 6 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#475569" />
							<XAxis dataKey="room_name" stroke="#94a3b8" />
							<YAxis stroke="#94a3b8" allowDecimals={false} />
							<Tooltip
								contentStyle={{
									backgroundColor: "#0f172a",
									border: "1px solid #334155",
									color: "#e2e8f0",
								}}
							/>
							<Legend formatter={() => "Lượt check-in"} />
							<Bar dataKey="checkin_count" name="Lượt check-in" fill="#f43f5e" radius={[8, 8, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				) : (
					<EmptyState />
				)}
			</Panel>
		</section>
	);
}
