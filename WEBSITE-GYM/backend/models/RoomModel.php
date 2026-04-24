<?php

class RoomModel {
    private $conn;
    private $roomTable = 'rooms';
    private $equipmentTable = 'room_equipments';

    public function __construct($database) {
        $this->conn = $database->connect();
    }

    public function getAll() {
        $query = "
            SELECT r.id, r.name, r.description, r.avatar, r.created_at, r.updated_at,
                   COUNT(re.id) AS equipment_count,
                   COALESCE(SUM(re.quantity), 0) AS equipment_quantity_total
            FROM {$this->roomTable} r
            LEFT JOIN {$this->equipmentTable} re ON re.room_id = r.id
            GROUP BY r.id
            ORDER BY r.created_at DESC
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $query = "SELECT id, name, description, avatar, created_at, updated_at FROM {$this->roomTable} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getEquipments($roomId) {
        $query = "
            SELECT re.id, re.room_id, re.warehouse_item_id AS item_id, re.quantity,
                   wi.name AS item_name, wi.avatar AS item_avatar, wi.quantity AS total_stock
            FROM {$this->equipmentTable} re
            JOIN warehouse_items wi ON wi.id = re.warehouse_item_id
            WHERE re.room_id = :room_id
            ORDER BY wi.name ASC
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':room_id', $roomId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEquipmentsByRoomIds(array $roomIds) {
        if (empty($roomIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($roomIds), '?'));
        $query = "
            SELECT re.room_id, re.warehouse_item_id AS item_id, re.quantity,
                   wi.name AS item_name, wi.avatar AS item_avatar
            FROM {$this->equipmentTable} re
            JOIN warehouse_items wi ON wi.id = re.warehouse_item_id
            WHERE re.room_id IN ($placeholders)
            ORDER BY wi.name ASC
        ";
        $stmt = $this->conn->prepare($query);
        foreach ($roomIds as $index => $roomId) {
            $stmt->bindValue($index + 1, (int)$roomId, PDO::PARAM_INT);
        }
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $grouped = [];
        foreach ($rows as $row) {
            $grouped[$row['room_id']][] = $row;
        }
        return $grouped;
    }

    public function exists($id) {
        $query = "SELECT id FROM {$this->roomTable} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    public function getWarehouseItem($itemId) {
        $query = "SELECT id, name, quantity FROM warehouse_items WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $itemId);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAllocatedForItem($itemId, $excludeRoomId = null) {
        if ($excludeRoomId) {
            $query = "SELECT COALESCE(SUM(quantity), 0) AS total FROM {$this->equipmentTable} WHERE warehouse_item_id = :item_id AND room_id <> :room_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':item_id', $itemId);
            $stmt->bindParam(':room_id', $excludeRoomId);
        } else {
            $query = "SELECT COALESCE(SUM(quantity), 0) AS total FROM {$this->equipmentTable} WHERE warehouse_item_id = :item_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':item_id', $itemId);
        }
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['total'] ?? 0);
    }

    public function createWithEquipments($name, $description, $avatar, array $equipments) {
        $this->conn->beginTransaction();
        try {
            $query = "INSERT INTO {$this->roomTable} (name, description, avatar, created_at, updated_at) VALUES (:name, :description, :avatar, NOW(), NOW())";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':avatar', $avatar);
            $stmt->execute();

            $roomId = (int)$this->conn->lastInsertId();
            $this->syncEquipments($roomId, $equipments);
            $this->conn->commit();
            return $roomId;
        } catch (Throwable $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function updateWithEquipments($roomId, $name, $description, $avatar, array $equipments) {
        $this->conn->beginTransaction();
        try {
            $query = "UPDATE {$this->roomTable} SET name = :name, description = :description, avatar = :avatar, updated_at = NOW() WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $roomId);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':avatar', $avatar);
            $stmt->execute();

            $this->syncEquipments($roomId, $equipments);
            $this->conn->commit();
            return true;
        } catch (Throwable $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function delete($id) {
        $query = "DELETE FROM {$this->roomTable} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    private function syncEquipments($roomId, array $equipments) {
        $deleteQuery = "DELETE FROM {$this->equipmentTable} WHERE room_id = :room_id";
        $deleteStmt = $this->conn->prepare($deleteQuery);
        $deleteStmt->bindParam(':room_id', $roomId);
        $deleteStmt->execute();

        if (empty($equipments)) {
            return;
        }

        $insertQuery = "INSERT INTO {$this->equipmentTable} (room_id, warehouse_item_id, quantity, created_at, updated_at) VALUES (:room_id, :item_id, :quantity, NOW(), NOW())";
        $insertStmt = $this->conn->prepare($insertQuery);

        foreach ($equipments as $equipment) {
            if (($equipment['quantity'] ?? 0) <= 0) {
                continue;
            }
            $itemId = (int)$equipment['itemId'];
            $quantity = (int)$equipment['quantity'];
            $insertStmt->bindParam(':room_id', $roomId);
            $insertStmt->bindParam(':item_id', $itemId);
            $insertStmt->bindParam(':quantity', $quantity);
            $insertStmt->execute();
        }
    }
}
