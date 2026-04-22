<?php
// WishlistController.php - Xử lý giỏ hàng

// ===== SET CORS HEADERS TRƯỚC ALL KHÁC =====
header('Access-Control-Allow-Origin: ' . (isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*'));
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

// XỬ LÝ PREFLIGHT OPTIONS REQUEST
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(json_encode(['success' => true]));
}

require_once '../models/WishlistModel.php';
require_once '../config/database.php';

try {
    // Khởi tạo Database
    $database = new Database();
    $pdo = $database->connect();
    
    if (!$pdo) {
        throw new Exception("Cannot connect to database");
    }

    $model = new WishlistModel($pdo);
    $action = isset($_GET['action']) ? $_GET['action'] : 'getAll';
    
    // Lấy dữ liệu từ request
    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    
    // Lấy user ID từ query string hoặc POST body
    $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : (isset($data['userId']) ? (int)$data['userId'] : 1);
    $result = [];

    switch ($action) {
        case 'getAll':
            $items = $model->getByAccountId($userId);
            $result = [
                'success' => true,
                'items' => $items,
                'total_items' => count($items)
            ];
            break;

        case 'add':
            $productId = isset($data['productId']) ? (int)$data['productId'] : null;
            $quantity = isset($data['quantity']) ? (int)$data['quantity'] : 1;
            
            if (!$productId) {
                http_response_code(400);
                $result = ['success' => false, 'message' => 'productId required'];
            } else {
                $addResult = $model->addOrUpdate($userId, $productId, $quantity);
                $result = $addResult;
            }
            break;

        case 'updateQuantity':
            $wishlistId = isset($data['wishlistId']) ? (int)$data['wishlistId'] : null;
            $quantity = isset($data['quantity']) ? (int)$data['quantity'] : null;
            
            if (!$wishlistId || !$quantity) {
                http_response_code(400);
                $result = ['success' => false, 'message' => 'wishlistId and quantity required'];
            } else {
                $result = $model->updateQuantity($wishlistId, $quantity);
            }
            break;

        case 'delete':
            $wishlistId = isset($data['wishlistId']) ? (int)$data['wishlistId'] : null;
            
            if (!$wishlistId) {
                http_response_code(400);
                $result = ['success' => false, 'message' => 'wishlistId required'];
            } else {
                $result = $model->delete($wishlistId);
            }
            break;

        default:
            http_response_code(400);
            $result = ['success' => false, 'message' => 'Invalid action'];
    }

    echo json_encode($result, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
