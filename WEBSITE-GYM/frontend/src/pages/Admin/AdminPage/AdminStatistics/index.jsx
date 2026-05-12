import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import statisticsAPI from "../../../../API/statistics";
import SystemOverview from "./SystemOverview";
import SystemMember from "./SystemMember";
import SystemOrder from "./SystemOrder";
import SystemProduct from "./SystemProduct";
import SystemRevenue from "./SystemRevenue";
import SystemRoom from "./SystemRoom";
import SystemUser from "./SystemUser";
import SystemWarehouse from "./SystemWarehouse";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#ef4444", "#06b6d4", "#3b82f6", "#f97316", "#22c55e", "#8b5cf6"];

// function formatCurrency(value) {
//   return new Intl.NumberFormat("vi-VN", {
//     style: "currency",
//     currency: "VND",
//   }).format(Number(value) || 0);
// }

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

function Panel({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function EmptyState() {
  return <p className="text-slate-400">Không có dữ liệu</p>;
}

export default function AdminStatistics() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({
    systemOverview: null,
    revenueByDay: [],
    revenueByMonth: [],
    revenueByPaymentMethod: [],
    revenueByService: [],
    serviceRevenue: null,
    topSpenders: [],
    topTotalSpenders: [],
    ordersByStatus: [],
    recentOrders: [],
    usersByRole: [],
    userRegistration: [],
    membershipStatus: [],
    membersByPackage: [],
    mostFrequentMembers: [],
    checkinsByRoom: [],
    topSellingProducts: [],
    revenueByProduct: [],
    warehouseStatus: [],
    warehouseItems: [],
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const fetchAllData = useCallback(async () => {
    const extractData = (response, fallback = []) => {
      const payload = response?.data;
      if (payload && typeof payload === "object" && "data" in payload) {
        return payload.data ?? fallback;
      }
      return payload ?? fallback;
    };

    try {
      setLoading(true);
      const [
        overview,
        revDay,
        revMonth,
        revPayment,
        revService,
        serviceRev,
        spenders,
        totalSpenders,
        orderStatus,
        recentOrd,
        userRole,
        userReg,
        membership,
        members,
        frequent,
        checkins,
        products,
        revenue,
        warehouse,
        warehouseItems,
      ] = await Promise.all([
        statisticsAPI.getSystemOverview(),
        statisticsAPI.getRevenueByDay(30),
        statisticsAPI.getRevenueByMonth(12),
        statisticsAPI.getRevenueByPaymentMethod(),
        statisticsAPI.getRevenueByService(10),
        statisticsAPI.getServiceRevenue(),
        statisticsAPI.getTopSpenders(5),
        statisticsAPI.getTopTotalSpenders(10),
        statisticsAPI.getOrdersByStatus(),
        statisticsAPI.getRecentOrders(10),
        statisticsAPI.getUsersByRole(),
        statisticsAPI.getUserRegistrationByMonth(12),
        statisticsAPI.getMembershipStatus(),
        statisticsAPI.getMembersByPackage(),
        statisticsAPI.getMostFrequentMembers(5),
        statisticsAPI.getCheckinsByRoom(),
        statisticsAPI.getTopSellingProducts(10),
        statisticsAPI.getRevenueByProduct(10),
        statisticsAPI.getWarehouseStatus(),
        statisticsAPI.getWarehouseItems(),
      ]);

      setData({
        systemOverview: extractData(overview, null),
        revenueByDay: extractData(revDay, []),
        revenueByMonth: extractData(revMonth, []),
        revenueByPaymentMethod: extractData(revPayment, []),
        revenueByService: extractData(revService, []),
        serviceRevenue: extractData(serviceRev, null),
        topSpenders: extractData(spenders, []),
        topTotalSpenders: extractData(totalSpenders, []),
        ordersByStatus: extractData(orderStatus, []),
        recentOrders: extractData(recentOrd, []),
        usersByRole: extractData(userRole, []),
        userRegistration: extractData(userReg, []),
        membershipStatus: extractData(membership, []),
        membersByPackage: extractData(members, []),
        mostFrequentMembers: extractData(frequent, []),
        checkinsByRoom: extractData(checkins, []),
        topSellingProducts: extractData(products, []),
        revenueByProduct: extractData(revenue, []),
        warehouseStatus: extractData(warehouse, []),
        warehouseItems: extractData(warehouseItems, []),
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const dashboardTabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "revenue", label: "Doanh thu" },
    { id: "orders", label: "Đơn hàng" },
    { id: "users", label: "Người dùng" },
    { id: "members", label: "Hội viên" },
    { id: "rooms", label: "Phòng tập" },
    { id: "products", label: "Sản phẩm" },
    { id: "warehouse", label: "Kho" },
  ];

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-100 text-2xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                <span className="text-red-500">THỐNG</span>
                <span className="text-yellow-500 ml-2">KÊ</span>
              </h1>
              <p className="text-slate-400">Tổng hợp dữ liệu kinh doanh và vận hành phòng gym</p>
            </div>
            <button
              type="button"
              onClick={fetchAllData}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              Làm mới dữ liệu
            </button>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
          <div className="flex flex-wrap gap-2">
            {dashboardTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-red-600 text-white"
                    : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && <SystemOverview systemOverview={data.systemOverview} />}

        {activeTab === "revenue" && (
          <SystemRevenue
            revenueByDay={data.revenueByDay}
            revenueByMonth={data.revenueByMonth}
            revenueByPaymentMethod={data.revenueByPaymentMethod}
            revenueByProduct={data.revenueByProduct}
            serviceRevenue={data.serviceRevenue}
            revenueByService={data.revenueByService}
            topTotalSpenders={data.topTotalSpenders}
          />
        )}

        {activeTab === "orders" && <SystemOrder ordersByStatus={data.ordersByStatus} recentOrders={data.recentOrders} />}

        {activeTab === "users" && <SystemUser usersByRole={data.usersByRole} userRegistration={data.userRegistration} />}

        {activeTab === "members" && (
          <SystemMember
            membershipStatus={data.membershipStatus}
            membersByPackage={data.membersByPackage}
            mostFrequentMembers={data.mostFrequentMembers}
          />
        )}

        {activeTab === "rooms" && <SystemRoom checkinsByRoom={data.checkinsByRoom} />}

        {activeTab === "products" && (
          <SystemProduct topSellingProducts={data.topSellingProducts} revenueByProduct={data.revenueByProduct} />
        )}

        {activeTab === "warehouse" && (
          <SystemWarehouse warehouseStatus={data.warehouseStatus} warehouseItems={data.warehouseItems} />
        )}

      </div>
    </div>
  );
}
