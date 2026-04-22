<?php
// Server-to-server callback from MoMo (IPN)
// This just validates and logs - actual order status update happens in frontend PaymentCallback

$resultCode = $_GET['resultCode'] ?? $_POST['resultCode'] ?? null;
$extraData = $_GET['extraData'] ?? $_POST['extraData'] ?? null;
$orderId = $_GET['orderId'] ?? $_POST['orderId'] ?? null;

// Return 200 OK to MoMo to confirm callback received
http_response_code(200);
echo json_encode(['status' => 'ok']);

// Optional: Log for debugging
if (getenv('DEBUG_MOMO')) {
    $logFile = __DIR__ . "/../../momo_callback.log";
    $log = "\n=== CALLBACK " . date('Y-m-d H:i:s') . " | Code:" . $resultCode . " | OrderId:" . $orderId . " ===\n";
    file_put_contents($logFile, $log, FILE_APPEND);
}