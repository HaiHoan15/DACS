<?php

require_once(__DIR__ . '/../config/cors.php');
require_once(__DIR__ . '/../config/database.php');
require_once(__DIR__ . '/../models/UserModel.php');

enableCORS();

class UserController {
    private $userModel;
    private $conn;
    //vì đang làm demo nên hãy làm đường dẫn tạm thời nên vẫn chưa dùng biến môi trường để lưu trữ, sau này sẽ chỉnh sửa lại
    private $uploadDir = 'D:/HocDaiHoc/CNTT/NAM 5/DACS/demo/WEBSITE-GYM/frontend/public/uploads/avatars/';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
        $this->userModel = new UserModel($this->conn);
        
        // Tạo folder avatars nếu không tồn tại
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    // Router chính - xử lý các action
    public function handleRequest() {
        // Lấy action từ $_POST, $_GET, hoặc JSON body
        $action = $_POST['action'] ?? $_GET['action'] ?? null;
        
        // Nếu không tìm thấy, kiểm tra trong JSON body
        if (!$action) {
            $input = getJsonInput();
            $action = $input['action'] ?? null;
        }

        switch ($action) {
            case 'update':
                return $this->updateUserInfo();
            case 'uploadAvatar':
                return $this->uploadAvatar();
            case 'getUser':
                return $this->getUser();
            default:
                sendJsonResponse(['success' => false, 'message' => 'Action not found'], 404);
        }
    }

    /**
     * ==============================================
     * GET USER DATA
     * ==============================================
     */
    private function getUser() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        // Kiểm tra authorization header
        $authHeader = getallheaders()['Authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
            sendJsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $userId = $_GET['userId'] ?? null;
        if (!$userId) {
            sendJsonResponse(['success' => false, 'message' => 'User ID not provided'], 400);
        }

        $user = $this->userModel->getUserById($userId);
        if (!$user) {
            sendJsonResponse(['success' => false, 'message' => 'User not found'], 404);
        }

        error_log("User from model: " . json_encode($user)); // Debug log
        unset($user['password']); // Không gửi password
        sendJsonResponse([
            'success' => true,
            'user' => $user
        ], 200);
    }

    /**
     * ==============================================
     * UPDATE USER INFO
     * ==============================================
     */
    private function updateUserInfo() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $input = getJsonInput();
        
        // Kiểm tra authorization
        $authHeader = getallheaders()['Authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
            sendJsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $userId = $input['userId'] ?? null;
        $username = isset($input['username']) ? trim($input['username']) : null;
        $address = isset($input['address']) ? trim($input['address']) : null;
        $phone = isset($input['phone']) ? trim($input['phone']) : null;
        $currentPassword = isset($input['currentPassword']) ? trim($input['currentPassword']) : null;
        $newPassword = isset($input['newPassword']) ? trim($input['newPassword']) : null;
        $confirmPassword = isset($input['confirmPassword']) ? trim($input['confirmPassword']) : null;

        if (!$userId) {
            sendJsonResponse(['success' => false, 'message' => 'User ID not provided'], 400);
        }

        // Lấy user hiện tại
        $user = $this->userModel->getUserById($userId);
        if (!$user) {
            sendJsonResponse(['success' => false, 'message' => 'User not found'], 404);
        }

        // Nếu muốn đổi username
        if ($username !== null && $username !== $user['username']) {
            // Kiểm tra độ dài
            if (strlen($username) < 3 || strlen($username) > 30) {
                sendJsonResponse(['success' => false, 'message' => 'Tên người dùng phải từ 3 đến 30 ký tự'], 400);
            }

            // Kiểm tra username đã tồn tại
            if ($this->userModel->findByUsername($username)) {
                sendJsonResponse(['success' => false, 'message' => 'Tên người dùng đã tồn tại'], 400);
            }
        }

        // Nếu muốn đổi mật khẩu
        if ($newPassword !== null) {
            // Kiểm tra current password được nhập
            if (!$currentPassword) {
                sendJsonResponse(['success' => false, 'message' => 'Vui lòng nhập mật khẩu hiện tại'], 400);
            }

            // Kiểm tra current password đúng
            if (!password_verify($currentPassword, $user['password'])) {
                sendJsonResponse(['success' => false, 'message' => 'Mật khẩu hiện tại không đúng'], 401);
            }

            // Kiểm tra mật khẩu mới
            if (strlen($newPassword) < 6) {
                sendJsonResponse(['success' => false, 'message' => 'Mật khẩu mới phải có ít nhất 6 ký tự'], 400);
            }

            // Kiểm tra confirm password
            if ($newPassword !== $confirmPassword) {
                sendJsonResponse(['success' => false, 'message' => 'Mật khẩu xác nhận không trùng khớp'], 400);
            }
        }

        // Prepare update query
        $updateData = [':id' => $userId];
        $setClauses = [];

        if ($username !== null && $username !== $user['username']) {
            $setClauses[] = 'username = :username';
            $updateData[':username'] = $username;
        }

        if ($address !== null) {
            $setClauses[] = 'address = :address';
            $updateData[':address'] = $address;
        }

        if ($phone !== null) {
            $setClauses[] = 'phone = :phone';
            $updateData[':phone'] = $phone;
        }

        if ($newPassword !== null) {
            $setClauses[] = 'password = :password';
            $updateData[':password'] = password_hash($newPassword, PASSWORD_DEFAULT);
        }

        // Nếu không có gì thay đổi
        if (empty($setClauses)) {
            sendJsonResponse(['success' => false, 'message' => 'Không có thay đổi'], 400);
        }

        // Execute update
        $query = "UPDATE accounts SET " . implode(", ", $setClauses) . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        try {
            $stmt->execute($updateData);

            // Lấy user updated
            $updatedUser = $this->userModel->getUserById($userId);
            unset($updatedUser['password']);

            sendJsonResponse([
                'success' => true,
                'message' => 'Cập nhật thông tin thành công',
                'user' => $updatedUser
            ], 200);
        } catch(PDOException $e) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Lỗi khi cập nhật: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ==============================================
     * UPLOAD AVATAR
     * ==============================================
     */
    private function uploadAvatar() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        // Kiểm tra authorization header
        $authHeader = getallheaders()['Authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
            sendJsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // Kiểm tra file upload
        if (!isset($_FILES['avatar'])) {
            sendJsonResponse(['success' => false, 'message' => 'No file uploaded'], 400);
        }

        $file = $_FILES['avatar'];
        $userId = $_POST['userId'] ?? null;

        if (!$userId) {
            sendJsonResponse(['success' => false, 'message' => 'User ID not provided'], 400);
        }

        // Kiểm tra lỗi upload
        if ($file['error'] !== UPLOAD_ERR_OK) {
            sendJsonResponse(['success' => false, 'message' => 'File upload error'], 400);
        }

        // Kiểm tra kích thước file (max 5MB)
        $maxSize = 5 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            sendJsonResponse(['success' => false, 'message' => 'File size exceeds 5MB'], 400);
        }

        // Kiểm tra loại file
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedMimes)) {
            sendJsonResponse(['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, GIF, WebP allowed'], 400);
        }

        // Tạo filename duy nhất
        $ext = \pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'avatar_' . $userId . '_' . time() . '.' . $ext;
        $filePath = $this->uploadDir . $filename;

        error_log("Upload attempt - uploadDir: " . $this->uploadDir);
        error_log("Upload attempt - filePath: " . $filePath);
        error_log("Upload attempt - uploadDir exists: " . (is_dir($this->uploadDir) ? 'yes' : 'no'));

        // Xóa avatar cũ nếu có
        $this->deleteOldAvatar($userId);

        // Move file
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            error_log("Move failed! tmp_name: " . $file['tmp_name'] . ", filePath: " . $filePath);
            sendJsonResponse(['success' => false, 'message' => 'Failed to save file'], 500);
        }

        error_log("File moved successfully to: " . $filePath);

        // Update database
        $query = "UPDATE accounts SET avatar = :avatar WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':avatar', $filename);
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);

        try {
            $stmt->execute();
            sendJsonResponse([
                'success' => true,
                'message' => 'Avatar uploaded successfully',
                'avatar' => $filename,
                'avatarUrl' => '/uploads/avatars/' . $filename
            ], 200);
        } catch(PDOException $e) {
            // Xóa file nếu update database thất bại
            unlink($filePath);
            sendJsonResponse([
                'success' => false,
                'message' => 'Failed to update database: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ==============================================
     * HELPER METHODS
     * ==============================================
     */

    // Xóa avatar cũ
    private function deleteOldAvatar($userId) {
        $query = "SELECT avatar FROM accounts WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result && $result['avatar']) {
            $oldFile = $this->uploadDir . $result['avatar'];
            if (file_exists($oldFile)) {
                unlink($oldFile);
            }
        }
    }

    // Lấy avatar URL
    public function getAvatarUrl($userId) {
        $query = "SELECT avatar FROM accounts WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result && $result['avatar']) {
            return '/uploads/avatars/' . $result['avatar'];
        }
        return null;
    }
}

// Xử lý request
$userController = new UserController();
$userController->handleRequest();
?>
