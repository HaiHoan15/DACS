<?php

require_once(__DIR__ . '/../config/cors.php');
require_once(__DIR__ . '/../config/database.php');
require_once(__DIR__ . '/../models/WarehouseModel.php');

enableCORS();

class WarehouseController {
    private $warehouseModel;
    private $conn;
    private $uploadDir = 'D:/HocDaiHoc/CNTT/NAM 5/DACS/demo/WEBSITE-GYM/frontend/public/uploads/warehouse/';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
        $this->warehouseModel = new WarehouseModel($database);

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
            case 'getDistribution':
                return $this->getDistribution();
            case 'add':
                return $this->add();
            case 'update':
                return $this->update();
            case 'updateQuantity':
                return $this->updateQuantity();
            case 'updateDistribution':
                return $this->updateDistribution();
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

    private function getAll() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();

        try {
            $items = $this->warehouseModel->getAll();
            sendJsonResponse(['success' => true, 'items' => $items], 200);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi khi lấy danh sách kho: ' . $e->getMessage()], 500);
        }
    }

    private function getById() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();

        $itemId = $_GET['itemId'] ?? null;
        if (!$itemId) {
            sendJsonResponse(['success' => false, 'message' => 'Item ID không được để trống'], 400);
        }

        try {
            $item = $this->warehouseModel->getById($itemId);
            if (!$item) {
                sendJsonResponse(['success' => false, 'message' => 'Không tìm thấy dụng cụ'], 404);
            }
            sendJsonResponse(['success' => true, 'item' => $item], 200);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi khi lấy chi tiết dụng cụ: ' . $e->getMessage()], 500);
        }
    }

    private function add() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();

        $input = getJsonInput();
        $name = $input['name'] ?? null;
        $description = $input['description'] ?? '';
        $quantity = isset($input['quantity']) ? (int)$input['quantity'] : 0;
        $avatar = $input['avatar'] ?? '';

        if (!$name) {
            sendJsonResponse(['success' => false, 'message' => 'Tên dụng cụ không được để trống'], 400);
        }

        if (strlen($name) > 255) {
            sendJsonResponse(['success' => false, 'message' => 'Tên dụng cụ không được vượt quá 255 ký tự'], 400);
        }

        if ($quantity < 0) {
            sendJsonResponse(['success' => false, 'message' => 'Số lượng không được âm'], 400);
        }

        try {
            $itemId = $this->warehouseModel->add($name, $description, $quantity, $avatar);
            if ($itemId) {
                sendJsonResponse(['success' => true, 'message' => 'Thêm dụng cụ thành công', 'itemId' => $itemId], 201);
            }
            sendJsonResponse(['success' => false, 'message' => 'Lỗi khi thêm dụng cụ'], 400);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    private function getDistribution() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();
        $itemId = $_GET['itemId'] ?? null;

        if (!$itemId) {
            sendJsonResponse(['success' => false, 'message' => 'Item ID không được để trống'], 400);
        }

        try {
            $item = $this->warehouseModel->getById($itemId);
            if (!$item) {
                sendJsonResponse(['success' => false, 'message' => 'Không tìm thấy dụng cụ'], 404);
            }
            $allocations = $this->warehouseModel->getRoomAllocations($itemId);
            sendJsonResponse(['success' => true, 'item' => $item, 'roomAllocations' => $allocations], 200);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi khi lấy phân bổ dụng cụ: ' . $e->getMessage()], 500);
        }
    }

    private function update() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();

        $input = getJsonInput();
        $itemId = $input['itemId'] ?? null;
        $name = $input['name'] ?? null;
        $description = $input['description'] ?? '';
        $quantity = isset($input['quantity']) ? (int)$input['quantity'] : 0;
        $avatar = $input['avatar'] ?? '';

        if (!$itemId) {
            sendJsonResponse(['success' => false, 'message' => 'Item ID không được để trống'], 400);
        }

        if (!$name) {
            sendJsonResponse(['success' => false, 'message' => 'Tên dụng cụ không được để trống'], 400);
        }

        if (strlen($name) > 255) {
            sendJsonResponse(['success' => false, 'message' => 'Tên dụng cụ không được vượt quá 255 ký tự'], 400);
        }

        if ($quantity < 0) {
            sendJsonResponse(['success' => false, 'message' => 'Số lượng không được âm'], 400);
        }

        if (!$this->warehouseModel->exists($itemId)) {
            sendJsonResponse(['success' => false, 'message' => 'Dụng cụ không tồn tại'], 404);
        }

        $item = $this->warehouseModel->getById($itemId);
        if ($item && $item['avatar'] && $item['avatar'] !== $avatar) {
            $this->deleteOldAvatar($itemId);
        }

        try {
            if ($this->warehouseModel->update($itemId, $name, $description, $quantity, $avatar)) {
                sendJsonResponse(['success' => true, 'message' => 'Cập nhật dụng cụ thành công'], 200);
            }
            sendJsonResponse(['success' => false, 'message' => 'Lỗi khi cập nhật dụng cụ'], 400);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    private function updateQuantity() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();

        $input = getJsonInput();
        $itemId = isset($input['itemId']) ? (int)$input['itemId'] : 0;
        $quantity = isset($input['quantity']) ? (int)$input['quantity'] : -1;

        if (!$itemId) {
            sendJsonResponse(['success' => false, 'message' => 'Item ID không được để trống'], 400);
        }

        if ($quantity < 0) {
            sendJsonResponse(['success' => false, 'message' => 'Số lượng không được âm'], 400);
        }

        if (!$this->warehouseModel->exists($itemId)) {
            sendJsonResponse(['success' => false, 'message' => 'Dụng cụ không tồn tại'], 404);
        }

        try {
            if ($this->warehouseModel->updateQuantity($itemId, $quantity)) {
                sendJsonResponse(['success' => true, 'message' => 'Cập nhật số lượng thành công'], 200);
            }
            sendJsonResponse(['success' => false, 'message' => 'Lỗi khi cập nhật số lượng'], 400);
        } catch (Exception $e) {
            sendJsonResponse(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    private function updateDistribution() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $this->assertAuthorized();
        $input = getJsonInput();
        $itemId = isset($input['itemId']) ? (int)$input['itemId'] : 0;
        $totalQuantity = isset($input['totalQuantity']) ? (int)$input['totalQuantity'] : -1;
        $roomAllocations = is_array($input['roomAllocations'] ?? null) ? $input['roomAllocations'] : [];

        if (!$itemId) {
            sendJsonResponse(['success' => false, 'message' => 'Item ID không được để trống'], 400);
        }
        if ($totalQuantity < 0) {
            sendJsonResponse(['success' => false, 'message' => 'Tổng số lượng không được âm'], 400);
        }
        if (!$this->warehouseModel->exists($itemId)) {
            sendJsonResponse(['success' => false, 'message' => 'Dụng cụ không tồn tại'], 404);
        }

        $sumAllocated = 0;
        foreach ($roomAllocations as $allocation) {
            $quantity = isset($allocation['quantity']) ? (int)$allocation['quantity'] : 0;
            if ($quantity < 0) {
                sendJsonResponse(['success' => false, 'message' => 'Số lượng trong phòng không được âm'], 400);
            }
            $sumAllocated += $quantity;
        }

        if ($sumAllocated > $totalQuantity) {
            sendJsonResponse(['success' => false, 'message' => 'Tổng số lượng trong các phòng vượt quá số lượng trong kho'], 400);
        }

        try {
            $this->warehouseModel->updateDistribution($itemId, $totalQuantity, $roomAllocations);
            sendJsonResponse(['success' => true, 'message' => 'Đã cập nhật số lượng và phân bổ phòng'], 200);
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
        $itemId = $input['itemId'] ?? null;

        if (!$itemId) {
            sendJsonResponse(['success' => false, 'message' => 'Item ID không được để trống'], 400);
        }

        if (!$this->warehouseModel->exists($itemId)) {
            sendJsonResponse(['success' => false, 'message' => 'Dụng cụ không tồn tại'], 404);
        }

        $allocations = $this->warehouseModel->getRoomAllocations($itemId);
        if (!empty($allocations)) {
            sendJsonResponse([
                'success' => false,
                'code' => 'ITEM_IN_ROOMS',
                'message' => 'Hiện tại đang có phòng chứa dụng cụ này, bạn phải xóa nó khỏi phòng trước khi xóa khỏi kho',
                'rooms' => $allocations,
            ], 409);
        }

        $item = $this->warehouseModel->getById($itemId);

        try {
            if ($this->warehouseModel->delete($itemId)) {
                if ($item && !empty($item['avatar'])) {
                    $oldFile = $this->uploadDir . $item['avatar'];
                    if (file_exists($oldFile)) {
                        unlink($oldFile);
                    }
                }
                sendJsonResponse(['success' => true, 'message' => 'Xóa dụng cụ thành công'], 200);
            }
            sendJsonResponse(['success' => false, 'message' => 'Lỗi khi xóa dụng cụ'], 400);
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

        $maxSize = 5 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
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
        $filename = 'warehouse_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $filePath = $this->uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            sendJsonResponse(['success' => false, 'message' => 'Failed to save file'], 500);
        }

        sendJsonResponse([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'filename' => $filename,
            'imageUrl' => '/uploads/warehouse/' . $filename
        ], 200);
    }

    private function deleteOldAvatar($itemId) {
        $query = "SELECT avatar FROM warehouse_items WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $itemId, PDO::PARAM_INT);
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

$controller = new WarehouseController();
$controller->handleRequest();
