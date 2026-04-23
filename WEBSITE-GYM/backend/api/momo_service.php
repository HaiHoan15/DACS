<?php
// MoMo payment gateway for service package subscriptions
// NOTE: No DB record is created here. DB insert happens only on confirmed payment in the callback.

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['amount'], $input['userId'], $input['packageId'], $input['packageName'])) {
    echo json_encode(["success" => false, "message" => "Thiếu thông tin thanh toán"]);
    exit();
}

// ===== GỌI MOMO API (không ghi DB) =====

$endpoint    = "https://test-payment.momo.vn/v2/gateway/api/create";
$partnerCode = "MOMOBKUN20180529";
$accessKey   = "klm05TvNBzhg7h7j";
$secretKey   = "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";

$requestId   = time();
$momoOrderId = "SVC_" . $input['userId'] . "_" . $input['packageId'] . "_" . $requestId;
$orderInfo   = "Đăng ký gói " . $input['packageName'] . " - ThreeGym";

// Truyền userId và packageId qua redirect URL — DB sẽ được ghi khi callback thành công
$redirectUrl = "http://localhost:5173/service-payment-callback"
    . "?userId="    . urlencode($input['userId'])
    . "&packageId=" . urlencode($input['packageId']);

$ipnUrl      = "http://localhost/backend/api/momo_callback.php";
$requestType = "payWithATM";

$extraData = base64_encode(json_encode([
    "userId"    => $input['userId'],
    "packageId" => $input['packageId'],
    "amount"    => $input['amount']
]));

$rawHash =
    "accessKey="    . $accessKey .
    "&amount="      . $input['amount'] .
    "&extraData="   . $extraData .
    "&ipnUrl="      . $ipnUrl .
    "&orderId="     . $momoOrderId .
    "&orderInfo="   . $orderInfo .
    "&partnerCode=" . $partnerCode .
    "&redirectUrl=" . $redirectUrl .
    "&requestId="   . $requestId .
    "&requestType=" . $requestType;

$signature = hash_hmac("sha256", $rawHash, $secretKey);

$requestData = [
    "partnerCode" => $partnerCode,
    "requestId"   => $requestId,
    "amount"      => $input['amount'],
    "orderId"     => $momoOrderId,
    "orderInfo"   => $orderInfo,
    "redirectUrl" => $redirectUrl,
    "ipnUrl"      => $ipnUrl,
    "requestType" => $requestType,
    "extraData"   => $extraData,
    "signature"   => $signature
];

$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$momoResponse = curl_exec($ch);
$httpCode     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (!$momoResponse) {
    echo json_encode(["success" => false, "message" => "Không thể kết nối MoMo"]);
    exit();
}

$parsed = json_decode($momoResponse, true);

if ($httpCode === 200 && isset($parsed['resultCode']) && $parsed['resultCode'] == 0) {
    $payUrl = $parsed['payUrl'] ?? $parsed['shortLink'] ?? null;
    if ($payUrl) {
        echo json_encode(["success" => true, "payUrl" => $payUrl]);
        exit();
    }
}

echo json_encode([
    "success" => false,
    "message" => "MoMo từ chối: " . ($parsed['message'] ?? 'Unknown error')
]);
