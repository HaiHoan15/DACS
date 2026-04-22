<?php
namespace Models;

class OrderModel {
    private $conn;

    public function __construct($conn = null) {
        if ($conn) {
            $this->conn = $conn;
        } else {
            // Nếu không có connection, tạo một cái mới
            require_once __DIR__ . '/../config/database.php';
            $database = new \Database();
            $this->conn = $database->connect();
        }
    }

    /**
     * Create a new order
     */
    public function createOrder($accountId, $totalAmount, $paymentMethod, $recipientName, $recipientPhone, $recipientAddress, $notes = "") {
        try {
            $conn = $this->conn;
            
            $query = "INSERT INTO orders (account_id, total_amount, payment_method, recipient_name, recipient_phone, recipient_address, notes, status, created_at) 
                      VALUES (:account_id, :total_amount, :payment_method, :recipient_name, :recipient_phone, :recipient_address, :notes, :status, NOW())";
            
            $stmt = $conn->prepare($query);
            $result = $stmt->execute([
                ':account_id' => (int)$accountId,
                ':total_amount' => (float)$totalAmount,
                ':payment_method' => $paymentMethod,
                ':recipient_name' => $recipientName,
                ':recipient_phone' => $recipientPhone,
                ':recipient_address' => $recipientAddress,
                ':notes' => $notes,
                ':status' => 'pending'
            ]);

            if ($result) {
                return $conn->lastInsertId();
            }
            return false;
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            return false;
        }
    }

    /**
     * Add items to order
     */
    public function createOrderItem($orderId, $productId, $productName, $quantity, $price, $subtotal) {
        try {
            $conn = $this->conn;
            
            $query = "INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal, created_at) 
                      VALUES (:order_id, :product_id, :product_name, :quantity, :price, :subtotal, NOW())";
            
            $stmt = $conn->prepare($query);
            return $stmt->execute([
                ':order_id' => (int)$orderId,
                ':product_id' => (int)$productId,
                ':product_name' => $productName,
                ':quantity' => (int)$quantity,
                ':price' => (float)$price,
                ':subtotal' => (float)$subtotal
            ]);
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get orders by user account
     */
    public function getByAccountId($accountId) {
        try {
            $conn = $this->conn;
            
            $query = "SELECT o.*, a.email,
                             JSON_ARRAYAGG(
                                 JSON_OBJECT(
                                     'id', oi.id,
                                     'product_id', oi.product_id,
                                     'product_name', oi.product_name,
                                     'quantity', oi.quantity,
                                     'price', oi.price,
                                     'subtotal', oi.subtotal,
                                     'created_at', oi.created_at
                                 )
                             ) as items
                      FROM orders o
                      LEFT JOIN accounts a ON o.account_id = a.id
                      LEFT JOIN order_items oi ON o.id = oi.order_id
                      WHERE o.account_id = :account_id
                      GROUP BY o.id
                      ORDER BY o.created_at DESC";
            
            $stmt = $conn->prepare($query);
            $stmt->execute([':account_id' => (int)$accountId]);
            $orders = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Parse JSON arrays back to actual arrays
            foreach ($orders as &$order) {
                if ($order['items']) {
                    $order['items'] = json_decode($order['items'], true);
                    $order['items'] = array_filter($order['items'], function($item) {
                        return $item !== null;
                    });
                } else {
                    $order['items'] = [];
                }
            }

            return $orders;
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get single order with items
     */
    public function getOrderById($orderId) {
        try {
            $conn = $this->conn;
            
            $query = "SELECT o.*, a.email,
                             JSON_ARRAYAGG(
                                 JSON_OBJECT(
                                     'id', oi.id,
                                     'product_id', oi.product_id,
                                     'product_name', oi.product_name,
                                     'quantity', oi.quantity,
                                     'price', oi.price,
                                     'subtotal', oi.subtotal
                                 )
                             ) as items
                      FROM orders o
                      LEFT JOIN accounts a ON o.account_id = a.id
                      LEFT JOIN order_items oi ON o.id = oi.order_id
                      WHERE o.id = :order_id
                      GROUP BY o.id";
            
            $stmt = $conn->prepare($query);
            $stmt->execute([':order_id' => (int)$orderId]);
            $order = $stmt->fetch(\PDO::FETCH_ASSOC);

            if ($order && $order['items']) {
                $order['items'] = json_decode($order['items'], true);
                $order['items'] = array_filter($order['items'], function($item) {
                    return $item !== null;
                });
            }

            return $order;
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            return null;
        }
    }

    /**
     * Update order status
     */
    public function updateStatus($orderId, $status) {
        try {
            $conn = $this->conn;
            
            $query = "UPDATE orders SET status = :status WHERE id = :id";
            $stmt = $conn->prepare($query);
            return $stmt->execute([
                ':id' => (int)$orderId,
                ':status' => $status
            ]);
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get all orders (for admin)
     */
    public function getAll() {
        try {
            $conn = $this->conn;
            
            $query = "SELECT o.*, a.email,
                             JSON_ARRAYAGG(
                                 JSON_OBJECT(
                                     'id', oi.id,
                                     'product_id', oi.product_id,
                                     'product_name', oi.product_name,
                                     'quantity', oi.quantity,
                                     'price', oi.price,
                                     'subtotal', oi.subtotal
                                 )
                             ) as items
                      FROM orders o
                      LEFT JOIN accounts a ON o.account_id = a.id
                      LEFT JOIN order_items oi ON o.id = oi.order_id
                      GROUP BY o.id
                      ORDER BY o.created_at DESC";
            
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $orders = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Parse JSON arrays back to actual arrays
            foreach ($orders as &$order) {
                if ($order['items']) {
                    $order['items'] = json_decode($order['items'], true);
                    $order['items'] = array_filter($order['items'], function($item) {
                        return $item !== null;
                    });
                } else {
                    $order['items'] = [];
                }
            }

            return $orders;
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            return [];
        }
    }

    /**
     * Delete order and its items
     */
    public function delete($orderId) {
        try {
            $conn = $this->conn;
            
            // Start transaction
            $conn->beginTransaction();
            
            // Delete order items first
            $query = "DELETE FROM order_items WHERE order_id = :order_id";
            $stmt = $conn->prepare($query);
            $stmt->execute([':order_id' => (int)$orderId]);
            
            // Delete order
            $query = "DELETE FROM orders WHERE id = :id";
            $stmt = $conn->prepare($query);
            $result = $stmt->execute([':id' => (int)$orderId]);
            
            // Commit transaction
            $conn->commit();
            
            return $result;
        } catch (\Exception $e) {
            $conn->rollBack();
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            return false;
        }
    }
}
