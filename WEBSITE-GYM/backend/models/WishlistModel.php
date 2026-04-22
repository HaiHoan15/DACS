<?php
// WishlistModel.php - Model xử lý dữ liệu giỏ hàng

class WishlistModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Lấy tất cả sản phẩm trong giỏ hàng của người dùng
     */
    public function getByAccountId($accountId) {
        try {
            // Query với JOIN category
            $sql = "
                SELECT 
                    w.id as wishlist_id,
                    w.quantity,
                    w.added_at,
                    p.id as product_id,
                    p.name,
                    p.description,
                    p.price,
                    p.avatar,
                    c.name as category_name,
                    p.created_at,
                    p.updated_at
                FROM wishlists w
                INNER JOIN products p ON w.product_id = p.id
                LEFT JOIN product_categories c ON p.category_id = c.id
                WHERE w.account_id = ?
                ORDER BY w.added_at DESC
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$accountId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("WishlistModel Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Thêm sản phẩm vào giỏ hàng (hoặc cập nhật số lượng nếu đã tồn tại)
     */
    public function addOrUpdate($accountId, $productId, $quantity = 1) {
        try {
            // Kiểm tra sản phẩm có tồn tại không
            if (!$this->productExists($productId)) {
                return [
                    'success' => false,
                    'message' => 'Sản phẩm không tồn tại (ID: ' . $productId . ')'
                ];
            }

            // Kiểm tra xem sản phẩm đã có trong giỏ hàng không
            $checkSql = "SELECT id, quantity FROM wishlists WHERE account_id = ? AND product_id = ?";
            $checkStmt = $this->pdo->prepare($checkSql);
            $checkStmt->execute([$accountId, $productId]);
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                // Cập nhật số lượng
                $newQuantity = $existing['quantity'] + $quantity;
                $updateSql = "UPDATE wishlists SET quantity = ?, updated_at = NOW() WHERE id = ?";
                $updateStmt = $this->pdo->prepare($updateSql);
                $updateStmt->execute([$newQuantity, $existing['id']]);

                return [
                    'success' => true,
                    'message' => 'Cập nhật số lượng thành công',
                    'wishlist_id' => $existing['id'],
                    'quantity' => $newQuantity
                ];
            } else {
                // Thêm mới
                $insertSql = "INSERT INTO wishlists (account_id, product_id, quantity) VALUES (?, ?, ?)";
                $insertStmt = $this->pdo->prepare($insertSql);
                $insertStmt->execute([$accountId, $productId, $quantity]);

                return [
                    'success' => true,
                    'message' => 'Thêm vào giỏ hàng thành công',
                    'wishlist_id' => $this->pdo->lastInsertId(),
                    'quantity' => $quantity
                ];
            }
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     */
    public function updateQuantity($wishlistId, $quantity) {
        if ($quantity < 1) {
            return $this->delete($wishlistId);
        }

        $sql = "UPDATE wishlists SET quantity = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$quantity, $wishlistId]);

        return [
            'success' => true,
            'message' => 'Cập nhật số lượng thành công',
            'quantity' => $quantity
        ];
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     */
    public function delete($wishlistId) {
        $sql = "DELETE FROM wishlists WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$wishlistId]);

        return [
            'success' => true,
            'message' => 'Xóa khỏi giỏ hàng thành công'
        ];
    }

    /**
     * Kiểm tra sản phẩm có tồn tại không
     */
    private function productExists($productId) {
        $sql = "SELECT id FROM products WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$productId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }
}
?>
