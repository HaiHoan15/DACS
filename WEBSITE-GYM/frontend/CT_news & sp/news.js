// Gỉa lập bảng news_categories
export const news_categories = [
    { id: 1, name: "Khuyến mãi", description: "Các chương trình ưu đãi" },
    { id: 2, name: "Kiến thức Gym", description: "Mẹo tập luyện và chế độ ăn" },
    { id: 3, name: "Sự kiện", description: "Tin tức sự kiện của phòng tập" },
];

// Gỉa lập bảng news
export const news = [
    {
        id: 1,
        title: "Khai trương chi nhánh mới",
        summary: "Phòng tập GymXYZ chính thức khai trương cơ sở mới...",
        content: "<p>Phòng tập GymXYZ chính thức khai trương cơ sở mới với nhiều trang thiết bị tân tiến, đạt chuẩn châu Âu. Đặc biệt, khách hàng đăng ký sớm sẽ được giảm ngay 50% cho 3 tháng đầu tiên!</p><p>Hệ thống phòng tập không gian mở cùng đội ngũ HLV chuyện nghiệp luôn sẵn sàng hỗ trợ các hội viên đạt được mục tiêu thể hình.</p>",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
        category_id: 3,
        author: "Admin",
        created_at: "2026-04-09 10:00:00"
    },
    {
        id: 2,
        title: "Làm thế nào để giảm mỡ bụng hiệu quả",
        summary: "Nhiều người gặp khó khăn trong việc giảm mỡ bụng. Dưới đây là 5 bài tập cốt lõi...",
        content: "<p>Nhiều người gặp khó khăn trong việc giảm mỡ bụng do sai lầm trong ăn uống cũng như lười vận động cốt lõi.</p><p>Dưới đây là 5 bài tập giúp đốt cháy calo nhanh nhất: Plank, Crunch, Leg Raise, Russian Twist, và Mountain Climber. Kết hợp cùng chế độ ăn cắt giảm tinh bột, bạn sẽ thấy kết quả chỉ sau 1 tháng.</p>",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
        category_id: 2,
        author: "HLV Tuấn Anh",
        created_at: "2026-04-08 14:30:00"
    },
    {
        id: 3,
        title: "Ưu đãi chào hè 2026 - Tặng ngay 2 tháng tập",
        summary: "Đăng ký gói 6 tháng để nhận ngay thêm 2 tháng tập miễn phí...",
        content: "<p>Chào hè sôi động 2026, GymXYZ mang đến chương trình Ưu Đãi Lớn Nhất Năm.</p><p>Khi hội viên đăng ký gói 6 tháng sẽ được tặng ngay thêm 2 tháng tập miễn phí, cùng combo quà tặng gồm áo thun thể thao và bình nước cao cấp. Áp dụng đến hết tháng này.</p>",
        image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop",
        category_id: 1,
        author: "Marketing Team",
        created_at: "2026-04-05 09:15:00"
    },
    {
        id: 4,
        title: "Protein thực vật có tốt bằng Whey Protein?",
        summary: "Sự khác biệt giữa protein nguồn gốc thực vật và whey protein từ sữa...",
        content: "<p>Đối với những người tập thể hình có thói quen ăn chay, nguồn protein thực vật đang là lựa chọn ưu tiên.</p><p>Mặc dù Whey Protein từ sữa cung cấp lượng hấp thu khá nhanh, Protein thực vật tổng hợp từ đậu nành, đậu Hà Lan vẫn có cấu hình amino acids đủ tốt để giúp cơ thể phục hồi và phát triển cơ bắp nạc.</p>",
        image: "https://plus.unsplash.com/premium_photo-1664115161358-13accfc3efea?q=80&w=2066&auto=format&fit=crop",
        category_id: 2,
        author: "HLV Lan Phương",
        created_at: "2026-04-02 16:45:00"
    }
];

// Hàm hỗ trợ (nếu sau này cần thiết)
export const getAllNews = () => news;

export const getNewsById = (id) => news.find(n => n.id === parseInt(id));

export const getNewsByCategoryId = (catId) => news.filter(n => n.category_id === parseInt(catId));

export const getLatestNews = (limit = 5) => {
    return [...news].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);
};

export const getCategories = () => news_categories;
