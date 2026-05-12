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

        // Keep DB backward-compatible for existing environments.
        $this->ensurePaymentHistoryTable();
    }

    private function ensurePaymentHistoryTable() {
        $sql = "CREATE TABLE IF NOT EXISTS service_payment_history (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            user_service_id INT DEFAULT NULL,
            package_id INT DEFAULT NULL,
            package_name VARCHAR(100) DEFAULT NULL,
            event_type ENUM('user_purchase','admin_grant','admin_remove','admin_update') NOT NULL,
            payment_method VARCHAR(50) DEFAULT NULL,
            amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            is_revenue TINYINT(1) NOT NULL DEFAULT 0,
            performed_by_admin_id INT DEFAULT NULL,
            note VARCHAR(255) DEFAULT NULL,
            start_date DATE DEFAULT NULL,
            end_date DATE DEFAULT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_sph_user_id (user_id),
            KEY idx_sph_package_id (package_id),
            KEY idx_sph_event_type (event_type),
            KEY idx_sph_is_revenue (is_revenue),
            KEY idx_sph_created_at (created_at),
            CONSTRAINT fk_sph_user FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE,
            CONSTRAINT fk_sph_user_service FOREIGN KEY (user_service_id) REFERENCES user_services(id) ON DELETE SET NULL,
            CONSTRAINT fk_sph_package FOREIGN KEY (package_id) REFERENCES service_packages(id) ON DELETE SET NULL,
            CONSTRAINT fk_sph_admin FOREIGN KEY (performed_by_admin_id) REFERENCES accounts(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        $this->conn->exec($sql);

        $this->ensurePaymentHistoryDateColumns();
    }

    private function ensurePaymentHistoryDateColumns() {
        $columns = [
            'start_date' => 'ALTER TABLE service_payment_history ADD COLUMN start_date DATE DEFAULT NULL',
            'end_date' => 'ALTER TABLE service_payment_history ADD COLUMN end_date DATE DEFAULT NULL',
        ];

        foreach ($columns as $columnName => $alterSql) {
            $stmt = $this->conn->prepare(
                "SELECT COUNT(*)
                 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'service_payment_history'
                   AND COLUMN_NAME = :column_name"
            );
            $stmt->execute([':column_name' => $columnName]);
            $exists = (int)$stmt->fetchColumn() > 0;

            if (!$exists) {
                $this->conn->exec($alterSql);
            }
        }
    }

    private function getPackageInfo($packageId) {
        $stmt = $this->conn->prepare(
            "SELECT id, name, price, duration_days
             FROM service_packages
             WHERE id = :id
             LIMIT 1"
        );
        $stmt->execute([':id' => (int)$packageId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
    }

    private function recordPaymentHistory(
        $userId,
        $userServiceId,
        $packageId,
        $packageName,
        $eventType,
        $paymentMethod,
        $amount,
        $isRevenue,
        $performedByAdminId,
        $note,
        $startDate = null,
        $endDate = null
    ) {
        $stmt = $this->conn->prepare(
            "INSERT INTO service_payment_history
                (user_id, user_service_id, package_id, package_name, event_type, payment_method, amount, is_revenue, performed_by_admin_id, note, start_date, end_date)
             VALUES
                (:user_id, :user_service_id, :package_id, :package_name, :event_type, :payment_method, :amount, :is_revenue, :performed_by_admin_id, :note, :start_date, :end_date)"
        );

        $stmt->execute([
            ':user_id' => (int)$userId,
            ':user_service_id' => $userServiceId ? (int)$userServiceId : null,
            ':package_id' => $packageId ? (int)$packageId : null,
            ':package_name' => $packageName ?: null,
            ':event_type' => $eventType,
            ':payment_method' => $paymentMethod ?: null,
            ':amount' => (float)$amount,
            ':is_revenue' => $isRevenue ? 1 : 0,
            ':performed_by_admin_id' => $performedByAdminId ? (int)$performedByAdminId : null,
            ':note' => $note ?: null,
            ':start_date' => $startDate ?: null,
            ':end_date' => $endDate ?: null,
        ]);
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
    public function createActive(
        $userId,
        $packageId,
        $durationDays,
        $source = 'user_purchase',
        $adminId = null,
        $paidAmount = null,
        $paymentMethod = 'momo',
        $note = null
    ) {
        $packageInfo = $this->getPackageInfo($packageId);
        if (!$packageInfo) {
            return false;
        }

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

        $newUserServiceId = (int)$this->conn->lastInsertId();
        $eventType = in_array($source, ['user_purchase', 'admin_grant'], true) ? $source : 'user_purchase';
        $isRevenue = $eventType === 'user_purchase';
        $amount = $isRevenue
            ? (is_numeric($paidAmount) ? (float)$paidAmount : (float)$packageInfo['price'])
            : 0;

        $resolvedPaymentMethod = $isRevenue
            ? ($paymentMethod ?: 'momo')
            : 'admin_action';

        $resolvedNote = $note;
        if (!$resolvedNote) {
            $resolvedNote = $eventType === 'admin_grant'
                ? 'Admin tặng gói dịch vụ'
                : 'Người dùng tự thanh toán gói dịch vụ';
        }

        $this->recordPaymentHistory(
            $userId,
            $newUserServiceId,
            $packageInfo['id'],
            $packageInfo['name'],
            $eventType,
            $resolvedPaymentMethod,
            $amount,
            $isRevenue,
            $adminId,
            $resolvedNote,
            $startDate,
            $endDate
        );

        return $newUserServiceId;
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
    public function deleteUserService($userId, $adminId = null, $note = null) {
        $latestStmt = $this->conn->prepare(
            "SELECT us.id AS user_service_id, us.package_id, sp.name AS package_name
             FROM user_services us
             LEFT JOIN service_packages sp ON sp.id = us.package_id
             WHERE us.user_id = :user_id
             ORDER BY us.id DESC
             LIMIT 1"
        );
        $latestStmt->execute([':user_id' => (int)$userId]);
        $latestService = $latestStmt->fetch(\PDO::FETCH_ASSOC) ?: null;

        $stmt = $this->conn->prepare(
            "DELETE FROM user_services WHERE user_id = :user_id"
        );
        $stmt->execute([':user_id' => (int)$userId]);

        $deletedRows = $stmt->rowCount();
        if ($deletedRows > 0 && $latestService) {
            $this->recordPaymentHistory(
                $userId,
                null,
                $latestService['package_id'] ?? null,
                $latestService['package_name'] ?? null,
                'admin_remove',
                'admin_action',
                0,
                false,
                $adminId,
                $note ?: 'Admin xóa gói dịch vụ của người dùng',
                null,
                null
            );
        }

        return $deletedRows;
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
    public function updateService($userServiceId, $packageId = null, $status = null, $adminId = null) {
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

        if ($uStmt->rowCount() > 0) {
            $pkg = $this->getPackageInfo($nextPackageId);
            $this->recordPaymentHistory(
                $service['user_id'],
                (int)$userServiceId,
                $nextPackageId,
                $pkg['name'] ?? null,
                'admin_update',
                'admin_action',
                0,
                false,
                $adminId,
                'Admin cập nhật dịch vụ (gói/trạng thái)',
                $startDate,
                $endDate
            );
        }

        return [true, 'Cập nhật dịch vụ thành công'];
    }

    public function getServicePaymentHistory($onlyRevenue = false, $limit = 200) {
        $sql = "SELECT
                    sph.id,
                    sph.user_id,
                    u.username,
                    u.email,
                    sph.user_service_id,
                    sph.package_id,
                    sph.package_name,
                    sph.event_type,
                    sph.payment_method,
                    sph.amount,
                    sph.is_revenue,
                    sph.performed_by_admin_id,
                    admin.username AS admin_username,
                    sph.note,
                    sph.created_at
                FROM service_payment_history sph
                LEFT JOIN accounts u ON u.id = sph.user_id
                LEFT JOIN accounts admin ON admin.id = sph.performed_by_admin_id";

        if ($onlyRevenue) {
            $sql .= " WHERE sph.is_revenue = 1";
        }

        $sql .= " ORDER BY sph.created_at DESC, sph.id DESC LIMIT :limit";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':limit', max(1, (int)$limit), \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getUsageStats() {
        $usersStmt = $this->conn->prepare(
            "SELECT
                a.id AS user_id,
                a.username,
                a.email,
                us.id AS user_service_id,
                us.start_date,
                us.end_date,
                sp.name AS current_package_name
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
             ORDER BY a.id ASC"
        );
        $usersStmt->execute();
        $users = $usersStmt->fetchAll(\PDO::FETCH_ASSOC);

        $historyStmt = $this->conn->prepare(
            "SELECT
                sph.id,
                sph.user_id,
                COALESCE(sph.package_name, sp.name, 'Không rõ') AS package_name,
                sph.event_type,
                COALESCE(sph.start_date, us.start_date) AS start_date,
                COALESCE(sph.end_date, us.end_date) AS end_date,
                sph.created_at
             FROM service_payment_history sph
             LEFT JOIN user_services us ON us.id = sph.user_service_id
             LEFT JOIN service_packages sp ON sp.id = sph.package_id
             WHERE sph.event_type IN ('user_purchase', 'admin_grant', 'admin_update')
             ORDER BY sph.user_id ASC, sph.created_at DESC, sph.id DESC"
        );
        $historyStmt->execute();
        $historyRows = $historyStmt->fetchAll(\PDO::FETCH_ASSOC);

        $historyByUser = [];
        foreach ($historyRows as $row) {
            $uid = (int)$row['user_id'];
            if (!isset($historyByUser[$uid])) {
                $historyByUser[$uid] = [];
            }

            $activation = $row['event_type'] === 'user_purchase' ? 'UserPay' : 'AdminGive';
            $historyByUser[$uid][] = [
                'service' => $row['package_name'] ?: 'Không rõ',
                'activation' => $activation,
                'start_date' => $row['start_date'] ?: null,
                'end_date' => $row['end_date'] ?: null,
                'created_at' => $row['created_at'],
            ];
        }

        $result = [];
        foreach ($users as $u) {
            $uid = (int)$u['user_id'];
            $history = $historyByUser[$uid] ?? [];
            $latestActivation = count($history) > 0 ? $history[0]['activation'] : '-';

            $result[] = [
                'id' => $uid,
                'username' => $u['username'],
                'email' => $u['email'],
                'service' => $u['current_package_name'] ?: 'Chưa có',
                'activation' => $latestActivation,
                'history' => $history,
            ];
        }

        return $result;
    }
}
