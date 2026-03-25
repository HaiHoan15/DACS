<?php

class CategoryModel {
    private $conn;
    private $table = "product_categories";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Lấy tất cả danh mục
    public function getAll() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Lấy danh mục theo ID
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Thêm danh mục
    public function add($name) {
        $query = "INSERT INTO " . $this->table . " (name, created_at, updated_at) 
                  VALUES (:name, NOW(), NOW())";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $name);

        return $stmt->execute();
    }

    // Cập nhật danh mục
    public function update($id, $name) {
        $query = "UPDATE " . $this->table . " 
                  SET name = :name, updated_at = NOW() 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":name", $name);

        return $stmt->execute();
    }

    // Xóa danh mục
    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    // Kiểm tra danh mục có tồn tại không (theo ID)
    public function exists($id) {
        $query = "SELECT id FROM " . $this->table . " WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Kiểm tra tên danh mục có bị trùng không (bỏ qua ID nếu được cung cấp để khi update không bị lỗi)
    public function nameExists($name, $exceptId = null) {
        $query = "SELECT id FROM " . $this->table . " WHERE LOWER(name) = LOWER(:name)";
        
        if ($exceptId) {
            $query .= " AND id != :exceptId";
        }
        
        $query .= " LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $name);
        
        if ($exceptId) {
            $stmt->bindParam(":exceptId", $exceptId);
        }
        
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}
