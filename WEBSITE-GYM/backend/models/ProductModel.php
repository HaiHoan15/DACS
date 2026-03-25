<?php

class ProductModel {
    private $conn;
    private $table = 'products';

    public function __construct($database) {
        $this->conn = $database->connect();
    }

    // Get all products with category info
    public function getAll() {
        $query = "
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.avatar,
                p.category_id,
                c.name as category_name,
                p.created_at,
                p.updated_at
            FROM " . $this->table . " p
            LEFT JOIN product_categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get product by ID
    public function getById($id) {
        $query = "
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.avatar,
                p.category_id,
                c.name as category_name,
                p.created_at,
                p.updated_at
            FROM " . $this->table . " p
            LEFT JOIN product_categories c ON p.category_id = c.id
            WHERE p.id = :id
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get products by category ID
    public function getByCategoryId($categoryId) {
        $query = "
            SELECT 
                id,
                name,
                description,
                price,
                avatar,
                category_id,
                created_at,
                updated_at
            FROM " . $this->table . "
            WHERE category_id = :categoryId
            ORDER BY created_at DESC
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":categoryId", $categoryId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Count products by category ID
    public function countByCategoryId($categoryId) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table . " WHERE category_id = :categoryId";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":categoryId", $categoryId);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'] ?? 0;
    }

    // Add product
    public function add($name, $description, $price, $avatar, $categoryId) {
        $query = "
            INSERT INTO " . $this->table . "
            (name, description, price, avatar, category_id, created_at, updated_at)
            VALUES (:name, :description, :price, :avatar, :categoryId, NOW(), NOW())
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":price", $price);
        $stmt->bindParam(":avatar", $avatar);
        $stmt->bindParam(":categoryId", $categoryId);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    // Update product
    public function update($id, $name, $description, $price, $avatar, $categoryId) {
        $query = "
            UPDATE " . $this->table . "
            SET name = :name,
                description = :description,
                price = :price,
                avatar = :avatar,
                category_id = :categoryId,
                updated_at = NOW()
            WHERE id = :id
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":price", $price);
        $stmt->bindParam(":avatar", $avatar);
        $stmt->bindParam(":categoryId", $categoryId);
        
        return $stmt->execute();
    }

    // Delete product
    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }

    // Check if product exists
    public function exists($id) {
        $query = "SELECT id FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }
}
