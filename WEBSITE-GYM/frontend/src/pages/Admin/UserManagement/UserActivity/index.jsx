import { Fragment, useEffect, useMemo, useState } from "react";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";

function formatDateTime(value) {
	if (!value) return "-";
	return new Date(value).toLocaleString("vi-VN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

export default function UserActivity() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [notification, setNotification] = useState(null);
	const [expandedUsers, setExpandedUsers] = useState({});
	const [expandedRooms, setExpandedRooms] = useState({});

	useEffect(() => {
		const fetchActivities = async () => {
			try {
				const token = localStorage.getItem("authToken") || "temp-token";
				const response = await api.get("MemberConfirmationController.php", {
					params: { action: "getUserActivity" },
					headers: { Authorization: `Bearer ${token}` },
				});

				if (response.data.success) {
					setUsers(response.data.users || []);
				} else {
					setNotification({ message: response.data.message || "Không thể tải hoạt động người dùng", type: "error" });
				}
			} catch (error) {
				setNotification({ message: error.response?.data?.message || "Lỗi kết nối server", type: "error" });
			} finally {
				setLoading(false);
			}
		};

		fetchActivities();
	}, []);

	const totalCheckins = useMemo(
		() => users.reduce((sum, user) => sum + Number(user.total_checkins || 0), 0),
		[users]
	);

	const toggleUser = (userId) => {
		setExpandedUsers((prev) => ({ ...prev, [userId]: !prev[userId] }));
	};

	const toggleRoom = (userId, roomKey) => {
		const key = `${userId}-${roomKey}`;
		setExpandedRooms((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	if (loading) {
		return (
			<div className="text-center text-gray-400 py-12">
				<p>Đang tải dữ liệu hoạt động...</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{notification && (
				<Notification
					message={notification.message}
					type={notification.type}
					onClose={() => setNotification(null)}
				/>
			)}

			<div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-300">
				Tổng số người dùng: <span className="text-white font-semibold">{users.length}</span>
				<span className="mx-2">|</span>
				Tổng lượt đi tập: <span className="text-yellow-400 font-semibold">{totalCheckins}</span>
			</div>

			<div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
				{users.length === 0 ? (
					<div className="text-center text-gray-400 py-10">Chưa có dữ liệu hoạt động.</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm text-left">
							<thead className="bg-gray-700 border-b border-gray-600">
								<tr>
									<th className="px-6 py-4 font-semibold text-gray-300">#</th>
									<th className="px-6 py-4 font-semibold text-gray-300">Tên user</th>
									<th className="px-6 py-4 font-semibold text-gray-300">Gmail</th>
									<th className="px-6 py-4 font-semibold text-gray-300">Số lần đi tập</th>
									<th className="px-6 py-4 font-semibold text-gray-300 text-center">Chi tiết</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user, index) => (
									<Fragment key={`user-group-${user.user_id}`}>
										<tr key={`user-row-${user.user_id}`} className="border-b border-gray-700 hover:bg-gray-700/40 transition">
											<td className="px-6 py-4 text-gray-400">{index + 1}</td>
											<td className="px-6 py-4 text-white font-medium">{user.username}</td>
											<td className="px-6 py-4 text-gray-300">{user.email}</td>
											<td className="px-6 py-4 text-yellow-400 font-semibold">{user.total_checkins || 0}</td>
											<td className="px-6 py-4 text-center">
												<button
													type="button"
													onClick={() => toggleUser(user.user_id)}
													className="px-3 py-1.5 rounded-md bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold transition"
												>
													{expandedUsers[user.user_id] ? "Ẩn" : "Xem"}
												</button>
											</td>
										</tr>

										{expandedUsers[user.user_id] && (
											<tr key={`user-expand-${user.user_id}`} className="border-b border-gray-700 bg-gray-900/30">
												<td colSpan={5} className="px-6 py-4">
													{user.rooms?.length ? (
														<div className="space-y-3">
															{user.rooms.map((room) => {
																const roomKey = `${room.room_id}-${room.room_name}`;
																const expandKey = `${user.user_id}-${roomKey}`;
																return (
																	<div key={expandKey} className="rounded-lg border border-gray-700 bg-gray-800/60">
																		<div className="flex items-center justify-between px-4 py-3">
																			<div>
																				<p className="text-white font-semibold">{room.room_name}</p>
																				<p className="text-xs text-gray-400">Số lần đi: {room.room_checkins || 0}</p>
																			</div>
																			<button
																				type="button"
																				onClick={() => toggleRoom(user.user_id, roomKey)}
																				className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
																			>
																				{expandedRooms[expandKey] ? "Ẩn thời gian" : "Xem thời gian"}
																			</button>
																		</div>

																		{expandedRooms[expandKey] && (
																			<div className="border-t border-gray-700 px-4 py-3">
																				{room.times?.length ? (
																					<ul className="space-y-2">
																						{room.times.map((timeItem, idx) => (
																							<li key={`${expandKey}-time-${idx}`} className="text-sm text-gray-300 flex flex-wrap items-center gap-3">
																								<span className="px-2 py-1 rounded bg-gray-700 text-gray-200">
																									{formatDateTime(timeItem.confirmed_at)}
																								</span>
																								<span className="text-xs text-gray-500 break-all">Mã: {timeItem.confirmation_code}</span>
																							</li>
																						))}
																					</ul>
																				) : (
																					<p className="text-sm text-gray-400">Chưa có mốc thời gian.</p>
																				)}
																			</div>
																		)}
																	</div>
																);
															})}
														</div>
													) : (
														<div className="text-sm text-gray-400">Người dùng này chưa có lịch sử xác nhận đi tập.</div>
													)}
												</td>
											</tr>
										)}
									</Fragment>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
