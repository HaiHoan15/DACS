<?php

require_once(__DIR__ . '/../config/cors.php');
require_once(__DIR__ . '/../config/database.php');
require_once(__DIR__ . '/../models/UserModel.php');

enableCORS();

class RegisterController {
    private $userModel;
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
        $this->userModel = new UserModel($this->conn);
    }

    // Hàm đăng ký
    public function register() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $input = getJsonInput();
        
        // Kiểm tra dữ liệu bắt buộc
        if (empty($input['email']) || empty($input['username']) || empty($input['password']) || empty($input['confirmPassword'])) {
            sendJsonResponse(['success' => false, 'message' => 'Vui lòng điền đầy đủ thông tin bắt buộc'], 400);
        }

        $email = trim($input['email']);
        $username = trim($input['username']);
        $password = trim($input['password']);
        $confirmPassword = trim($input['confirmPassword']);
        // Avatar upload sẽ được xử lý riêng qua AvatarController
        $address = isset($input['address']) ? trim($input['address']) : null;
        $phone = isset($input['phone']) ? trim($input['phone']) : null;

        // Kiểm tra định dạng email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendJsonResponse(['success' => false, 'message' => 'Email không hợp lệ'], 400);
        }

        // Kiểm tra mật khẩu và xác nhận
        if ($password !== $confirmPassword) {
            sendJsonResponse(['success' => false, 'message' => 'Mật khẩu xác nhận không trùng khớp'], 400);
        }

        // Kiểm tra độ dài mật khẩu
        if (strlen($password) < 6) {
            sendJsonResponse(['success' => false, 'message' => 'Mật khẩu phải có ít nhất 6 ký tự'], 400);
        }

        // Kiểm tra email đã tồn tại
        if ($this->userModel->findByEmail($email)) {
            sendJsonResponse(['success' => false, 'message' => 'Email đã được đăng ký'], 400);
        }

        // Kiểm tra username đã tồn tại
        if ($this->userModel->findByUsername($username)) {
            sendJsonResponse(['success' => false, 'message' => 'Username đã tồn tại'], 400);
        }

        // Hash mật khẩu
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Tạo user mới (avatar sẽ được upload riêng sau đó)
        $userData = [
            'username' => $username,
            'email' => $email,
            'password' => $hashedPassword,
            'avatar' => null,  // Avatar sẽ upload qua AvatarController
            'address' => $address,
            'phone' => $phone,
            'role' => 'user'  // Mặc định role là user
        ];

        $query = "INSERT INTO accounts (username, email, password, avatar, address, phone, role) 
                  VALUES (:username, :email, :password, :avatar, :address, :phone, :role)";
        
        $stmt = $this->conn->prepare($query);
        
        try {
            $stmt->execute($userData);
            sendJsonResponse([
                'success' => true,
                'message' => 'Đăng ký thành công'
            ], 201);
        } catch(PDOException $e) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Lỗi khi đăng ký: ' . $e->getMessage()
            ], 500);
        }
    }
}

// Xử lý request
$registerController = new RegisterController();
$registerController->register();
?>
