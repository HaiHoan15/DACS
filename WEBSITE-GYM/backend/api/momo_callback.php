<?php
require_once "../config/database.php";

$resultCode = $_GET['resultCode'] ?? null;
$extraData = $_GET['extraData'] ?? null;

if (!$extraData) {
    die("Không có dữ liệu");
}

$data = json_decode(base64_decode($extraData), true);

if ($resultCode == 0) {

    $db = (new Database())->connect();

    // 🔥 1. tạo order
    $query = "INSERT INTO orders 
    (account_id, customer_name, phone, address, total_amount, payment_method, payment_status, status)
    VALUES (:userId, :name, :phone, :address, :total, 'momo', 'paid', 'confirmed')";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ":userId" => $data['userId'],
        ":name" => $data['name'],
        ":phone" => $data['phone'],
        ":address" => $data['address'],
        ":total" => $data['amount']
    ]);

    $orderId = $db->lastInsertId();

    // 🔥 2. tạo order details
    foreach ($data['cartItems'] as $item) {

        $detailQuery = "INSERT INTO order_details 
        (order_id, product_id, quantity, price)
        VALUES (:order_id, :product_id, :quantity, :price)";

        $detailStmt = $db->prepare($detailQuery);
        $detailStmt->execute([
            ":order_id" => $orderId,
            ":product_id" => $item['id'],
            ":quantity" => $item['quantity'],
            ":price" => $item['price']
        ]);
    }

    header("Location: http://localhost:5173/payment-callback?status=success");

} else {

    header("Location: http://localhost:5173/payment-callback?status=fail");
}