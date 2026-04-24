<?php

class MemberConfirmationModel {
    private $conn;
    private $table = 'member_confirmations';

    public function __construct($database) {
        $this->conn = $database->connect();
        $this->ensureTable();
    }

    private function ensureTable() {
        $query = "
            CREATE TABLE IF NOT EXISTS {$this->table} (
                id INT NOT NULL AUTO_INCREMENT,
                user_id INT DEFAULT NULL,
                username VARCHAR(100) DEFAULT NULL,
                email VARCHAR(150) DEFAULT NULL,
                room_id INT DEFAULT NULL,
                room_name VARCHAR(255) DEFAULT NULL,
                confirmation_code VARCHAR(150) NOT NULL,
                confirmed_by_admin_id INT DEFAULT NULL,
                confirmed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uq_confirmation_code (confirmation_code),
                KEY idx_user_id (user_id),
                KEY idx_room_id (room_id),
                KEY idx_confirmed_at (confirmed_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ";
        $this->conn->exec($query);
    }

    public function existsByCode($code) {
        $query = "SELECT id FROM {$this->table} WHERE confirmation_code = :code LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':code', $code);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }

    public function createConfirmation($payload) {
        $query = "
            INSERT INTO {$this->table}
                (user_id, username, email, room_id, room_name, confirmation_code, confirmed_by_admin_id, confirmed_at)
            VALUES
                (:user_id, :username, :email, :room_id, :room_name, :confirmation_code, :confirmed_by_admin_id, NOW())
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':user_id', $payload['user_id'] ?: null, PDO::PARAM_INT);
        $stmt->bindValue(':username', $payload['username']);
        $stmt->bindValue(':email', $payload['email']);
        $stmt->bindValue(':room_id', $payload['room_id'] ?: null, PDO::PARAM_INT);
        $stmt->bindValue(':room_name', $payload['room_name']);
        $stmt->bindValue(':confirmation_code', $payload['confirmation_code']);
        $stmt->bindValue(':confirmed_by_admin_id', $payload['confirmed_by_admin_id'] ?: null, PDO::PARAM_INT);
        $stmt->execute();

        return (int)$this->conn->lastInsertId();
    }

    public function getUserActivitySummary() {
        $usersQuery = "
            SELECT a.id AS user_id, a.username, a.email,
                   COALESCE(COUNT(mc.id), 0) AS total_checkins
            FROM accounts a
            LEFT JOIN {$this->table} mc ON mc.user_id = a.id
            WHERE a.role = 'user'
            GROUP BY a.id, a.username, a.email
            ORDER BY total_checkins DESC, a.username ASC
        ";
        $usersStmt = $this->conn->prepare($usersQuery);
        $usersStmt->execute();
        $users = $usersStmt->fetchAll(PDO::FETCH_ASSOC);

        $roomsQuery = "
            SELECT mc.user_id,
                   COALESCE(mc.room_id, 0) AS room_id,
                   COALESCE(mc.room_name, 'Không xác định') AS room_name,
                   COUNT(*) AS room_checkins
            FROM {$this->table} mc
            GROUP BY mc.user_id, COALESCE(mc.room_id, 0), COALESCE(mc.room_name, 'Không xác định')
            ORDER BY room_checkins DESC, room_name ASC
        ";
        $roomsStmt = $this->conn->prepare($roomsQuery);
        $roomsStmt->execute();
        $roomsRows = $roomsStmt->fetchAll(PDO::FETCH_ASSOC);

        $timesQuery = "
            SELECT mc.user_id,
                   COALESCE(mc.room_id, 0) AS room_id,
                   COALESCE(mc.room_name, 'Không xác định') AS room_name,
                   mc.confirmed_at,
                   mc.confirmation_code
            FROM {$this->table} mc
            ORDER BY mc.confirmed_at DESC
        ";
        $timesStmt = $this->conn->prepare($timesQuery);
        $timesStmt->execute();
        $timesRows = $timesStmt->fetchAll(PDO::FETCH_ASSOC);

        $roomsMap = [];
        foreach ($roomsRows as $row) {
            $userId = (int)$row['user_id'];
            $roomKey = (string)$row['room_id'] . '|' . $row['room_name'];
            if (!isset($roomsMap[$userId])) {
                $roomsMap[$userId] = [];
            }
            $roomsMap[$userId][$roomKey] = [
                'room_id' => (int)$row['room_id'],
                'room_name' => $row['room_name'],
                'room_checkins' => (int)$row['room_checkins'],
                'times' => [],
            ];
        }

        foreach ($timesRows as $row) {
            $userId = (int)$row['user_id'];
            $roomKey = (string)$row['room_id'] . '|' . $row['room_name'];
            if (!isset($roomsMap[$userId][$roomKey])) {
                $roomsMap[$userId][$roomKey] = [
                    'room_id' => (int)$row['room_id'],
                    'room_name' => $row['room_name'],
                    'room_checkins' => 0,
                    'times' => [],
                ];
            }
            $roomsMap[$userId][$roomKey]['times'][] = [
                'confirmed_at' => $row['confirmed_at'],
                'confirmation_code' => $row['confirmation_code'],
            ];
        }

        foreach ($users as &$user) {
            $userId = (int)$user['user_id'];
            $user['total_checkins'] = (int)$user['total_checkins'];
            $user['rooms'] = isset($roomsMap[$userId]) ? array_values($roomsMap[$userId]) : [];
        }

        return $users;
    }
}
