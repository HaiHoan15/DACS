import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";

export default function EditWarehouseItem() {
	const navigate = useNavigate();
	const { itemId } = useParams();
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		avatar: "",
	});
	const [imagePreview, setImagePreview] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [notification, setNotification] = useState(null);

	useEffect(() => {
		const fetchItem = async () => {
			try {
				const token = localStorage.getItem("authToken") || "temp-token";
				const response = await api.get("WarehouseController.php", {
					params: { action: "getById", itemId },
					headers: { Authorization: `Bearer ${token}` },
				});

				if (response.data.success) {
					const item = response.data.item;
					setFormData({
						name: item.name || "",
						description: item.description || "",
						avatar: item.avatar || "",
					});
					if (item.avatar) {
						setImagePreview(`/uploads/warehouse/${item.avatar}`);
					}
				} else {
					setNotification({ message: response.data.message || "Lỗi khi lấy dữ liệu", type: "error" });
				}
			} catch (error) {
				setNotification({ message: error.response?.data?.message || "Lỗi kết nối server", type: "error" });
			} finally {
				setLoading(false);
			}
		};

		fetchItem();
	}, [itemId]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleImageChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			setNotification({ message: "File quá lớn! Tối đa 5MB", type: "error" });
			return;
		}

		if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
			setNotification({ message: "Chỉ chấp nhận JPEG, PNG, GIF, WebP", type: "error" });
			return;
		}

		const reader = new FileReader();
		reader.onload = (ev) => setImagePreview(ev.target.result);
		reader.readAsDataURL(file);

		setUploading(true);
		try {
			const token = localStorage.getItem("authToken") || "temp-token";
			const uploadFormData = new FormData();
			uploadFormData.append("action", "uploadImage");
			uploadFormData.append("image", file);

			const response = await api.post("WarehouseController.php", uploadFormData, {
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.data.success) {
				setFormData((prev) => ({ ...prev, avatar: response.data.filename }));
				setNotification({ message: "Tải hình ảnh thành công!", type: "success" });
			} else {
				setNotification({ message: response.data.message || "Lỗi khi tải hình ảnh", type: "error" });
			}
		} catch (error) {
			setNotification({ message: error.response?.data?.message || "Lỗi kết nối server", type: "error" });
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			setNotification({ message: "Tên dụng cụ không được để trống", type: "error" });
			return;
		}

		setSubmitting(true);
		try {
			const token = localStorage.getItem("authToken") || "temp-token";
			const response = await api.post(
				"WarehouseController.php",
				{
					action: "update",
					itemId,
					name: formData.name.trim(),
					description: formData.description.trim(),
					avatar: formData.avatar.trim(),
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			if (response.data.success) {
				setNotification({ message: response.data.message || "Cập nhật dụng cụ thành công", type: "success" });
				setTimeout(() => {
					navigate("/admin/WarehouseManagement");
				}, 1200);
			} else {
				setNotification({ message: response.data.message || "Lỗi khi cập nhật dụng cụ", type: "error" });
			}
		} catch (error) {
			setNotification({ message: error.response?.data?.message || "Lỗi kết nối server", type: "error" });
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="text-center text-gray-400 py-12">
				<p>Đang tải dữ liệu...</p>
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
				<h2 className="text-2xl font-bold text-white">Chỉnh sửa dụng cụ</h2>
			</div>

			<div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">ID dụng cụ</label>
						<input
							type="text"
							value={itemId}
							readOnly
							disabled
							className="w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg border border-gray-600"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">Tên dụng cụ *</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">Mô tả</label>
						<textarea
							rows="5"
							name="description"
							value={formData.description}
							onChange={handleInputChange}
							className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">Hình ảnh</label>
						<input
							type="file"
							accept="image/*"
							onChange={handleImageChange}
							disabled={uploading}
							className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
						/>
						{uploading && <p className="text-xs text-yellow-400 mt-2">Đang tải ảnh...</p>}
						{imagePreview && (
							<img src={imagePreview} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded border border-gray-600" />
						)}
					</div>

					<div className="flex gap-3 pt-3">
						<button
							type="submit"
							disabled={submitting || uploading}
							className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-60"
						>
							{submitting ? "Đang xử lý..." : "Lưu thay đổi"}
						</button>
						<button
							type="button"
							onClick={() => navigate("/admin/WarehouseManagement")}
							className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
						>
							Hủy
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
