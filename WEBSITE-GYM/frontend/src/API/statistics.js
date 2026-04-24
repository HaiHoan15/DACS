import api from './api';

const STATS_BASE_URL = 'http://localhost/backend/controllers/StatisticsController.php';

export const statisticsAPI = {
  // TỔNG QUAN HỆ THỐNG
  getSystemOverview: async () => {
    return api.get(`${STATS_BASE_URL}?action=system-overview`);
  },

  // THỐNG KÊ DOANH THU
  getRevenueByDay: async (days = 30) => {
    return api.get(`${STATS_BASE_URL}?action=revenue-by-day&days=${days}`);
  },

  getRevenueByMonth: async (months = 12) => {
    return api.get(`${STATS_BASE_URL}?action=revenue-by-month&months=${months}`);
  },

  getRevenueByPaymentMethod: async () => {
    return api.get(`${STATS_BASE_URL}?action=revenue-by-payment-method`);
  },

  getServiceRevenue: async () => {
    return api.get(`${STATS_BASE_URL}?action=service-revenue`);
  },

  getTopSpenders: async (limit = 5) => {
    return api.get(`${STATS_BASE_URL}?action=top-spenders&limit=${limit}`);
  },

  // QUẢN LÝ ĐƠN HÀNG
  getOrdersByStatus: async () => {
    return api.get(`${STATS_BASE_URL}?action=orders-by-status`);
  },

  getRecentOrders: async (limit = 20) => {
    return api.get(`${STATS_BASE_URL}?action=recent-orders&limit=${limit}`);
  },

  // NGƯỜI DÙNG
  getUsersByRole: async () => {
    return api.get(`${STATS_BASE_URL}?action=users-by-role`);
  },

  getUserRegistrationByMonth: async (months = 12) => {
    return api.get(`${STATS_BASE_URL}?action=user-registration-by-month&months=${months}`);
  },

  // HỘI VIÊN (MEMBERSHIP)
  getMembershipStatus: async () => {
    return api.get(`${STATS_BASE_URL}?action=membership-status`);
  },

  getMembersByPackage: async () => {
    return api.get(`${STATS_BASE_URL}?action=members-by-package`);
  },

  getMostFrequentMembers: async (limit = 5) => {
    return api.get(`${STATS_BASE_URL}?action=most-frequent-members&limit=${limit}`);
  },

  // PHÒNG TẬP
  getCheckinsByRoom: async () => {
    return api.get(`${STATS_BASE_URL}?action=checkins-by-room`);
  },

  getTopRooms: async (limit = 5) => {
    return api.get(`${STATS_BASE_URL}?action=top-rooms&limit=${limit}`);
  },

  // SẢN PHẨM
  getTopSellingProducts: async (limit = 10) => {
    return api.get(`${STATS_BASE_URL}?action=top-selling-products&limit=${limit}`);
  },

  getRevenueByProduct: async (limit = 10) => {
    return api.get(`${STATS_BASE_URL}?action=revenue-by-product&limit=${limit}`);
  },

  // KHO
  getWarehouseStatus: async () => {
    return api.get(`${STATS_BASE_URL}?action=warehouse-status`);
  },

  // WISHLIST
  getTopWishlistProducts: async (limit = 10) => {
    return api.get(`${STATS_BASE_URL}?action=top-wishlist-products&limit=${limit}`);
  }
};

export default statisticsAPI;
