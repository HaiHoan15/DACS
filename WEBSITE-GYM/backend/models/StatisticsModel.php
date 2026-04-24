<?php

class StatisticsModel {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    private function toPositiveInt($value, $default) {
        $num = (int)$value;
        return $num > 0 ? $num : $default;
    }

    private function fetchAll(string $sql): array {
        $stmt = $this->conn->query($sql);
        if (!$stmt) {
            $error = $this->conn->errorInfo();
            throw new Exception('SQL Error: ' . ($error[2] ?? 'Unknown database error'));
        }
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function fetchOne(string $sql): array {
        $stmt = $this->conn->query($sql);
        if (!$stmt) {
            $error = $this->conn->errorInfo();
            throw new Exception('SQL Error: ' . ($error[2] ?? 'Unknown database error'));
        }
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: [];
    }

    public function getSystemOverview() {
        $totalUsers = $this->fetchOne("SELECT COUNT(*) AS count FROM accounts WHERE role = 'user'")['count'] ?? 0;
        $totalOrders = $this->fetchOne("SELECT COUNT(*) AS count FROM orders")['count'] ?? 0;
        $totalRevenue = $this->fetchOne("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status = 'delivered'")['total'] ?? 0;
        $totalRooms = $this->fetchOne("SELECT COUNT(*) AS count FROM rooms")['count'] ?? 0;
        $activeMembers = $this->fetchOne("SELECT COUNT(*) AS count FROM user_services WHERE status = 'active'")['count'] ?? 0;

        return [
            'totalUsers' => (int)$totalUsers,
            'totalOrders' => (int)$totalOrders,
            'totalRevenue' => (float)$totalRevenue,
            'totalRooms' => (int)$totalRooms,
            'activeMembers' => (int)$activeMembers,
        ];
    }

    public function getRevenueByDay($days = 30) {
        $days = $this->toPositiveInt($days, 30);
        $sql = "SELECT DATE(created_at) AS date,
                       COALESCE(SUM(total_amount), 0) AS revenue,
                       COUNT(*) AS order_count
                FROM orders
                WHERE status = 'delivered'
                  AND created_at >= DATE_SUB(NOW(), INTERVAL {$days} DAY)
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) ASC";

        return $this->fetchAll($sql);
    }

    public function getRevenueByMonth($months = 12) {
        $months = $this->toPositiveInt($months, 12);
        $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month_label,
                       COALESCE(SUM(total_amount), 0) AS revenue,
                       COUNT(*) AS order_count
                FROM orders
                WHERE status = 'delivered'
                  AND created_at >= DATE_SUB(NOW(), INTERVAL {$months} MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month_label ASC";

        return $this->fetchAll($sql);
    }

    public function getRevenueByPaymentMethod() {
        $sql = "SELECT COALESCE(payment_method, 'unknown') AS payment_method,
                       COALESCE(SUM(total_amount), 0) AS revenue,
                       COUNT(*) AS order_count
                FROM orders
                WHERE status = 'delivered'
                GROUP BY COALESCE(payment_method, 'unknown')
                ORDER BY revenue DESC";

        return $this->fetchAll($sql);
    }

    public function getServiceRevenue() {
        $sql = "SELECT COALESCE(SUM(amount), 0) AS total_revenue,
                       COUNT(*) AS transaction_count
                FROM service_payment_history
                WHERE is_revenue = 1";

        $result = $this->fetchOne($sql);
        return [
            'totalRevenue' => (float)($result['total_revenue'] ?? 0),
            'transactionCount' => (int)($result['transaction_count'] ?? 0),
        ];
    }

    public function getTopSpenders($limit = 5) {
        $limit = $this->toPositiveInt($limit, 5);
        $sql = "SELECT a.id,
                       a.username,
                       a.email,
                       a.avatar,
                       COALESCE(SUM(o.total_amount), 0) AS total_spent,
                       COUNT(o.id) AS order_count
                FROM accounts a
                LEFT JOIN orders o ON a.id = o.account_id AND o.status = 'delivered'
                WHERE a.role = 'user'
                GROUP BY a.id, a.username, a.email, a.avatar
                ORDER BY total_spent DESC
                LIMIT {$limit}";

        return $this->fetchAll($sql);
    }

    public function getOrdersByStatus() {
        $sql = "SELECT status,
                       COUNT(*) AS count,
                       COALESCE(SUM(total_amount), 0) AS total_amount
                FROM orders
                GROUP BY status
                ORDER BY count DESC";

        return $this->fetchAll($sql);
    }

    public function getRecentOrders($limit = 20) {
        $limit = $this->toPositiveInt($limit, 20);
        $sql = "SELECT o.id,
                       o.account_id,
                       a.username,
                       a.email,
                       o.total_amount,
                       o.status,
                       o.payment_method,
                       o.recipient_name,
                       o.created_at,
                       COUNT(oi.id) AS item_count
                FROM orders o
                JOIN accounts a ON o.account_id = a.id
                LEFT JOIN order_items oi ON o.id = oi.order_id
                GROUP BY o.id, o.account_id, a.username, a.email, o.total_amount,
                         o.status, o.payment_method, o.recipient_name, o.created_at
                ORDER BY o.created_at DESC
                LIMIT {$limit}";

        return $this->fetchAll($sql);
    }

    public function getUsersByRole() {
        $sql = "SELECT role,
                       COUNT(*) AS count
                FROM accounts
                GROUP BY role
                ORDER BY count DESC";

        return $this->fetchAll($sql);
    }

    public function getUserRegistrationByMonth($months = 12) {
        $months = $this->toPositiveInt($months, 12);
        $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month_label,
                       COUNT(*) AS count
                FROM accounts
                WHERE role = 'user'
                  AND created_at >= DATE_SUB(NOW(), INTERVAL {$months} MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month_label ASC";

        return $this->fetchAll($sql);
    }

    public function getMembershipStatus() {
        $sql = "SELECT status,
                       COUNT(*) AS count
                FROM user_services
                GROUP BY status";

        return $this->fetchAll($sql);
    }

    public function getMembersByPackage() {
        $sql = "SELECT sp.id,
                       sp.name AS package_name,
                       sp.price,
                       COUNT(DISTINCT us.id) AS total_members,
                       SUM(CASE WHEN us.status = 'active' THEN 1 ELSE 0 END) AS active_members,
                       SUM(CASE WHEN us.status = 'expired' THEN 1 ELSE 0 END) AS expired_members
                FROM service_packages sp
                LEFT JOIN user_services us ON sp.id = us.package_id
                GROUP BY sp.id, sp.name, sp.price
                ORDER BY total_members DESC";

        return $this->fetchAll($sql);
    }

    public function getMostFrequentMembers($limit = 5) {
        $limit = $this->toPositiveInt($limit, 5);
        $sql = "SELECT a.id,
                       a.username,
                       a.email,
                       a.avatar,
                       COUNT(mc.id) AS checkin_count
                FROM accounts a
                JOIN member_confirmations mc ON a.id = mc.user_id
                WHERE a.role = 'user'
                GROUP BY a.id, a.username, a.email, a.avatar
                ORDER BY checkin_count DESC
                LIMIT {$limit}";

        return $this->fetchAll($sql);
    }

    public function getCheckinsByRoom() {
        $sql = "SELECT r.id,
                       r.name AS room_name,
                       COUNT(mc.id) AS checkin_count
                FROM rooms r
                LEFT JOIN member_confirmations mc ON r.id = mc.room_id
                GROUP BY r.id, r.name
                ORDER BY checkin_count DESC";

        return $this->fetchAll($sql);
    }

    public function getTopRooms($limit = 5) {
        $limit = $this->toPositiveInt($limit, 5);
        $sql = "SELECT r.id,
                       r.name AS room_name,
                       COUNT(mc.id) AS checkin_count
                FROM rooms r
                LEFT JOIN member_confirmations mc ON r.id = mc.room_id
                GROUP BY r.id, r.name
                ORDER BY checkin_count DESC
                LIMIT {$limit}";

        return $this->fetchAll($sql);
    }

    public function getTopSellingProducts($limit = 10) {
        $limit = $this->toPositiveInt($limit, 10);
        $sql = "SELECT p.id,
                       p.name AS product_name,
                       p.price,
                       SUM(oi.quantity) AS total_quantity,
                       COUNT(DISTINCT o.id) AS order_count,
                       COALESCE(SUM(oi.subtotal), 0) AS total_revenue
                FROM products p
                JOIN order_items oi ON p.id = oi.product_id
                JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered'
                GROUP BY p.id, p.name, p.price
                ORDER BY total_quantity DESC
                LIMIT {$limit}";

        return $this->fetchAll($sql);
    }

    public function getRevenueByProduct($limit = 10) {
        $limit = $this->toPositiveInt($limit, 10);
        $sql = "SELECT p.id,
                       p.name AS product_name,
                       p.price,
                       COALESCE(SUM(oi.quantity), 0) AS total_quantity,
                       COALESCE(SUM(oi.subtotal), 0) AS total_revenue,
                       COUNT(DISTINCT o.id) AS order_count
                FROM products p
                LEFT JOIN order_items oi ON p.id = oi.product_id
                LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered'
                GROUP BY p.id, p.name, p.price
                ORDER BY total_revenue DESC
                LIMIT {$limit}";

        return $this->fetchAll($sql);
    }

    public function getWarehouseStatus() {
        $sql = "SELECT status,
                       COUNT(*) AS count,
                       SUM(quantity) AS total_quantity
                FROM warehouse_items
                GROUP BY status";

        return $this->fetchAll($sql);
    }

    public function getTopWishlistProducts($limit = 10) {
        $limit = $this->toPositiveInt($limit, 10);
        $sql = "SELECT p.id,
                       p.name AS product_name,
                       p.price,
                       COUNT(w.id) AS wishlist_count,
                       COUNT(DISTINCT w.account_id) AS user_count
                FROM products p
                LEFT JOIN wishlists w ON p.id = w.product_id
                GROUP BY p.id, p.name, p.price
                ORDER BY wishlist_count DESC
                LIMIT {$limit}";

        return $this->fetchAll($sql);
    }
}
