export default function UserAI() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[500px] bg-gray-50 rounded-xl border border-gray-200 shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-200 shrink-0">
        <img
          src="/images/logo/logo.png"
          alt="ThreeGYM Logo"
          className="w-12 h-12 rounded-full object-cover border border-gray-200"
        />
        <div>
          <p className="font-bold text-blue-600 text-base leading-tight">ThreeGYM AI Assistant</p>
          <p className="text-gray-500 text-sm">Trợ lý tư vấn chăm sóc sức khỏe</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Bot message */}
        <div className="flex items-start gap-3 max-w-2xl">
          <img
            src="/images/logo/logo.png"
            alt="bot"
            className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0 mt-1"
          />
          <div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100 text-gray-700 text-sm leading-relaxed">
              Hiện tại tính năng AI vẫn đang phát triển nên tạm thời bị khóa.
            </div>
            <p className="text-xs text-gray-400 mt-1 pl-1">
              {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-5 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
          <button
            disabled
            className="text-gray-400 text-xl cursor-not-allowed select-none"
            title="Tính năng đang bị khóa"
          >
            +
          </button>
          <input
            type="text"
            disabled
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 bg-transparent text-sm text-gray-400 placeholder-gray-400 outline-none cursor-not-allowed"
          />
          <button
            disabled
            className="text-gray-400 cursor-not-allowed select-none"
            title="Tính năng đang bị khóa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            disabled
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-300 text-white cursor-not-allowed"
            title="Tính năng đang bị khóa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}