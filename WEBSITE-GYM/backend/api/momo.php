<?php
use Models\OrderModel;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get input
$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['amount'])) {
    echo json_encode(["success" => false, "message" => "Thiếu amount"]);
    exit();
}

// ===== 1. CREATE ORDER IN DATABASE =====
try {
    require_once '../config/database.php';
    require_once '../models/OrderModel.php';
    
    $database = new Database();
    $conn = $database->connect();
    $orderModel = new OrderModel($conn);
    
    // Create order with status = "pending"
    $orderId = $orderModel->createOrder(
        $input['userId'],
        $input['amount'],
        'momo',
        $input['name'] ?? '',
        $input['phone'] ?? '',
        $input['address'] ?? '',
        ''
    );
    
    if (!$orderId) {
        throw new Exception("Không thể tạo đơn hàng");
    }
    
    // Add order items
    if (isset($input['cartItems']) && is_array($input['cartItems'])) {
        foreach ($input['cartItems'] as $item) {
            $orderModel->createOrderItem(
                $orderId,
                $item['product_id'] ?? $item['id'] ?? 0,
                $item['name'] ?? '',
                $item['quantity'] ?? 0,
                $item['price'] ?? 0,
                ($item['price'] ?? 0) * ($item['quantity'] ?? 0)
            );
        }
    }
    
    // Delete wishlist items
    if (isset($input['cartItems']) && is_array($input['cartItems'])) {
        foreach ($input['cartItems'] as $item) {
            if (isset($item['wishlist_id'])) {
                $deleteQuery = "DELETE FROM wishlists WHERE id = :wishlist_id";
                $deleteStmt = $conn->prepare($deleteQuery);
                $deleteStmt->execute([":wishlist_id" => $item['wishlist_id']]);
            }
        }
    }
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Lỗi tạo đơn hàng: " . $e->getMessage()]);
    exit();
}

// ===== 2. CALL MOMO API =====

$endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";

$partnerCode = "MOMOBKUN20180529";
$accessKey = "klm05TvNBzhg7h7j";
$secretKey = "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";

$requestId = time();
$momoOrderId = "MOMO_" . $orderId . "_" . $requestId;
$orderInfo = "Thanh toán đơn hàng #" . $orderId;
$redirectUrl = "http://localhost:5173/payment-callback?orderId=" . $orderId; //frontend callback URL
$ipnUrl = "http://localhost/backend/api/momo_callback.php"; //backend callback URL
$requestType = "payWithATM";

$extraData = base64_encode(json_encode([
    "orderId" => $orderId,
    "userId" => $input['userId'],
    "amount" => $input['amount']
]));

// Build signature
$rawHash = "accessKey=" . $accessKey .
    "&amount=" . $input['amount'] .
    "&extraData=" . $extraData .
    "&ipnUrl=" . $ipnUrl .
    "&orderId=" . $momoOrderId .
    "&orderInfo=" . $orderInfo .
    "&partnerCode=" . $partnerCode .
    "&redirectUrl=" . $redirectUrl .
    "&requestId=" . $requestId .
    "&requestType=" . $requestType;

$signature = hash_hmac("sha256", $rawHash, $secretKey);

$requestData = [
    "partnerCode" => $partnerCode,
    "requestId" => $requestId,
    "amount" => $input['amount'],
    "orderId" => $momoOrderId,
    "orderInfo" => $orderInfo,
    "redirectUrl" => $redirectUrl,
    "ipnUrl" => $ipnUrl,
    "requestType" => $requestType,
    "extraData" => $extraData,
    "signature" => $signature
];

// Call MoMo API
$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$momoResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (!$momoResponse) {
    echo json_encode(["success" => false, "message" => "MoMo API connection failed"]);
    exit();
}

// Parse MoMo response
$parsedResponse = json_decode($momoResponse, true);

// Return success response with payUrl
if ($httpCode === 200 && isset($parsedResponse['resultCode']) && $parsedResponse['resultCode'] == 0) {
    $payUrl = $parsedResponse['payUrl'] ?? $parsedResponse['shortLink'] ?? null;
    
    if ($payUrl) {
        echo json_encode([
            "success" => true,
            "payUrl" => $payUrl,
            "orderId" => $orderId,
            "message" => "Tạo link thanh toán thành công"
        ]);
    } else {
        // No payUrl found - delete the order we just created
        $orderModel->delete($orderId);
        echo json_encode([
            "success" => false,
            "message" => "Không tìm thấy payUrl"
        ]);
    }
} else {
    // MoMo API Error - delete the order we just created to avoid orphaned pending orders
    $orderModel->delete($orderId);
    echo json_encode([
        "success" => false,
        "message" => "MoMo API Error",
        "resultCode" => $parsedResponse['resultCode'] ?? null
    ]);
}
?>