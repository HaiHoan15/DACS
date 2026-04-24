<?php

require_once(__DIR__ . '/../config/cors.php');
require_once(__DIR__ . '/../config/database.php');
require_once(__DIR__ . '/../models/MemberConfirmationModel.php');

enableCORS();

class MemberConfirmationController {
    private $model;

    public function __construct() {
        $database = new Database();
        $this->model = new MemberConfirmationModel($database);
    }

    public function handleRequest() {
        $action = $_POST['action'] ?? $_GET['action'] ?? null;
        if (!$action) {
            $input = getJsonInput();
            $action = $input['action'] ?? null;
        }

        switch ($action) {
            case 'confirm':
                return $this->confirm();
            case 'getUserActivity':
                return $this->getUserActivity();
            default:
                sendJsonResponse(['success' => false, 'message' => 'Action not found'], 404);
        }
    }

    private function assertAuthorized() {
        $authHeader = getallheaders()['Authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\s+(.+)/', $authHeader)) {
            sendJsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }
    }

    private function confirm() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();
        $input = getJsonInput();

        $code = trim((string)($input['confirmationCode'] ?? ''));
        $roomName = trim((string)($input['roomName'] ?? ''));
        $roomId = isset($input['roomId']) ? (int)$input['roomId'] : 0;
        $userId = isset($input['userId']) ? (int)$input['userId'] : 0;
        $username = trim((string)($input['username'] ?? ''));
        $email = trim((string)($input['email'] ?? ''));
        $adminId = isset($input['adminId']) ? (int)$input['adminId'] : 0;

        if ($code === '') {
            sendJsonResponse(['success' => false, 'message' => 'Mã xác nhận không hợp lệ'], 400);
        }

        if ($this->model->existsByCode($code)) {
            sendJsonResponse(['success' => false, 'message' => 'Mã này đã được xác nhận trước đó'], 409);
        }

        try {
            $id = $this->model->createConfirmation([
                'user_id' => $userId,
                'username' => $username,
                'email' => $email,
                'room_id' => $roomId,
                'room_name' => $roomName,
                'confirmation_code' => $code,
                'confirmed_by_admin_id' => $adminId,
            ]);

            sendJsonResponse([
                'success' => true,
                'message' => 'Xác nhận thành viên thành công',
                'confirmationId' => $id,
            ], 200);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    private function getUserActivity() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();

        try {
            $users = $this->model->getUserActivitySummary();
            sendJsonResponse(['success' => true, 'users' => $users], 200);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}

$controller = new MemberConfirmationController();
$controller->handleRequest();
