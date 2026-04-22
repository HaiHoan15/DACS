<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../models/OrderModel.php';
require_once __DIR__ . '/../models/WishlistModel.php';
require_once __DIR__ . '/../config/database.php';

enableCORS();

use Models\OrderModel;

$action = $_GET['action'] ?? '';

try {
    // Create database connection
    $database = new Database();
    $pdo = $database->connect();
    
    if (!$pdo) {
        throw new Exception("Cannot connect to database");
    }

    $orderModel = new OrderModel($pdo);
    $wishlistModel = new WishlistModel($pdo);
    if ($action === 'create') {
        createOrder();
    } elseif ($action === 'getAll') {
        getAll();
    } elseif ($action === 'getByUser') {
        getByUser();
    } elseif ($action === 'get') {
        get();
    } elseif ($action === 'updateStatus') {
        updateStatus();
    } elseif ($action === 'delete') {
        deleteOrder();
    } elseif ($action === 'cleanupPending') {
        cleanupPendingOrders();
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
}

function createOrder() {
    global $orderModel, $wishlistModel;
    
    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    
    $accountId = isset($_GET['accountId']) ? (int)$_GET['accountId'] : (isset($data['accountId']) ? (int)$data['accountId'] : 1);
    $totalAmount = $data['totalAmount'] ?? 0;
    $paymentMethod = $data['paymentMethod'] ?? 'direct';
    $recipientName = $data['recipientName'] ?? '';
    $recipientPhone = $data['recipientPhone'] ?? '';
    $recipientAddress = $data['recipientAddress'] ?? '';
    $notes = $data['notes'] ?? '';
    $cartItems = $data['cartItems'] ?? [];

    // Validate
    if (empty($recipientName) || empty($recipientPhone) || empty($recipientAddress)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Vui lòng điền đầy đủ thông tin giao hàng']);
        return;
    }

    if (empty($cartItems)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Giỏ hàng trống']);
        return;
    }

    // Create order
    $orderId = $orderModel->createOrder($accountId, $totalAmount, $paymentMethod, $recipientName, $recipientPhone, $recipientAddress, $notes);

    if (!$orderId) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Không thể tạo đơn hàng']);
        return;
    }

    // Add order items
    foreach ($cartItems as $item) {
        $productId = $item['product_id'] ?? $item['id'] ?? 0;
        $orderModel->createOrderItem(
            $orderId,
            $productId,
            $item['name'] ?? '',
            $item['quantity'] ?? 1,
            $item['price'] ?? 0,
            ($item['price'] ?? 0) * ($item['quantity'] ?? 1)
        );

        // Delete from wishlist
        if (isset($item['wishlist_id'])) {
            $wishlistModel->delete($item['wishlist_id']);
        }
    }

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Đơn hàng đã được tạo thành công',
        'orderId' => $orderId
    ]);
}

function getByUser() {
    global $orderModel;
    
    $accountId = isset($_GET['accountId']) ? (int)$_GET['accountId'] : 1;
    
    $orders = $orderModel->getByAccountId($accountId);
    
    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);
}

function get() {
    global $orderModel;
    
    $orderId = isset($_GET['orderId']) ? (int)$_GET['orderId'] : 0;
    
    if ($orderId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid order ID']);
        return;
    }
    
    $order = $orderModel->getOrderById($orderId);
    
    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Đơn hàng không tồn tại']);
        return;
    }
    
    echo json_encode([
        'success' => true,
        'order' => $order
    ]);
}

function updateStatus() {
    global $orderModel;
    
    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    
    $orderId = isset($_GET['orderId']) ? (int)$_GET['orderId'] : (isset($data['orderId']) ? (int)$data['orderId'] : 0);
    $status = $data['status'] ?? 'pending';
    
    if ($orderId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid order ID']);
        return;
    }
    
    $result = $orderModel->updateStatus($orderId, $status);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Không thể cập nhật trạng thái']);
    }
}

function getAll() {
    global $orderModel;
    
    $orders = $orderModel->getAll();
    
    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);
}

function deleteOrder() {
    global $orderModel;
    
    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    
    $orderId = isset($_GET['orderId']) ? (int)$_GET['orderId'] : (isset($data['orderId']) ? (int)$data['orderId'] : 0);
    
    if ($orderId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid order ID']);
        return;
    }
    
    $result = $orderModel->delete($orderId);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Xóa đơn hàng thành công'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Không thể xóa đơn hàng']);
    }
}

function cleanupPendingOrders() {
    // DISABLED: This was deleting all pending orders > 15 minutes, causing wrong deletions
    // Orders should only be deleted:
    // 1. When user closes payment modal (handleClose)
    // 2. When PaymentCallback processes MoMo result (cancel = delete, success = confirm)
    // 3. When MoMo API fails (momo.php)
    
    echo json_encode([
        'success' => true,
        'message' => 'Cleanup disabled - orders deleted on close/callback',
        'deleted' => 0
    ]);
}

// function createMomo()
// {
//     try {
//         $data = json_decode(file_get_contents("php://input"), true);

//         $amount = $data['amount'];
//         $orderId = time(); // tạm

//         $endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";

//         $partnerCode = "MOMOBKUN20180529";
//         $accessKey = "klm05TvNBzhg7h7j";
//         $secretKey = "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";

//         $requestId = time() . "";
//         $orderIdStr = "MOMO_" . $orderId;
//         $orderInfo = "Thanh toán đơn hàng";

//         $redirectUrl = "http://localhost:5173/payment-callback";
//         $ipnUrl = "http://localhost/backend/index.php?action=momoCallback";

//         $requestType = "payWithATM";
//         $extraData = "";

//         $rawHash =
//             "accessKey=" . $accessKey .
//             "&amount=" . $amount .
//             "&extraData=" . $extraData .
//             "&ipnUrl=" . $ipnUrl .
//             "&orderId=" . $orderIdStr .
//             "&orderInfo=" . $orderInfo .
//             "&partnerCode=" . $partnerCode .
//             "&redirectUrl=" . $redirectUrl .
//             "&requestId=" . $requestId .
//             "&requestType=" . $requestType;

//         $signature = hash_hmac("sha256", $rawHash, $secretKey);

//         $dataMomo = [
//             "partnerCode" => $partnerCode,
//             "requestId" => $requestId,
//             "amount" => $amount,
//             "orderId" => $orderIdStr,
//             "orderInfo" => $orderInfo,
//             "redirectUrl" => $redirectUrl,
//             "ipnUrl" => $ipnUrl,
//             "requestType" => $requestType,
//             "extraData" => $extraData,
//             "signature" => $signature,
//         ];

//         $ch = curl_init($endpoint);
//         curl_setopt($ch, CURLOPT_POST, true);
//         curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dataMomo));
//         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//         curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

//         $result = curl_exec($ch);
//         curl_close($ch);

//         echo $result;
//     } catch (Exception $e) {
//         echo json_encode(['error' => $e->getMessage()]);
//     }
// }
