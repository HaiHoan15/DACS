<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/ServiceModel.php';

enableCORS();

use Models\ServiceModel;

$action = $_GET['action'] ?? '';

try {
    $database = new Database();
    $pdo      = $database->connect();
    $serviceModel = new ServiceModel($pdo);

    switch ($action) {
        case 'getPackages':    getPackages();    break;
        case 'getUserService': getUserService(); break;
        case 'createActive':   createActive();   break;
        case 'getAll':               getAll();               break;
        case 'updateService':        updateService();        break;
        case 'getUsersWithoutService': getUsersWithoutService(); break;
        case 'deleteService':           deleteService();           break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// ─── Handlers ──────────────────────────────────────────────

function getPackages() {
    global $serviceModel;
    $packages = $serviceModel->getPackages();
    echo json_encode(['success' => true, 'packages' => $packages]);
}

function getUserService() {
    global $serviceModel;
    $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : 0;
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'Thiếu userId']);
        return;
    }
    $service = $serviceModel->getUserService($userId);
    echo json_encode(['success' => true, 'service' => $service]);
}

function createActive() {
    global $serviceModel;
    $data      = json_decode(file_get_contents("php://input"), true) ?? [];
    $userId    = isset($data['userId'])    ? (int)$data['userId']    : 0;
    $packageId = isset($data['packageId']) ? (int)$data['packageId'] : 0;

    if (!$userId || !$packageId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Thiếu userId hoặc packageId']);
        return;
    }

    // Lấy duration_days từ DB
    $packages = $serviceModel->getPackages();
    $package  = null;
    foreach ($packages as $p) {
        if ((int)$p['id'] === $packageId) { $package = $p; break; }
    }
    if (!$package) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Gói dịch vụ không tồn tại']);
        return;
    }

    $newId = $serviceModel->createActive($userId, $packageId, (int)$package['duration_days']);
    echo json_encode(['success' => (bool)$newId]);
}

function getUsersWithoutService() {
    global $serviceModel;
    $users = $serviceModel->getUsersWithoutService();
    echo json_encode(['success' => true, 'users' => $users]);
}

function deleteService() {
    global $serviceModel;
    $data   = json_decode(file_get_contents('php://input'), true) ?? [];
    $userId = isset($data['userId']) ? (int)$data['userId'] : 0;
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Thiếu userId']);
        return;
    }
    $rows = $serviceModel->deleteUserService($userId);
    echo json_encode(['success' => true, 'deleted' => $rows]);
}

function getAll() {
    global $serviceModel;
    $services = $serviceModel->getAllForAdmin();
    echo json_encode(['success' => true, 'services' => $services]);
}

function updateService() {
    global $serviceModel;

    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    $userServiceId = isset($data['userServiceId']) ? (int)$data['userServiceId'] : 0;
    $packageId = isset($data['packageId']) ? (int)$data['packageId'] : null;
    $status = isset($data['status']) ? trim((string)$data['status']) : null;

    if (!$userServiceId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Thiếu userServiceId']);
        return;
    }

    if ($packageId === null && $status === null) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Thiếu dữ liệu cập nhật']);
        return;
    }

    [$ok, $message] = $serviceModel->updateService($userServiceId, $packageId, $status);
    echo json_encode(['success' => $ok, 'message' => $message]);
}
