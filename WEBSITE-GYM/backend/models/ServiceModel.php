<?php
namespace Models;

class ServiceModel {
    private $conn;

    public function __construct($conn = null) {
        if ($conn) {
            $this->conn = $conn;
        } else {
            require_once __DIR__ . '/../config/database.php';
            $database = new \Database();
            $this->conn = $database->connect();
        }
    }

    /** Lấy tất cả gói dịch vụ */
    public function getPackages() {
        $stmt = $this->conn->prepare("SELECT * FROM service_packages ORDER BY price ASC");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /** Lấy gói đang active của user (null nếu chưa có) */
    public function getUserService($userId) {
        $stmt = $this->conn->prepare(
            "SELECT us.*, sp.name AS package_name, sp.price, sp.duration_days
             FROM user_services us
             JOIN service_packages sp ON sp.id = us.package_id
             WHERE us.user_id = :user_id AND us.status = 'active'
             LIMIT 1"
        );
        $stmt->execute([':user_id' => (int)$userId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Tạo bản ghi active trực tiếp sau khi thanh toán thành công.
     * Xóa gói active cũ (không giữ lại) để tránh vi phạm UNIQUE KEY (user_id, status).
     */
    public function createActive($userId, $packageId, $durationDays) {
        $startDate = date('Y-m-d');
        $endDate   = date('Y-m-d', strtotime("+{$durationDays} days"));

        // Xóa TẤT CẢ gói cũ của user (active + expired) trước khi tạo mới
        $stmt = $this->conn->prepare(
            "DELETE FROM user_services WHERE user_id = :user_id"
        );
        $stmt->execute([':user_id' => (int)$userId]);

        // Chèn gói mới với status = 'active'
        $stmt2 = $this->conn->prepare(
            "INSERT INTO user_services (user_id, package_id, start_date, end_date, status)
             VALUES (:user_id, :package_id, :start_date, :end_date, 'active')"
        );
        $stmt2->execute([
            ':user_id'    => (int)$userId,
            ':package_id' => (int)$packageId,
            ':start_date' => $startDate,
            ':end_date'   => $endDate,
        ]);
        return $this->conn->lastInsertId();
    }
}
