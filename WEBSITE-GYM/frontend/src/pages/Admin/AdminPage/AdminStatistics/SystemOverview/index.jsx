import { useMemo } from "react";
import CountUpCard from "./CountUpCard";

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value) || 0);
}

function SectionTitle({ index, title, subtitle }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
          <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-red-500 text-sm">
            {index}
          </span>
          {title}
        </h2>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function SystemOverview({ systemOverview }) {
  const overviewCards = useMemo(
    () => [
      {
        title: "Tổng người dùng",
        value: systemOverview?.totalUsers || 0,
        bg: "from-blue-500 to-blue-700",
      },
      {
        title: "Tổng đơn hàng",
        value: systemOverview?.totalOrders || 0,
        bg: "from-emerald-500 to-emerald-700",
      },
      {
        title: "Tổng doanh thu",
        value: formatCurrency(systemOverview?.totalRevenue || 0),
        bg: "from-amber-500 to-amber-700",
      },
      {
        title: "Số phòng gym",
        value: systemOverview?.totalRooms || 0,
        bg: "from-violet-500 to-violet-700",
      },
      {
        title: "Hội viên hoạt động",
        value: systemOverview?.activeMembers || 0,
        bg: "from-rose-500 to-rose-700",
      },
    ],
    [systemOverview]
  );

  return (
    <section className="mb-10">
      <SectionTitle index="1" title="Tổng Quan Hệ Thống" subtitle="Chỉ số chính của website" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {overviewCards.map((card) => (
          <CountUpCard
            key={card.title}
            title={card.title}
            value={card.value}
            bg={card.bg}
          />
        ))}
      </div>
    </section>
  );
}
