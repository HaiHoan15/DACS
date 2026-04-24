<?php
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../models/StatisticsModel.php";

enableCORS();

$database = new Database();
$db = $database->connect();

if (!$db) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$stats = new StatisticsModel($db);
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

try {
    set_error_handler(function($errno, $errstr, $errfile, $errline) {
        throw new Exception($errstr . " in " . $errfile . ":" . $errline);
    });
    
    switch ($action) {
        // TỔNG QUAN HỆ THỐNG
        case 'system-overview':
            $data = $stats->getSystemOverview();
            echo json_encode(["success" => true, "data" => $data]);
            break;

        // THỐNG KÊ DOANH THU
        case 'revenue-by-day':
            $days = $_GET['days'] ?? 30;
            $data = $stats->getRevenueByDay($days);
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'revenue-by-month':
            $months = $_GET['months'] ?? 12;
            $data = $stats->getRevenueByMonth($months);
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'revenue-by-payment-method':
            $data = $stats->getRevenueByPaymentMethod();
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'service-revenue':
            $data = $stats->getServiceRevenue();
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'top-spenders':
            $limit = $_GET['limit'] ?? 5;
            $data = $stats->getTopSpenders($limit);
            echo json_encode(["success" => true, "data" => $data]);
            break;

        // QUẢN LÝ ĐƠN HÀNG
        case 'orders-by-status':
            $data = $stats->getOrdersByStatus();
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'recent-orders':
            $limit = $_GET['limit'] ?? 20;
            $data = $stats->getRecentOrders($limit);
            echo json_encode(["success" => true, "data" => $data]);
            break;

        // NGƯỜI DÙNG
        case 'users-by-role':
            $data = $stats->getUsersByRole();
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'user-registration-by-month':
            $months = $_GET['months'] ?? 12;
            $data = $stats->getUserRegistrationByMonth($months);
            echo json_encode(["success" => true, "data" => $data]);
            break;

        // HỘI VIÊN (MEMBERSHIP)
        case 'membership-status':
            $data = $stats->getMembershipStatus();
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'members-by-package':
            $data = $stats->getMembersByPackage();
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'most-frequent-members':
            $limit = $_GET['limit'] ?? 5;
            $data = $stats->getMostFrequentMembers($limit);
            echo json_encode(["success" => true, "data" => $data]);
            break;

        // PHÒNG TẬP
        case 'checkins-by-room':
            $data = $stats->getCheckinsByRoom();
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'top-rooms':
            $limit = $_GET['limit'] ?? 5;
            $data = $stats->getTopRooms($limit);
            echo json_encode(["success" => true, "data" => $data]);
            break;

        // SẢN PHẨM
        case 'top-selling-products':
            $limit = $_GET['limit'] ?? 10;
            $data = $stats->getTopSellingProducts($limit);
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'revenue-by-product':
            $limit = $_GET['limit'] ?? 10;
            $data = $stats->getRevenueByProduct($limit);
            echo json_encode(["success" => true, "data" => $data]);
            break;

        // KHO
        case 'warehouse-status':
            $data = $stats->getWarehouseStatus();
            echo json_encode(["success" => true, "data" => $data]);
            break;

        // WISHLIST
        case 'top-wishlist-products':
            $limit = $_GET['limit'] ?? 10;
            $data = $stats->getTopWishlistProducts($limit);
            echo json_encode(["success" => true, "data" => $data]);
            break;

        default:
            http_response_code(400);
            echo json_encode(["error" => "Invalid action", "action" => $action]);
            break;
    }
    restore_error_handler();
} catch (Exception $e) {
    restore_error_handler();
    $dbError = null;
    if ($db instanceof PDO) {
        $errorInfo = $db->errorInfo();
        $dbError = $errorInfo[2] ?? null;
    }
    http_response_code(500);
    echo json_encode([
        "error" => "Server error: " . $e->getMessage(),
        "debug" => [
            "action" => $action,
            "db_error" => $dbError
        ]
    ]);
}
?>
