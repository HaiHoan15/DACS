<?php

class UserModel {
    private $conn;
    private $table = "accounts";

    public function __construct($db) {
        $this->conn = $db;
    }

    // tìm user theo email
    public function findByEmail($email) {

        $query = "SELECT * FROM " . $this->table . " WHERE email = :email LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // tìm user theo username
    public function findByUsername($username) {

        $query = "SELECT * FROM " . $this->table . " WHERE username = :username LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":username", $username);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Lấy user theo ID (kèm URL avatar)
    public function getUserById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && $user['avatar']) {
            $user['avatarUrl'] = '/uploads/avatars/' . $user['avatar'];
        } else {
            $user['avatarUrl'] = '/images/error/user.png'; // Default avatar
        }

        return $user;
    }
}