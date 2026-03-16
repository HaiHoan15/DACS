const AccountPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl font-bold text-blue-400 mb-4">
        Account
      </h1>

      <p className="max-w-xl text-slate-400 leading-relaxed">
        Hiện tại tui vẫn chưa biết đăng nhập để làm gì,  
        nên <span className="text-purple-400 font-medium">tui quyết định để trang này trống không</span> 😌  
        <br />
        Khi nào nghĩ ra ý tưởng hay ho hơn thì quay lại làm tiếp. Xin lỗi bạn rất nhiều 🙏
      </p>

      <div className="mt-6 text-sm text-slate-500 italic">
        (Trang này đang trong quá trình “đợi cảm hứng” ✨)
      </div>
    </div>
  );
};

export default AccountPage;