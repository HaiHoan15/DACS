<?php

require_once(__DIR__ . '/../config/cors.php');
require_once(__DIR__ . '/../config/database.php');
require_once(__DIR__ . '/../models/RoomModel.php');

enableCORS();

class RoomController {
    private $roomModel;
    private $conn;
    private $uploadDir = 'D:/HocDaiHoc/CNTT/NAM 5/DACS/demo/WEBSITE-GYM/frontend/public/uploads/rooms/';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
        $this->roomModel = new RoomModel($database);

        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function handleRequest() {
        $action = $_POST['action'] ?? $_GET['action'] ?? null;
        if (!$action) {
            $input = getJsonInput();
            $action = $input['action'] ?? null;
        }

        switch ($action) {
            case 'getAll':
                return $this->getAll();
            case 'getById':
                return $this->getById();
            case 'add':
                return $this->add();
            case 'update':
                return $this->update();
            case 'delete':
                return $this->delete();
            case 'uploadImage':
                return $this->uploadImage();
            default:
                sendJsonResponse(['success' => false, 'message' => 'Action not found'], 404);
        }
    }

    private function assertAuthorized() {
        $authHeader = getallheaders()['Authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\\s+(.+)/', $authHeader)) {
            sendJsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }
    }

    private function normalizeEquipments($equipments) {
        if (!is_array($equipments)) {
            return [];
        }

        $normalized = [];
        foreach ($equipments as $equipment) {
            $itemId = isset($equipment['itemId']) ? (int)$equipment['itemId'] : 0;
            $quantity = isset($equipment['quantity']) ? (int)$equipment['quantity'] : 0;
            if (!$itemId) {
                continue;
            }
            if (!isset($normalized[$itemId])) {
                $normalized[$itemId] = 0;
            }
            $normalized[$itemId] += $quantity;
        }

        $result = [];
        foreach ($normalized as $itemId => $quantity) {
            if ($quantity > 0) {
                $result[] = ['itemId' => $itemId, 'quantity' => $quantity];
            }
        }
        return $result;
    }

    private function validateEquipments($equipments, $excludeRoomId = null) {
        foreach ($equipments as $equipment) {
            $itemId = (int)$equipment['itemId'];
            $quantity = (int)$equipment['quantity'];

            if ($quantity < 0) {
                return [false, 'Số lượng dụng cụ không được âm'];
            }

            $item = $this->roomModel->getWarehouseItem($itemId);
            if (!$item) {
                return [false, 'Có dụng cụ trong danh sách không tồn tại trong kho'];
            }

            $allocatedOtherRooms = $this->roomModel->getAllocatedForItem($itemId, $excludeRoomId);
            $availableForThisRoom = (int)$item['quantity'] - $allocatedOtherRooms;
            if ($quantity > $availableForThisRoom) {
                return [false, 'Dụng cụ "' . $item['name'] . '" chỉ còn ' . max(0, $availableForThisRoom) . ' trong kho'];
            }
        }

        return [true, null];
    }

    private function getAll() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();

        try {
            $rooms = $this->roomModel->getAll();
            $roomIds = array_column($rooms, 'id');
            $equipmentMap = $this->roomModel->getEquipmentsByRoomIds($roomIds);
            foreach ($rooms as &$room) {
                $room['equipments'] = $equipmentMap[$room['id']] ?? [];
            }
            sendJsonResponse(['success' => true, 'rooms' => $rooms], 200);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi khi lấy danh sách phòng: ' . $e->getMessage()], 500);
        }
    }

    private function getById() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();
        $roomId = $_GET['roomId'] ?? null;
        if (!$roomId) {
            sendJsonResponse(['success' => false, 'message' => 'Room ID không được để trống'], 400);
        }

        try {
            $room = $this->roomModel->getById($roomId);
            if (!$room) {
                sendJsonResponse(['success' => false, 'message' => 'Không tìm thấy phòng'], 404);
            }
            $room['equipments'] = $this->roomModel->getEquipments($roomId);
            sendJsonResponse(['success' => true, 'room' => $room], 200);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi khi lấy chi tiết phòng: ' . $e->getMessage()], 500);
        }
    }

    private function add() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();
        $input = getJsonInput();
        $name = trim((string)($input['name'] ?? ''));
        $description = trim((string)($input['description'] ?? ''));
        $avatar = trim((string)($input['avatar'] ?? ''));
        $equipments = $this->normalizeEquipments($input['equipments'] ?? []);

        if (!$name) {
            sendJsonResponse(['success' => false, 'message' => 'Tên phòng không được để trống'], 400);
        }

        if (strlen($name) > 255) {
            sendJsonResponse(['success' => false, 'message' => 'Tên phòng không được vượt quá 255 ký tự'], 400);
        }

        [$isValid, $message] = $this->validateEquipments($equipments);
        if (!$isValid) {
            sendJsonResponse(['success' => false, 'message' => $message], 400);
        }

        try {
            $roomId = $this->roomModel->createWithEquipments($name, $description, $avatar, $equipments);
            sendJsonResponse(['success' => true, 'message' => 'Thêm phòng tập thành công', 'roomId' => $roomId], 201);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    private function update() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();
        $input = getJsonInput();
        $roomId = isset($input['roomId']) ? (int)$input['roomId'] : 0;
        $name = trim((string)($input['name'] ?? ''));
        $description = trim((string)($input['description'] ?? ''));
        $avatar = trim((string)($input['avatar'] ?? ''));
        $equipments = $this->normalizeEquipments($input['equipments'] ?? []);

        if (!$roomId) {
            sendJsonResponse(['success' => false, 'message' => 'Room ID không được để trống'], 400);
        }

        if (!$this->roomModel->exists($roomId)) {
            sendJsonResponse(['success' => false, 'message' => 'Phòng không tồn tại'], 404);
        }

        if (!$name) {
            sendJsonResponse(['success' => false, 'message' => 'Tên phòng không được để trống'], 400);
        }

        [$isValid, $message] = $this->validateEquipments($equipments, $roomId);
        if (!$isValid) {
            sendJsonResponse(['success' => false, 'message' => $message], 400);
        }

        try {
            $currentRoom = $this->roomModel->getById($roomId);
            if ($currentRoom && $currentRoom['avatar'] && $currentRoom['avatar'] !== $avatar) {
                $this->deleteOldAvatar($roomId);
            }
            $this->roomModel->updateWithEquipments($roomId, $name, $description, $avatar, $equipments);
            sendJsonResponse(['success' => true, 'message' => 'Cập nhật phòng tập thành công'], 200);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    private function delete() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();
        $input = getJsonInput();
        $roomId = isset($input['roomId']) ? (int)$input['roomId'] : 0;

        if (!$roomId) {
            sendJsonResponse(['success' => false, 'message' => 'Room ID không được để trống'], 400);
        }

        if (!$this->roomModel->exists($roomId)) {
            sendJsonResponse(['success' => false, 'message' => 'Phòng không tồn tại'], 404);
        }

        try {
            if ($this->roomModel->delete($roomId)) {
                sendJsonResponse(['success' => true, 'message' => 'Xóa phòng tập thành công'], 200);
            }
            sendJsonResponse(['success' => false, 'message' => 'Lỗi khi xóa phòng tập'], 400);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    private function uploadImage() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();

        if (!isset($_FILES['image'])) {
            sendJsonResponse(['success' => false, 'message' => 'No file uploaded'], 400);
        }

        $file = $_FILES['image'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            sendJsonResponse(['success' => false, 'message' => 'File upload error'], 400);
        }

        if ($file['size'] > 5 * 1024 * 1024) {
            sendJsonResponse(['success' => false, 'message' => 'File size exceeds 5MB'], 400);
        }

        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedMimes, true)) {
            sendJsonResponse(['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, GIF, WebP allowed'], 400);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'room_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $filePath = $this->uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            sendJsonResponse(['success' => false, 'message' => 'Failed to save file'], 500);
        }

        sendJsonResponse(['success' => true, 'message' => 'Image uploaded successfully', 'filename' => $filename, 'imageUrl' => '/uploads/rooms/' . $filename], 200);
    }

    private function deleteOldAvatar($roomId) {
        $query = "SELECT avatar FROM rooms WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $roomId, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result && $result['avatar']) {
            $oldFile = $this->uploadDir . $result['avatar'];
            if (file_exists($oldFile)) {
                unlink($oldFile);
            }
        }
    }
}

$controller = new RoomController();
$controller->handleRequest();
