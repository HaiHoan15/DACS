<?php

require_once(__DIR__ . '/../config/cors.php');
require_once(__DIR__ . '/../config/databasde.php');
require_once(__DIR__ . '/../models/UserModel.php');

enableCORS();

class AuthController {
    private $userModel;
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
        $this->userModel = new UserModel($this->conn);
    }

    // Hàm đăng nhập
    public function login() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $input = getJsonInput();
        
        // Kiểm tra dữ liệu đầu vào
        if (empty($input['email']) || empty($input['password'])) {
            sendJsonResponse(['success' => false, 'message' => 'Email và password không được để trống'], 400);
        }

        $email = trim($input['email']);
        $password = trim($input['password']);

        // Tìm user theo email
        $user = $this->userModel->findByEmail($email);

        if (!$user) {
            sendJsonResponse(['success' => false, 'message' => 'Email không tồn tại'], 401);
        }

        // Kiểm tra mật khẩu
        if (!password_verify($password, $user['password'])) {
            sendJsonResponse(['success' => false, 'message' => 'Mật khẩu không đúng'], 401);
        }

        // Đăng nhập thành công, trả về thông tin user (không bao gồm password)
        unset($user['password']);
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Đăng nhập thành công, đang chuyển hướng...',
            'user' => $user
        ], 200);
    }
}

// Xử lý request
$authController = new AuthController();
$authController->login();
?>

