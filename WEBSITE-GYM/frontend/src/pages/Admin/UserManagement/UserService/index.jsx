import { Fragment, useEffect, useMemo, useState } from "react";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";
import Pagination2 from "../../../../components/Pagination2";

const ITEMS_PER_PAGE = 10;
const HISTORY_ITEMS_PER_PAGE = 10;

function formatDate(dateString) {
	if (!dateString) return "-";
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleDateString("vi-VN");
}

export default function UserServiceStatsPage({ searchQuery = "" }) {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [notification, setNotification] = useState(null);
	const [expanded, setExpanded] = useState({});
	const [currentPage, setCurrentPage] = useState(1);
	const [historyPages, setHistoryPages] = useState({});

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await api.get("ServiceController.php", {
					params: { action: "getUsageStats" },
				});

				if (res.data?.success) {
					setRows(Array.isArray(res.data.rows) ? res.data.rows : []);
				} else {
					setNotification({
						type: "error",
						message: res.data?.message || "Không thể tải dữ liệu thống kê dịch vụ",
					});
				}
			} catch (error) {
				setNotification({
					type: "error",
					message: error.response?.data?.message || "Lỗi kết nối máy chủ",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	const sortedRows = useMemo(() => {
		return [...rows].sort((a, b) => Number(a.id) - Number(b.id));
	}, [rows]);

	const normalizedQuery = searchQuery.trim().toLowerCase();
	const filteredRows = useMemo(() => {
		if (!normalizedQuery) return sortedRows;
		return sortedRows.filter((row) =>
			String(row.id).toLowerCase().includes(normalizedQuery) ||
			(row.username || "").toLowerCase().includes(normalizedQuery) ||
			(row.email || "").toLowerCase().includes(normalizedQuery)
		);
	}, [sortedRows, normalizedQuery]);

	const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedRows = filteredRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery]);

	const toggleExpand = (userId) => {
		setExpanded((prev) => {
			const nextExpanded = !prev[userId];
			if (nextExpanded) {
				setHistoryPages((prevPages) => ({ ...prevPages, [userId]: 1 }));
			}
			return { ...prev, [userId]: nextExpanded };
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-900 flex items-center justify-center">
				<div className="text-white text-lg">Đang tải thống kê dịch vụ...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900 ">
			{notification && (
				<Notification
					message={notification.message}
					type={notification.type}
					onClose={() => setNotification(null)}
				/>
			)}

			<div className="mb-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
				{/* <h1 className="text-4xl font-bold text-white mb-1">
					<span className="text-red-500">THỐNG KÊ</span>
					<span className="text-yellow-500 ml-2">DỊCH VỤ NGƯỜI DÙNG</span>
				</h1> */}
				<p className="text-sm text-white">
					Danh sách chỉ xem, không chỉnh sửa. Bấm nút để xem lịch sử dịch vụ đã sử dụng.
				</p>
			</div>

			<div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="bg-gray-700 border-b border-gray-600">
							<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tên người dùng</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Dịch vụ</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Kích hoạt?</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Lịch sử</th>
						</tr>
					</thead>

					<tbody>
						{paginatedRows.length === 0 ? (
							<tr>
								<td colSpan={6} className="px-5 py-10 text-center text-gray-400">
									Chưa có dữ liệu.
								</td>
							</tr>
						) : (
							paginatedRows.map((row) => {
								const isExpanded = !!expanded[row.id];
								const activationClass = row.activation === "UserPay" ? "text-emerald-400" : "text-yellow-400";
								const history = Array.isArray(row.history) ? row.history : [];
								const historyTotalPages = Math.max(1, Math.ceil(history.length / HISTORY_ITEMS_PER_PAGE));
								const historyCurrentPage = historyPages[row.id] || 1;
								const historyStart = (historyCurrentPage - 1) * HISTORY_ITEMS_PER_PAGE;
								const paginatedHistory = history.slice(historyStart, historyStart + HISTORY_ITEMS_PER_PAGE);

								return (
									<Fragment key={row.id}>
										<tr key={`main-${row.id}`} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
											<td className="px-5 py-3 text-gray-300">{row.id}</td>
											<td className="px-5 py-3 text-gray-200 font-medium">{row.username || "-"}</td>
											<td className="px-5 py-3 text-gray-300">{row.email || "-"}</td>
											<td className="px-5 py-3 text-gray-300">{row.service || "Chưa có"}</td>
											<td className={`px-5 py-3 font-semibold ${activationClass}`}>{row.activation || "-"}</td>
											<td className="px-5 py-3">
												<button
													type="button"
													onClick={() => toggleExpand(row.id)}
													className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-xs font-semibold"
												>
													{isExpanded ? "Ẩn" : "Xem"}
												</button>
											</td>
										</tr>

										{isExpanded && (
											<tr className="border-b border-gray-700 bg-gray-900/40">
												<td colSpan={6} className="px-5 py-4">
													{history.length > 0 ? (
														<div className="overflow-x-auto rounded-lg border border-gray-700">
															<table className="w-full text-xs md:text-sm text-left">
																<thead className="bg-gray-700/80 border-b border-gray-600">
																	<tr>
																		<th className="px-4 py-2 text-gray-300 font-semibold">Dịch vụ</th>
																		<th className="px-4 py-2 text-gray-300 font-semibold">Kích hoạt?</th>
																		<th className="px-4 py-2 text-gray-300 font-semibold">Ngày bắt đầu</th>
																		<th className="px-4 py-2 text-gray-300 font-semibold">Ngày kết thúc</th>
																	</tr>
																</thead>
																<tbody>
																	{paginatedHistory.map((h, idx) => (
																		<tr key={`${row.id}-${idx}`} className="border-b border-gray-700 last:border-0">
																			<td className="px-4 py-2 text-gray-200">{h.service || "-"}</td>
																			<td className={`px-4 py-2 font-semibold ${h.activation === "UserPay" ? "text-emerald-400" : "text-yellow-400"}`}>
																				{h.activation || "-"}
																			</td>
																			<td className="px-4 py-2 text-gray-300">{formatDate(h.start_date)}</td>
																			<td className="px-4 py-2 text-gray-300">{formatDate(h.end_date)}</td>
																		</tr>
																	))}
																</tbody>
															</table>
															{history.length > HISTORY_ITEMS_PER_PAGE && (
																<Pagination2
																	currentPage={historyCurrentPage}
																	totalPages={historyTotalPages}
																	onPageChange={(page) =>
																		setHistoryPages((prev) => ({ ...prev, [row.id]: page }))
																	}
																/>
															)}
														</div>
													) : (
														<p className="text-gray-400 text-sm">Người dùng này chưa có lịch sử dịch vụ.</p>
													)}
												</td>
											</tr>
										)}
									</Fragment>
								);
							})
						)}
					</tbody>
				</table>
				{filteredRows.length > ITEMS_PER_PAGE && (
					<div className="px-4 pb-6">
						<Pagination2
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
