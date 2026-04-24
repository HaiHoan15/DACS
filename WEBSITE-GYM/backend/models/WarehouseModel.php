<?php

class WarehouseModel {
    private $conn;
    private $table = 'warehouse_items';

    public function __construct($database) {
        $this->conn = $database->connect();
    }

    public function getAll() {
        $query = "
            SELECT
                wi.id,
                wi.name,
                wi.description,
                wi.quantity,
                wi.avatar,
                wi.created_at,
                wi.updated_at,
                COALESCE(SUM(re.quantity), 0) AS allocated_quantity,
                GREATEST(wi.quantity - COALESCE(SUM(re.quantity), 0), 0) AS available_quantity,
                COUNT(DISTINCT re.room_id) AS room_count
            FROM " . $this->table . " wi
            LEFT JOIN room_equipments re ON re.warehouse_item_id = wi.id
            GROUP BY wi.id
            ORDER BY wi.created_at DESC
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $query = "
            SELECT
                wi.id,
                wi.name,
                wi.description,
                wi.quantity,
                wi.avatar,
                wi.created_at,
                wi.updated_at,
                COALESCE(SUM(re.quantity), 0) AS allocated_quantity,
                GREATEST(wi.quantity - COALESCE(SUM(re.quantity), 0), 0) AS available_quantity,
                COUNT(DISTINCT re.room_id) AS room_count
            FROM " . $this->table . " wi
            LEFT JOIN room_equipments re ON re.warehouse_item_id = wi.id
            WHERE wi.id = :id
            GROUP BY wi.id
            LIMIT 1
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function add($name, $description, $quantity, $avatar) {
        $query = "
            INSERT INTO " . $this->table . "
            (name, description, quantity, avatar, created_at, updated_at)
            VALUES (:name, :description, :quantity, :avatar, NOW(), NOW())
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':avatar', $avatar);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function update($id, $name, $description, $quantity, $avatar) {
        $query = "
            UPDATE " . $this->table . "
            SET name = :name,
                description = :description,
                quantity = :quantity,
                avatar = :avatar,
                updated_at = NOW()
            WHERE id = :id
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':avatar', $avatar);
        return $stmt->execute();
    }

    public function updateQuantity($id, $quantity) {
        $query = "
            UPDATE " . $this->table . "
            SET quantity = :quantity,
                updated_at = NOW()
            WHERE id = :id
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':quantity', $quantity);
        return $stmt->execute();
    }

    public function getRoomAllocations($itemId) {
        $query = "
            SELECT r.id AS room_id, r.name AS room_name, re.quantity
            FROM room_equipments re
            JOIN rooms r ON r.id = re.room_id
            WHERE re.warehouse_item_id = :item_id
            ORDER BY r.name ASC
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':item_id', $itemId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateDistribution($itemId, $totalQuantity, array $roomAllocations) {
        $this->conn->beginTransaction();
        try {
            $updateQuery = "UPDATE " . $this->table . " SET quantity = :quantity, updated_at = NOW() WHERE id = :id";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':quantity', $totalQuantity);
            $updateStmt->bindParam(':id', $itemId);
            $updateStmt->execute();

            $deleteStmt = $this->conn->prepare("DELETE FROM room_equipments WHERE room_id = :room_id AND warehouse_item_id = :item_id");
            $upsertStmt = $this->conn->prepare(
                "INSERT INTO room_equipments (room_id, warehouse_item_id, quantity, created_at, updated_at)
                 VALUES (:room_id, :item_id, :quantity, NOW(), NOW())
                 ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), updated_at = NOW()"
            );

            foreach ($roomAllocations as $allocation) {
                $roomId = (int)($allocation['roomId'] ?? 0);
                $quantity = (int)($allocation['quantity'] ?? 0);
                if (!$roomId) {
                    continue;
                }

                if ($quantity <= 0) {
                    $deleteStmt->bindParam(':room_id', $roomId);
                    $deleteStmt->bindParam(':item_id', $itemId);
                    $deleteStmt->execute();
                    continue;
                }

                $upsertStmt->bindParam(':room_id', $roomId);
                $upsertStmt->bindParam(':item_id', $itemId);
                $upsertStmt->bindParam(':quantity', $quantity);
                $upsertStmt->execute();
            }

            $this->conn->commit();
            return true;
        } catch (Throwable $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function exists($id) {
        $query = "SELECT id FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }
}
