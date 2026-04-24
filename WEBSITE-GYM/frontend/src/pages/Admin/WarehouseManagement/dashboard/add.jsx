import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../API/api";
import Notification from "../../../../components/Notification";

export default function AddWarehouseItem() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		quantity: 0,
		avatar: "",
	});
	const [imagePreview, setImagePreview] = useState(null);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [notification, setNotification] = useState(null);

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
				setImagePreview(null);
			}
		} catch (error) {
			setNotification({ message: error.response?.data?.message || "Lỗi kết nối server", type: "error" });
			setImagePreview(null);
		} finally {
			setUploading(false);
		}
	};

	const validateForm = () => {
		if (!formData.name.trim()) {
			setNotification({ message: "Tên dụng cụ không được để trống", type: "error" });
			return false;
		}
		if (formData.name.length > 255) {
			setNotification({ message: "Tên dụng cụ không được vượt quá 255 ký tự", type: "error" });
			return false;
		}
		if (Number(formData.quantity) < 0) {
			setNotification({ message: "Số lượng không được âm", type: "error" });
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setLoading(true);
		try {
			const token = localStorage.getItem("authToken") || "temp-token";
			const response = await api.post(
				"WarehouseController.php",
				{
					action: "add",
					name: formData.name.trim(),
					description: formData.description.trim(),
					quantity: Number(formData.quantity),
					avatar: formData.avatar.trim(),
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			if (response.data.success) {
				setNotification({ message: response.data.message || "Thêm dụng cụ thành công!", type: "success" });
				setTimeout(() => {
					navigate("/admin/WarehouseManagement");
				}, 1200);
			} else {
				setNotification({ message: response.data.message || "Lỗi khi thêm dụng cụ", type: "error" });
			}
		} catch (error) {
			setNotification({ message: error.response?.data?.message || "Lỗi kết nối server", type: "error" });
		} finally {
			setLoading(false);
		}
	};

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
				<h2 className="text-2xl font-bold text-white">Thêm dụng cụ tập luyện</h2>
			</div>

			<div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">Tên dụng cụ *</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							placeholder="Nhập tên dụng cụ"
							className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">Số lượng</label>
						<input
							type="number"
							min="0"
							name="quantity"
							value={formData.quantity}
							onChange={handleInputChange}
							className="w-full md:w-60 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">Mô tả</label>
						<textarea
							rows="5"
							name="description"
							value={formData.description}
							onChange={handleInputChange}
							placeholder="Mô tả dụng cụ, mục đích sử dụng, ghi chú bảo trì..."
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
							disabled={loading || uploading}
							className="px-6 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg hover:from-red-700 hover:to-yellow-600 transition disabled:opacity-60"
						>
							{loading ? "Đang xử lý..." : "Thêm dụng cụ"}
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
