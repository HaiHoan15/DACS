<?php

require_once(__DIR__ . '/../config/cors.php');
require_once(__DIR__ . '/../config/database.php');
require_once(__DIR__ . '/../models/CategoryModel.php');
require_once(__DIR__ . '/../models/ProductModel.php');

enableCORS();

class CategoryController {
    private $categoryModel;
    private $productModel;
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
        $this->categoryModel = new CategoryModel($this->conn);
        $this->productModel = new ProductModel($database);
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
            case 'add':
                return $this->add();
            case 'update':
                return $this->update();
            case 'delete':
                return $this->delete();
            default:
                sendJsonResponse(['success' => false, 'message' => 'Action not found'], 404);
        }
    }

    /**
     * ==============================================
     * GET ALL CATEGORIES
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
            $categories = $this->categoryModel->getAll();
            
            sendJsonResponse([
                'success' => true,
                'categories' => $categories
            ], 200);
        } catch (Exception $e) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách danh mục: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ==============================================
     * GET CATEGORY BY ID
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

        $categoryId = $_GET['categoryId'] ?? null;
        if (!$categoryId) {
            sendJsonResponse(['success' => false, 'message' => 'Category ID not provided'], 400);
        }

        try {
            $category = $this->categoryModel->getById($categoryId);
            
            if (!$category) {
                sendJsonResponse(['success' => false, 'message' => 'Category not found'], 404);
            }

            sendJsonResponse([
                'success' => true,
                'category' => $category
            ], 200);
        } catch (Exception $e) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Lỗi khi lấy danh mục: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ==============================================
     * ADD CATEGORY
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

        // Validate
        if (!$name) {
            sendJsonResponse(['success' => false, 'message' => 'Tên danh mục không được để trống'], 400);
        }

        if (strlen($name) > 50) {
            sendJsonResponse(['success' => false, 'message' => 'Tên danh mục không được vượt quá 50 ký tự'], 400);
        }

        // Kiểm tra tên danh mục đã tồn tại không
        if ($this->categoryModel->nameExists($name)) {
            sendJsonResponse(['success' => false, 'message' => 'Tên danh mục đã tồn tại, vui lòng chọn tên khác'], 400);
        }

        try {
            if ($this->categoryModel->add($name)) {
                sendJsonResponse([
                    'success' => true,
                    'message' => 'Thêm danh mục thành công'
                ], 201);
            } else {
                sendJsonResponse([
                    'success' => false,
                    'message' => 'Lỗi khi thêm danh mục'
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
     * UPDATE CATEGORY
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
        $categoryId = $input['categoryId'] ?? null;
        $name = $input['name'] ?? null;

        // Validate
        if (!$categoryId) {
            sendJsonResponse(['success' => false, 'message' => 'Category ID không được để trống'], 400);
        }

        if (!$name) {
            sendJsonResponse(['success' => false, 'message' => 'Tên danh mục không được để trống'], 400);
        }

        if (strlen($name) > 50) {
            sendJsonResponse(['success' => false, 'message' => 'Tên danh mục không được vượt quá 50 ký tự'], 400);
        }

        // Kiểm tra danh mục có tồn tại không
        if (!$this->categoryModel->exists($categoryId)) {
            sendJsonResponse(['success' => false, 'message' => 'Danh mục không tồn tại'], 404);
        }

        // Kiểm tra tên danh mục đã tồn tại không (bỏ qua danh mục hiện tại)
        if ($this->categoryModel->nameExists($name, $categoryId)) {
            sendJsonResponse(['success' => false, 'message' => 'Tên danh mục đã tồn tại, vui lòng chọn tên khác'], 400);
        }

        try {
            if ($this->categoryModel->update($categoryId, $name)) {
                sendJsonResponse([
                    'success' => true,
                    'message' => 'Cập nhật danh mục thành công'
                ], 200);
            } else {
                sendJsonResponse([
                    'success' => false,
                    'message' => 'Lỗi khi cập nhật danh mục'
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
     * DELETE CATEGORY
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
        $categoryId = $input['categoryId'] ?? null;

        // Validate
        if (!$categoryId) {
            sendJsonResponse(['success' => false, 'message' => 'Category ID không được để trống'], 400);
        }

        // Kiểm tra danh mục có tồn tại không
        if (!$this->categoryModel->exists($categoryId)) {
            sendJsonResponse(['success' => false, 'message' => 'Danh mục không tồn tại'], 404);
        }

        // Kiểm tra có sản phẩm trong danh mục không
        $productCount = $this->productModel->countByCategoryId($categoryId);
        if ($productCount > 0) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Không thể xóa danh mục vì vẫn còn ' . $productCount . ' sản phẩm trong danh mục này'
            ], 400);
        }

        try {
            if ($this->categoryModel->delete($categoryId)) {
                sendJsonResponse([
                    'success' => true,
                    'message' => 'Xóa danh mục thành công'
                ], 200);
            } else {
                sendJsonResponse([
                    'success' => false,
                    'message' => 'Lỗi khi xóa danh mục'
                ], 400);
            }
        } catch (Exception $e) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }
}

// Handle request
$controller = new CategoryController();
$controller->handleRequest();
