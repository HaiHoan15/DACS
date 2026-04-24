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
			<div className="text-center text-gray-400 py-12">
				<p>Đang tải dữ liệu...</p>
			</div>
		);
	}

	if (!item) {
		return (
			<div className="space-y-6">
				{notification && (
					<Notification
						message={notification.message}
						type={notification.type}
						onClose={() => setNotification(null)}
					/>
				)}
				<button
					onClick={() => navigate("/admin/WarehouseManagement")}
					className="text-gray-400 hover:text-white transition"
				>
					← Quay lại
				</button>
				<div className="text-center text-gray-400 py-12">
					<p>Không tìm thấy dụng cụ</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{notification && (
				<Notification
					message={notification.message}
					type={notification.type}
					onClose={() => setNotification(null)}
				/>
			)}

			<div className="flex items-center gap-4">
				<button
					onClick={() => navigate("/admin/WarehouseManagement")}
					className="text-gray-400 hover:text-white transition"
				>
					← Quay lại
				</button>
				<h2 className="text-2xl font-bold text-white">Chi tiết dụng cụ tập luyện</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-1">
					<div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
						<img
							src={getImageUrl(item.avatar)}
							alt={item.name}
							className="w-full h-96 object-cover rounded-lg mb-4"
							onError={(e) => {
								e.target.src = "/images/error/product.png";
							}}
						/>
					</div>
				</div>

				<div className="md:col-span-2">
					<div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-1">Tên dụng cụ</label>
							<p className="text-xl text-white font-semibold">{item.name}</p>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-1">ID dụng cụ</label>
								<p className="text-white">{item.id}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-1">Số lượng</label>
								<p className="text-2xl text-yellow-500 font-bold">{item.quantity}</p>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-400 mb-1">Mô tả</label>
							<div className="text-gray-300 bg-gray-700 rounded p-4 border border-gray-600 min-h-28">
								{item.description || "Không có mô tả"}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-1">Ngày tạo</label>
								<p className="text-sm text-gray-300">{formatDate(item.created_at)}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-1">Ngày cập nhật</label>
								<p className="text-sm text-gray-300">{formatDate(item.updated_at)}</p>
							</div>
						</div>

						<div className="flex gap-4 pt-4 border-t border-gray-700">
							<button
								onClick={() => navigate(`/admin/WarehouseManagement/dashboard/edit/${item.id}`)}
								className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
							>
								Chỉnh sửa
							</button>
							<button
								onClick={() => navigate("/admin/WarehouseManagement")}
								className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
							>
								Quay lại
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
