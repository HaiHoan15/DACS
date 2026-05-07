import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";

export default function WarehouseDetail() {
	const navigate = useNavigate();
	const { itemId } = useParams();
	const [item, setItem] = useState(null);
	const [loading, setLoading] = useState(true);
	const [notification, setNotification] = useState(null);

	useEffect(() => {
		const fetchItem = async () => {
			try {
				const token = localStorage.getItem("authToken") || "temp-token";
				const response = await api.get("WarehouseController.php", {
					params: {
						action: "getById",
						itemId,
					},
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.data.success) {
					setItem(response.data.item);
				} else {
					setNotification({
						message: response.data.message || "Lỗi khi lấy chi tiết dụng cụ",
						type: "error",
					});
				}
			} catch (error) {
				setNotification({
					message: error.response?.data?.message || "Lỗi kết nối server",
					type: "error",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchItem();
	}, [itemId]);

	const getImageUrl = (avatar) => {
		if (!avatar) return "/images/error/product.png";
		return avatar.startsWith("http") ? avatar : `/uploads/warehouse/${avatar}`;
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("vi-VN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-900 flex items-center justify-center">
				<div className="text-white text-xl">
					<svg className="animate-spin h-8 w-8 mb-4 mx-auto" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
						<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
					</svg>
					Đang tải dữ liệu...
				</div>
			</div>
		);
	}

	if (!item) {
		return (
			<div className="min-h-screen bg-gray-900 py-8 px-4">
				{notification && (
					<Notification
						message={notification.message}
						type={notification.type}
						onClose={() => setNotification(null)}
					/>
				)}
				<div className="max-w-4xl mx-auto">
					<button
						onClick={() => navigate("/admin/WarehouseManagement")}
						className="mb-4 text-gray-400 hover:text-gray-300 transition flex items-center gap-2"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Quay lại
					</button>
					<div className="text-center text-gray-400 py-12 bg-gray-800 rounded-lg border border-gray-700">
						<p>Không tìm thấy dụng cụ</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900 py-8 px-4">
			{notification && (
				<Notification
					message={notification.message}
					type={notification.type}
					onClose={() => setNotification(null)}
				/>
			)}

			<div className="max-w-4xl mx-auto">
				<div className="mb-8">
					<button
						onClick={() => navigate("/admin/WarehouseManagement")}
						className="mb-4 text-gray-400 hover:text-gray-300 transition flex items-center gap-2"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Quay lại
					</button>
					<h1 className="text-4xl font-bold text-white">
						<span className="text-red-500">CHI TIẾT</span>
						<span className="text-yellow-500 ml-2">DỤNG CỤ</span>
					</h1>
				</div>

				<div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
					<div className="flex justify-center mb-8 pb-8 border-b border-gray-700">
						<img
							src={getImageUrl(item.avatar)}
							alt={item.name}
							className="w-56 h-56 object-cover rounded-lg border-2 border-gray-600"
							onError={(e) => {
								e.target.src = "/images/error/product.png";
							}}
						/>
					</div>

					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">Tên dụng cụ</label>
							<p className="text-lg text-white font-semibold">{item.name}</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-2">ID dụng cụ</label>
								<p className="text-lg text-white font-semibold">{item.id}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-2">Số lượng</label>
								<p className="text-2xl text-yellow-500 font-bold">{item.quantity}</p>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">Mô tả</label>
							<div className="text-gray-300 bg-gray-700 rounded p-4 border border-gray-600 overflow-auto max-h-96">
								{item.description || "Không có mô tả"}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-2">Ngày tạo</label>
								<p className="text-lg text-white font-semibold">{formatDate(item.created_at)}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-2">Ngày cập nhật</label>
								<p className="text-lg text-white font-semibold">{formatDate(item.updated_at)}</p>
							</div>
						</div>

						<div className="flex gap-4 pt-4 border-t border-gray-700">
							<button
								onClick={() => navigate(`/admin/WarehouseManagement/dashboard/edit/${item.id}`)}
								className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
							>
								Chỉnh sửa
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
