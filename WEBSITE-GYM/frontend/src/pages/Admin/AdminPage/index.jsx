import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import statisticsAPI from "../../../API/statistics";
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

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];

export default function AdminPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    systemOverview: null,
    revenueByDay: [],
    revenueByMonth: [],
    revenueByPaymentMethod: [],
    serviceRevenue: null,
    topSpenders: [],
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
    topWishlistProducts: [],
  });

  // Check user
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Fetch all statistics
  useEffect(() => {
    const fetchAllData = async () => {
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
          serviceRev,
          spenders,
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
          wishlist,
        ] = await Promise.all([
          statisticsAPI.getSystemOverview(),
          statisticsAPI.getRevenueByDay(30),
          statisticsAPI.getRevenueByMonth(12),
          statisticsAPI.getRevenueByPaymentMethod(),
          statisticsAPI.getServiceRevenue(),
          statisticsAPI.getTopSpenders(5),
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
          statisticsAPI.getTopWishlistProducts(10),
        ]);

        setData({
          systemOverview: extractData(overview, null),
          revenueByDay: extractData(revDay, []),
          revenueByMonth: extractData(revMonth, []),
          revenueByPaymentMethod: extractData(revPayment, []),
          serviceRevenue: extractData(serviceRev, null),
          topSpenders: extractData(spenders, []),
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
          topWishlistProducts: extractData(wishlist, []),
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAllData();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-red-500">DASHBOARD</span>
            <span className="text-gray-300 ml-2">ADMIN</span>
          </h1>
          <p className="text-gray-400">Tổng hợp dữ liệu kinh doanh</p>
        </div>

        {/* 1. TỔNG QUAN HỆ THỐNG */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            <span className="text-red-500">1.</span> Tổng Quan Hệ Thống
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard
              title="Tổng Người Dùng"
              value={data.systemOverview?.totalUsers || 0}
              icon="👥"
              color="bg-blue-600"
            />
            <StatCard
              title="Tổng Đơn Hàng"
              value={data.systemOverview?.totalOrders || 0}
              icon="📦"
              color="bg-green-600"
            />
            <StatCard
              title="Tổng Doanh Thu"
              value={formatCurrency(data.systemOverview?.totalRevenue || 0)}
              icon="💰"
              color="bg-yellow-600"
              isLarge
            />
            <StatCard
              title="Số Phòng Gym"
              value={data.systemOverview?.totalRooms || 0}
              icon="🏋️"
              color="bg-purple-600"
            />
            <StatCard
              title="Hội Viên Hoạt Động"
              value={data.systemOverview?.activeMembers || 0}
              icon="✅"
              color="bg-pink-600"
            />
          </div>
        </section>

        {/* 2. THỐNG KÊ DOANH THU */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            <span className="text-red-500">2.</span> Thống Kê Doanh Thu
          </h2>

          {/* Doanh thu theo ngày */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Doanh thu theo ngày (30 ngày)
            </h3>
            {data.revenueByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#333",
                      border: "1px solid #555",
                      color: "#fff",
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF6B6B"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">Không có dữ liệu</p>
            )}
          </div>

          {/* Doanh thu theo tháng */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Doanh thu theo tháng (12 tháng)
            </h3>
            {data.revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="month_label" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#333",
                      border: "1px solid #555",
                      color: "#fff",
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#4ECDC4" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">Không có dữ liệu</p>
            )}
          </div>

          {/* Doanh thu theo phương thức */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Doanh thu theo phương thức thanh toán
              </h3>
              {data.revenueByPaymentMethod.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.revenueByPaymentMethod}
                      dataKey="revenue"
                      nameKey="payment_method"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.revenueByPaymentMethod.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400">Không có dữ liệu</p>
              )}
            </div>

            {/* Doanh thu dịch vụ */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Doanh Thu Dịch Vụ Đã Đăng Ký
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-400 mb-2">Tổng doanh thu</p>
                  <p className="text-3xl font-bold text-green-400">
                    {formatCurrency(data.serviceRevenue?.totalRevenue || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 mb-2">Số giao dịch</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {data.serviceRevenue?.transactionCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top spenders */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Top 5 Người Dùng Thanh Toán Nhiều Nhất
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-3">STT</th>
                    <th className="text-left p-3">Người Dùng</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-right p-3">Tổng Tiêu Tiền</th>
                    <th className="text-right p-3">Số Đơn</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(data.topSpenders) ? data.topSpenders : []).map((user, idx) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3">{user.username}</td>
                      <td className="p-3 text-gray-400">{user.email}</td>
                      <td className="p-3 text-right font-semibold">
                        {formatCurrency(user.total_spent)}
                      </td>
                      <td className="p-3 text-right">{user.order_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. QUẢN LÝ ĐƠN HÀNG */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            <span className="text-red-500">3.</span> Quản Lý Đơn Hàng
          </h2>

          {/* Đơn hàng theo trạng thái */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Số Lượng Đơn Hàng Theo Trạng Thái
            </h3>
            {data.ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.ordersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="status" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#333",
                      border: "1px solid #555",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#45B7D1" />
                  <Bar dataKey="total_amount" fill="#FFA07A" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">Không có dữ liệu</p>
            )}
          </div>

          {/* Danh sách đơn hàng gần nhất */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Danh Sách Đơn Hàng Gần Nhất
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-white text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Người Dùng</th>
                    <th className="text-left p-3">Trạng Thái</th>
                    <th className="text-left p-3">Phương Thức</th>
                    <th className="text-right p-3">Giá Trị</th>
                    <th className="text-left p-3">Ngày Tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="p-3 font-semibold">#{order.id}</td>
                      <td className="p-3">{order.username}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold
                          ${order.status === 'delivered' ? 'bg-green-600' : 
                            order.status === 'pending' ? 'bg-yellow-600' :
                            order.status === 'cancelled' ? 'bg-red-600' : 'bg-blue-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3">{order.payment_method}</td>
                      <td className="p-3 text-right font-semibold">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="p-3 text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. NGƯỜI DÙNG */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            <span className="text-red-500">4.</span> Người Dùng
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users by role */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Người Dùng Theo Role
              </h3>
              {data.usersByRole.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.usersByRole}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400">Không có dữ liệu</p>
              )}
            </div>

            {/* User registration by month */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Đăng Ký Người Dùng Theo Tháng
              </h3>
              {data.userRegistration.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.userRegistration}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                    <XAxis dataKey="month_label" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#333",
                        border: "1px solid #555",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#98D8C8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400">Không có dữ liệu</p>
              )}
            </div>
          </div>
        </section>

        {/* 5. HỘI VIÊN */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            <span className="text-red-500">5.</span> Hội Viên (Gym Services)
          </h2>

          {/* Membership status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Trạng Thái Hội Viên
              </h3>
              {data.membershipStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.membershipStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.membershipStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400">Không có dữ liệu</p>
              )}
            </div>

            {/* Members by package */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Hội Viên Theo Gói Dịch Vụ
              </h3>
              <div className="space-y-3">
                {data.membersByPackage.map((pkg) => (
                  <div key={pkg.id} className="bg-gray-700 p-4 rounded">
                    <h4 className="font-semibold text-white mb-2">{pkg.package_name}</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">Tổng cộng</p>
                        <p className="text-lg font-bold text-white">{pkg.total_members}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Đang hoạt động</p>
                        <p className="text-lg font-bold text-green-400">{pkg.active_members}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Hết hạn</p>
                        <p className="text-lg font-bold text-red-400">{pkg.expired_members}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Most frequent members */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Top 5 Hội Viên Chuyên Đi
            </h3>
            <div className="space-y-3">
              {data.mostFrequentMembers.map((member, idx) => (
                <div key={member.id} className="bg-gray-700 p-4 rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">{idx + 1}. {member.username}</p>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-400">{member.checkin_count}</p>
                    <p className="text-gray-400 text-sm">lần check-in</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. PHÒNG TẬP */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            <span className="text-red-500">6.</span> Phòng Tập
          </h2>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Số Lượt Check-In Theo Phòng
            </h3>
            {data.checkinsByRoom.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.checkinsByRoom}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="room_name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#333",
                      border: "1px solid #555",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="checkin_count" fill="#FF6B6B" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">Không có dữ liệu</p>
            )}
          </div>
        </section>

        {/* 7. SẢN PHẨM */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            <span className="text-red-500">7.</span> Sản Phẩm
          </h2>

          {/* Top selling products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Top 10 Sản Phẩm Bán Chạy
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-white text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left p-2">Sản Phẩm</th>
                      <th className="text-right p-2">Số Lượng</th>
                      <th className="text-right p-2">Đơn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topSellingProducts.map((product) => (
                      <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="p-2">{product.product_name}</td>
                        <td className="p-2 text-right font-semibold">{product.total_quantity}</td>
                        <td className="p-2 text-right">{product.order_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue by product */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Doanh Thu Theo Sản Phẩm
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-white text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left p-2">Sản Phẩm</th>
                      <th className="text-right p-2">Doanh Thu</th>
                      <th className="text-right p-2">Số Lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.revenueByProduct.map((product) => (
                      <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="p-2">{product.product_name}</td>
                        <td className="p-2 text-right font-semibold">
                          {formatCurrency(product.total_revenue)}
                        </td>
                        <td className="p-2 text-right">{product.total_quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 8. KHO */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            <span className="text-red-500">8.</span> Kho
          </h2>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Thiết Bị Theo Trạng Thái
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {data.warehouseStatus.map((item) => (
                <div key={item.status} className="bg-gray-700 p-6 rounded-lg text-center">
                  <p className="text-gray-400 mb-2 capitalize">{item.status}</p>
                  <p className="text-3xl font-bold text-yellow-400 mb-1">{item.count}</p>
                  <p className="text-gray-400 text-sm">
                    ({item.total_quantity} cái)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. WISHLIST */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            <span className="text-red-500">9.</span> Wishlist
          </h2>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Top 10 Sản Phẩm Được Thêm Vào Wishlist
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-white text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-3">Sản Phẩm</th>
                    <th className="text-right p-3">Giá</th>
                    <th className="text-right p-3">Wishlist</th>
                    <th className="text-right p-3">Người Dùng</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topWishlistProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="p-3">{product.product_name}</td>
                      <td className="p-3 text-right">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {product.wishlist_count}
                      </td>
                      <td className="p-3 text-right">{product.user_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// StatCard Component
function StatCard({ title, value, icon, color, isLarge }) {
  return (
    <div className={`${color} rounded-lg p-6 text-white`}>
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-gray-200 text-sm mb-2">{title}</p>
      <p className={`font-bold ${isLarge ? "text-lg" : "text-2xl"}`}>{value}</p>
    </div>
  );
}