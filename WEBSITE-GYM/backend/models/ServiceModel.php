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

    /**
     * Danh sách user chưa có gói active (dùng cho trang admin tặng gói).
     */
    public function getUsersWithoutService() {
        $stmt = $this->conn->prepare(
            "SELECT a.id, a.username, a.email
             FROM accounts a
             WHERE a.role = 'user'
               AND a.id NOT IN (
                   SELECT user_id FROM user_services WHERE status = 'active'
               )
             ORDER BY a.username ASC"
        );
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Xóa tất cả bản ghi user_services của một user (admin xóa gói).
     * Trả về số dòng bị xóa (0 = user không có gói nào).
     */
    public function deleteUserService($userId) {
        $stmt = $this->conn->prepare(
            "DELETE FROM user_services WHERE user_id = :user_id"
        );
        $stmt->execute([':user_id' => (int)$userId]);
        return $stmt->rowCount();
    }

    /**
     * Lấy dịch vụ gần nhất của mỗi user (nếu có).
     */
    public function getAllForAdmin() {
        $sql = "SELECT
                    a.id AS user_id,
                    a.username,
                    a.email,
                    us.id,
                    us.package_id,
                    sp.name AS package_name,
                    us.start_date,
                    us.end_date,
                    us.status,
                    us.created_at
                FROM accounts a
                LEFT JOIN (
                    SELECT t1.*
                    FROM user_services t1
                    INNER JOIN (
                        SELECT user_id, MAX(id) AS max_id
                        FROM user_services
                        GROUP BY user_id
                    ) t2 ON t1.user_id = t2.user_id AND t1.id = t2.max_id
                ) us ON us.user_id = a.id
                LEFT JOIN service_packages sp ON sp.id = us.package_id
                WHERE a.role = 'user'
                ORDER BY us.created_at DESC, a.id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /** Cập nhật gói dịch vụ và/hoặc trạng thái cho một bản ghi */
    public function updateService($userServiceId, $packageId = null, $status = null) {
        $stmt = $this->conn->prepare("SELECT * FROM user_services WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => (int)$userServiceId]);
        $service = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$service) {
            return [false, 'Không tìm thấy bản ghi dịch vụ'];
        }

        $nextPackageId = $packageId !== null ? (int)$packageId : (int)$service['package_id'];
        $nextStatus = $status !== null ? $status : $service['status'];

        if (!in_array($nextStatus, ['active', 'expired'], true)) {
            return [false, 'Trạng thái không hợp lệ'];
        }

        $startDate = $service['start_date'];
        $endDate = $service['end_date'];

        // Nếu đổi gói thì reset ngày bắt đầu từ hôm nay theo thời hạn gói mới
        if ($packageId !== null && (int)$packageId !== (int)$service['package_id']) {
            $pStmt = $this->conn->prepare("SELECT duration_days FROM service_packages WHERE id = :id LIMIT 1");
            $pStmt->execute([':id' => $nextPackageId]);
            $pkg = $pStmt->fetch(\PDO::FETCH_ASSOC);

            if (!$pkg) {
                return [false, 'Gói dịch vụ không tồn tại'];
            }

            $startDate = date('Y-m-d');
            $endDate = date('Y-m-d', strtotime("+" . (int)$pkg['duration_days'] . " days"));
        }

        $uStmt = $this->conn->prepare(
            "UPDATE user_services
             SET package_id = :package_id,
                 status = :status,
                 start_date = :start_date,
                 end_date = :end_date
             WHERE id = :id"
        );
        $uStmt->execute([
            ':package_id' => $nextPackageId,
            ':status' => $nextStatus,
            ':start_date' => $startDate,
            ':end_date' => $endDate,
            ':id' => (int)$userServiceId,
        ]);

        return [true, 'Cập nhật dịch vụ thành công'];
    }
}
