import { useMemo, useState } from "react";

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

function formatStatusLabel(status) {
	const map = {
		available: "Còn hàng",
		out_of_stock: "Hết hàng",
	};
	return map[status] || status;
}

function statusPillClass(status) {
	if (status === "available") return "bg-emerald-600";
	if (status === "out_of_stock") return "bg-red-600";
	return "bg-amber-600";
}

export default function SystemWarehouse({ warehouseStatus = [], warehouseItems = [] }) {
	const [activeSubTab, setActiveSubTab] = useState("available");

	const subTabs = [
		{ id: "available", label: "Còn hàng" },
		{ id: "out_of_stock", label: "Hết hàng" },
	];

	const statusMap = useMemo(() => {
		const map = {
			available: { count: 0, total_quantity: 0 },
			out_of_stock: { count: 0, total_quantity: 0 },
		};

		(Array.isArray(warehouseStatus) ? warehouseStatus : []).forEach((entry) => {
			const key = entry?.status;
			if (key in map) {
				map[key] = {
					count: Number(entry?.count) || 0,
					total_quantity: Number(entry?.total_quantity) || 0,
				};
			}
		});
		return map;
	}, [warehouseStatus]);

	const itemsByTab = useMemo(
		() =>
			(Array.isArray(warehouseItems) ? warehouseItems : [])
				.filter((item) => item?.status === activeSubTab)
				.map((item) => ({
					...item,
					total_quantity: Number(item?.total_quantity) || 0,
					exported_quantity: Number(item?.exported_quantity) || 0,
					remaining_quantity: Number(item?.remaining_quantity) || 0,
				})),
		[warehouseItems, activeSubTab]
	);

	const summary = statusMap[activeSubTab] || { count: 0, total_quantity: 0 };

	return (
		<section className="mb-10">
			<SectionTitle index="8" title="Kho" subtitle="Trạng thái tồn kho theo nhóm thiết bị" />

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

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<div className="rounded-xl bg-slate-700/70 p-5 text-center">
					<p className="text-slate-400 mb-2">Số dụng cụ ({formatStatusLabel(activeSubTab)})</p>
					<p className="text-3xl font-bold text-cyan-400">{summary.count}</p>
				</div>
				<div className="rounded-xl bg-slate-700/70 p-5 text-center">
					<p className="text-slate-400 mb-2">Tổng số lượng ({formatStatusLabel(activeSubTab)})</p>
					<p className="text-3xl font-bold text-amber-400">{summary.total_quantity}</p>
				</div>
			</div>

			<Panel title={`Danh sách dụng cụ - ${formatStatusLabel(activeSubTab)}`}>
				<div className="overflow-x-auto">
					<table className="w-full text-sm text-slate-100">
						<thead>
							<tr className="border-b border-slate-600">
								<th className="text-left p-3">Tên dụng cụ</th>
								<th className="text-right p-3">Tổng kho</th>
								<th className="text-right p-3">Đã xuất kho</th>
								<th className="text-right p-3">Còn lại</th>
								<th className="text-right p-3">Trạng thái</th>
							</tr>
						</thead>
						<tbody>
							{itemsByTab.length === 0 ? (
								<tr>
									<td colSpan={5} className="p-4 text-center text-slate-400">
										Không có dụng cụ trong danh sách này
									</td>
								</tr>
							) : (
								itemsByTab.map((item) => (
									<tr key={item.id} className="border-b border-slate-700 hover:bg-slate-700/40">
										<td className="p-3">{item.name}</td>
										<td className="p-3 text-right">{item.total_quantity}</td>
										<td className="p-3 text-right">{item.exported_quantity}</td>
										<td className="p-3 text-right font-semibold">{item.remaining_quantity}</td>
										<td className="p-3 text-right">
											<span className={`px-2 py-1 rounded text-xs font-semibold ${statusPillClass(item.status)}`}>
												{formatStatusLabel(item.status)}
											</span>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</Panel>
		</section>
	);
}
