import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import api from "../../../../../API/api";
import Notification from "../../../../../components/Notification";

export default function EditProduct() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        avatar: "",
        categoryId: "",
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Fetch product data and categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("authToken") || "temp-token";

                // Fetch categories
                const categoriesResponse = await api.get("CategoryController.php", {
                    params: {
                        action: "getAll",
                    },
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (categoriesResponse.data.success) {
                    setCategories(categoriesResponse.data.categories || []);
                }

                // Fetch product
                const productResponse = await api.get("ProductController.php", {
                    params: {
                        action: "getById",
                        productId: productId,
                    },
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (productResponse.data.success) {
                    const product = productResponse.data.product;
                    setFormData({
                        name: product.name || "",
                        description: product.description || "",
                        price: product.price || 0,
                        avatar: product.avatar || "",
                        categoryId: product.category_id || "",
                    });
                    // Set preview if avatar exists
                    if (product.avatar) {
                        setImagePreview(`/uploads/products/${product.avatar}`);
                    }
                } else {
                    setNotification({
                        message: productResponse.data.message || "Lỗi khi lấy sản phẩm",
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

        fetchData();
    }, [productId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý upload hình ảnh
    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra kích thước
        if (file.size > 5 * 1024 * 1024) {
            setNotification({
                message: "File quá lớn! Tối đa 5MB",
                type: "error",
            });
            return;
        }

        // Kiểm tra loại file
        if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
            setNotification({
                message: "Chỉ chấp nhận JPEG, PNG, GIF, WebP",
                type: "error",
            });
            return;
        }

        // Hiển thị preview trước
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        setUploading(true);
        try {
            const token = localStorage.getItem("authToken") || "temp-token";
            const uploadFormData = new FormData();
            uploadFormData.append('action', 'uploadImage');
            uploadFormData.append('image', file);

            const response = await api.post(
                "ProductController.php",
                uploadFormData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setFormData((prev) => ({
                    ...prev,
                    avatar: response.data.filename,
                }));
                setNotification({
                    message: "Tải hình ảnh thành công!",
                    type: "success",
                });
            } else {
                setNotification({
                    message: response.data.message || "Lỗi khi tải hình ảnh",
                    type: "error",
                });
            }
        } catch (error) {
            setNotification({
                message: error.response?.data?.message || "Lỗi kết nối server",
                type: "error",
            });
        } finally {
            setUploading(false);
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setNotification({
                message: "Tên sản phẩm không được để trống",
                type: "error",
            });
            return false;
        }

        if (formData.name.length > 255) {
            setNotification({
                message: "Tên sản phẩm không được vượt quá 255 ký tự",
                type: "error",
            });
            return false;
        }

        if (!formData.categoryId) {
            setNotification({
                message: "Danh mục sản phẩm là bắt buộc",
                type: "error",
            });
            return false;
        }

        if (formData.price < 0) {
            setNotification({
                message: "Giá sản phẩm không được âm",
                type: "error",
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem("authToken") || "temp-token";
            const response = await api.post(
                "ProductController.php",
                {
                    action: "update",
                    productId: productId,
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    price: formData.price,
                    avatar: formData.avatar.trim(),
                    categoryId: formData.categoryId,
                },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setNotification({
                    message: response.data.message || "Cập nhật sản phẩm thành công!",
                    type: "success",
                });

                // Redirect sau 1.5 giây
                setTimeout(() => {
                    navigate("/admin/ProductManagement");
                }, 1500);
            } else {
                setNotification({
                    message: response.data.message || "Lỗi khi cập nhật sản phẩm",
                    type: "error",
                });
            }
        } catch (error) {
            setNotification({
                message: error.response?.data?.message || "Lỗi kết nối server",
                type: "error",
            });
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
                    onClick={() => navigate("/admin/ProductManagement")}
                    className="text-gray-400 hover:text-white transition"
                >
                    ← Quay lại
                </button>
                <h2 className="text-2xl font-bold text-white">Chỉnh sửa sản phẩm</h2>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product ID (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            ID sản phẩm
                        </label>
                        <input
                            type="text"
                            value={productId}
                            readOnly
                            disabled
                            className="w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg border border-gray-600"
                        />
                    </div>

                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Tên sản phẩm *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Nhập tên sản phẩm"
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            {formData.name.length}/255 ký tự
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Mô tả
                        </label>
                        <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
                            <CKEditor
                                editor={ClassicEditor}
                                data={formData.description}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: data,
                                    }));
                                }}
                                config={{
                                    toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
                                    heading: {
                                        options: [
                                            { model: 'paragraph', title: 'Paragraph' },
                                            { model: 'heading1', view: 'h1', title: 'Heading 1' },
                                            { model: 'heading2', view: 'h2', title: 'Heading 2' },
                                        ]
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Danh mục sản phẩm *
                        </label>
                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Giá sản phẩm
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="Nhập giá sản phẩm"
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                        />
                    </div>

                    {/* Avatar URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Hình ảnh sản phẩm
                        </label>
                        <div className="space-y-3">
                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="w-40 h-40 rounded-lg border border-gray-600 flex items-center justify-center bg-gray-700 overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            {/* File Input */}
                            <input
                                type="file"
                                onChange={handleImageChange}
                                disabled={uploading}
                                accept="image/*"
                                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none file:bg-blue-600 file:text-white file:border-0 file:px-3 file:py-1 file:rounded file:cursor-pointer disabled:opacity-50"
                            />
                            {formData.avatar && (
                                <p className="text-xs text-green-400">✓ Hình ảnh: {formData.avatar}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg hover:from-red-700 hover:to-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/admin/ProductManagement")}
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
