<?php

require_once(__DIR__ . '/../config/cors.php');
require_once(__DIR__ . '/../config/database.php');
require_once(__DIR__ . '/../models/ProductModel.php');

enableCORS();

class ProductController {
    private $productModel;
    private $conn;
    private $uploadDir = 'D:/HocDaiHoc/CNTT/NAM 5/DACS/demo/WEBSITE-GYM/frontend/public/uploads/products/';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
        $this->productModel = new ProductModel($database);
        
        // Tạo folder products nếu không tồn tại
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    // Router chính - xử lý các action
    public function handleRequest() {
        // Lấy action từ $_POST, $_GET, hoặc JSON body
        $action = $_POST['action'] ?? $_GET['action'] ?? null;
        
        // Nếu không tìm thấy, kiểm tra trong JSON body
        if (!$action) {
            $input = getJsonInput();
            $action = $input['action'] ?? null;
        }

        switch ($action) {
            case 'getAll':
                return $this->getAll();
            case 'getById':
                return $this->getById();
            case 'getByCategoryId':
                return $this->getByCategoryId();
            case 'add':
                return $this->add();
            case 'update':
                return $this->update();
            case 'delete':
                return $this->delete();
            case 'uploadImage':
                return $this->uploadProductImage();
            default:
                sendJsonResponse(['success' => false, 'message' => 'Action not found'], 404);
        }
    }

    /**
     * ==============================================
     * GET ALL PRODUCTS
     * ==============================================
     */
    private function getAll() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        // Kiểm tra authorization header
        $authHeader = getallheaders()['Authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\s+(.+)/', $authHeader)) {
            sendJsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $products = $this->productModel->getAll();
            
            sendJsonResponse([
                'success' => true,
                'products' => $products
            ], 200);
        } catch (Exception $e) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách sản phẩm: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ==============================================
     * GET PRODUCT BY ID
     * ==============================================
     */
    private function getById() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        // Kiểm tra authorization header
        $authHeader = getallheaders()['Authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\s+(.+)/', $authHeader)) {
            sendJsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $productId = $_GET['productId'] ?? null;
        if (!$productId) {
            sendJsonResponse(['success' => false, 'message' => 'Product ID not provided'], 400);
        }

        try {
            $product = $this->productModel->getById($productId);
            
            if (!$product) {
                sendJsonResponse(['success' => false, 'message' => 'Product not found'], 404);
            }

            sendJsonResponse([
                'success' => true,
                'product' => $product
            ], 200);
        } catch (Exception $e) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Lỗi khi lấy sản phẩm: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ==============================================
     * GET PRODUCTS BY CATEGORY ID
     * ==============================================
     */
    private function getByCategoryId() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        // Kiểm tra authorization header
        $authHeader = getallheaders()['Authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\s+(.+)/', $authHeader)) {
            sendJsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $categoryId = $_GET['categoryId'] ?? null;
        if (!$categoryId) {
            sendJsonResponse(['success' => false, 'message' => 'Category ID not provided'], 400);
        }

        try {
            $products = $this->productModel->getByCategoryId($categoryId);
            
            sendJsonResponse([
                'success' => true,
                'products' => $products
            ], 200);
        } catch (Exception $e) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Lỗi khi lấy sản phẩm: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ==============================================
     * ADD PRODUCT
     * ==============================================
     */
    private function add() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        // Kiểm tra authorization header
        $authHeader = getallheaders()['Authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\s+(.+)/', $authHeader)) {
            sendJsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // Lấy dữ liệu từ JSON body
        $input = getJsonInput();
        $name = $input['name'] ?? null;
        $description = $input['description'] ?? '';
        $price = $input['price'] ?? 0;
        $avatar = $input['avatar'] ?? '';
        $categoryId = $input['categoryId'] ?? null;

        // Validation
        if (!$name) {
            sendJsonResponse(['success' => false, 'message' => 'Tên sản phẩm không được để trống'], 400);
        }

        if (strlen($name) > 255) {
            sendJsonResponse(['success' => false, 'message' => 'Tên sản phẩm không được vượt quá 255 ký tự'], 400);
        }

        if ($price < 0) {
            sendJsonResponse(['success' => false, 'message' => 'Giá sản phẩm không được âm'], 400);
        }

        if (!$categoryId) {
            sendJsonResponse(['success' => false, 'message' => 'Danh mục sản phẩm là bắt buộc'], 400);
        }

        try {
            $productId = $this->productModel->add($name, $description, $price, $avatar, $categoryId);
            if ($productId) {
                sendJsonResponse([
                    'success' => true,
                    'message' => 'Thêm sản phẩm thành công',
                    'productId' => $productId
                ], 201);
            } else {
                sendJsonResponse([
                    'success' => false,
                    'message' => 'Lỗi khi thêm sản phẩm'
                ], 400);
            }
        } catch (Exception $e) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ==============================================
     * UPDATE PRODUCT
     * ==============================================
     */
    private function update() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        // Kiểm tra authorization header
        $authHeader = getallheaders()['Authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\s+(.+)/', $authHeader)) {
            sendJsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // Lấy dữ liệu từ JSON body
        $input = getJsonInput();
        $productId = $input['productId'] ?? null;
        $name = $input['name'] ?? null;
        $description = $input['description'] ?? '';
        $price = $input['price'] ?? 0;
        $avatar = $input['avatar'] ?? '';
        $categoryId = $input['categoryId'] ?? null;

        // Validation
        if (!$productId) {
            sendJsonResponse(['success' => false, 'message' => 'Product ID không được để trống'], 400);
        }

        if (!$name) {
            sendJsonResponse(['success' => false, 'message' => 'Tên sản phẩm không được để trống'], 400);
        }

        if (strlen($name) > 255) {
            sendJsonResponse(['success' => false, 'message' => 'Tên sản phẩm không được vượt quá 255 ký tự'], 400);
        }

        if ($price < 0) {
            sendJsonResponse(['success' => false, 'message' => 'Giá sản phẩm không được âm'], 400);
        }

        if (!$categoryId) {
            sendJsonResponse(['success' => false, 'message' => 'Danh mục sản phẩm là bắt buộc'], 400);
        }

        // Kiểm tra sản phẩm có tồn tại không
        if (!$this->productModel->exists($productId)) {
            sendJsonResponse(['success' => false, 'message' => 'Sản phẩm không tồn tại'], 404);
        }

        try {
            if ($this->productModel->update($productId, $name, $description, $price, $avatar, $categoryId)) {
                sendJsonResponse([
                    'success' => true,
                    'message' => 'Cập nhật sản phẩm thành công'
                ], 200);
            } else {
                sendJsonResponse([
                    'success' => false,
                    'message' => 'Lỗi khi cập nhật sản phẩm'
                ], 400);
            }
        } catch (Exception $e) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ==============================================
     * DELETE PRODUCT
     * ==============================================
     */
    private function delete() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        // Kiểm tra authorization header
        $authHeader = getallheaders()['Authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\s+(.+)/', $authHeader)) {
            sendJsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // Lấy dữ liệu từ JSON body
        $input = getJsonInput();
        $productId = $input['productId'] ?? null;

        // Validation
        if (!$productId) {
            sendJsonResponse(['success' => false, 'message' => 'Product ID không được để trống'], 400);
        }

        // Kiểm tra sản phẩm có tồn tại không
        if (!$this->productModel->exists($productId)) {
            sendJsonResponse(['success' => false, 'message' => 'Sản phẩm không tồn tại'], 404);
        }

        try {
            if ($this->productModel->delete($productId)) {
                sendJsonResponse([
                    'success' => true,
                    'message' => 'Xóa sản phẩm thành công'
                ], 200);
            } else {
                sendJsonResponse([
                    'success' => false,
                    'message' => 'Lỗi khi xóa sản phẩm'
                ], 400);
            }
        } catch (Exception $e) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ==============================================
     * UPLOAD PRODUCT IMAGE
     * ==============================================
     */
    private function uploadProductImage() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        // Kiểm tra authorization header
        $authHeader = getallheaders()['Authorization'] ?? null;
        if (!$authHeader || !preg_match('/Bearer\s+(.+)/', $authHeader)) {
            sendJsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // Kiểm tra file upload
        if (!isset($_FILES['image'])) {
            sendJsonResponse(['success' => false, 'message' => 'No file uploaded'], 400);
        }

        $file = $_FILES['image'];

        // Kiểm tra lỗi upload
        if ($file['error'] !== UPLOAD_ERR_OK) {
            sendJsonResponse(['success' => false, 'message' => 'File upload error'], 400);
        }

        // Kiểm tra kích thước file (max 5MB)
        $maxSize = 5 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            sendJsonResponse(['success' => false, 'message' => 'File size exceeds 5MB'], 400);
        }

        // Kiểm tra loại file
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedMimes)) {
            sendJsonResponse(['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, GIF, WebP allowed'], 400);
        }

        // Tạo filename duy nhất
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'product_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $filePath = $this->uploadDir . $filename;

        // Move file
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            sendJsonResponse(['success' => false, 'message' => 'Failed to save file'], 500);
        }

        // Return uploaded file info
        sendJsonResponse([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'filename' => $filename,
            'imageUrl' => '/uploads/products/' . $filename
        ], 200);
    }
}

// Handle request
$controller = new ProductController();
$controller->handleRequest();
