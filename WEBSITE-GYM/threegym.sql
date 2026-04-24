-- --------------------------------------------------------
-- Máy chủ:                      127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Phiên bản:           12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for threegym
CREATE DATABASE IF NOT EXISTS `threegym` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `threegym`;

-- Dumping structure for table threegym.accounts
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','user','teacher') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.accounts: ~3 rows (approximately)
INSERT INTO `accounts` (`id`, `username`, `email`, `password`, `avatar`, `address`, `phone`, `role`, `created_at`) VALUES
	(1, 'admin01', 'admin@threegym.com', '$2y$10$Azq/j3Y/WzNhR6Hd.5s2Ve17zLmbbEa8th4tTJ5M9Nghc9IsD3vPq', 'avatar_1_1774558046.png', 'ADMINgg', '342423', 'admin', '2026-03-16 07:44:23'),
	(2, 'user01', 'user@threegym.com', '$2y$10$zDqHCmi3D8v1dlsnglvQ.eyj.jxTAkE5av3bCNjQ6cbnkmcvPyKEq', 'avatar_2_1774591322.gif', 'gggg', '6969696969', 'user', '2026-03-16 07:44:23'),
	(4, '0448_Nguyễn Hải Hoàng', 'haihoang15122002@gmail.com', '$2y$10$x4ZjIEqhoiHWr8.eGZUjO.7QNnuoE1YKjdx9PwOvOFe7pnMwMMH76', NULL, '', '', 'user', '2026-03-21 07:02:13'),
	(5, 'HaiHoan15', 'haihoantamquoc@gmail.com', '$2y$10$DaIWa6VZV1gZ5xGtRZoXneFuwanhafy8T9iHO02sCsM0sf9dD8yLW', 'avatar_5_1774414858.gif', 'srgefwe', '53323423', 'user', '2026-03-24 13:59:39');

-- Dumping structure for table threegym.member_confirmations
CREATE TABLE IF NOT EXISTS `member_confirmations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  `room_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmation_code` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `confirmed_by_admin_id` int DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_confirmation_code` (`confirmation_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_confirmed_at` (`confirmed_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.member_confirmations: ~0 rows (approximately)
INSERT INTO `member_confirmations` (`id`, `user_id`, `username`, `email`, `room_id`, `room_name`, `confirmation_code`, `confirmed_by_admin_id`, `confirmed_at`) VALUES
	(1, 2, 'user01', 'user@threegym.com', 1, 'Phòng Cardio', 'MEM-1-883059-3972', 1, '2026-04-24 04:28:33');

-- Dumping structure for table threegym.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('pending','confirmed','shipped','delivered','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_address` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_account_id` (`account_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_created_at` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.orders: ~13 rows (approximately)
INSERT INTO `orders` (`id`, `account_id`, `total_amount`, `status`, `payment_method`, `recipient_name`, `recipient_phone`, `recipient_address`, `notes`, `created_at`, `updated_at`) VALUES
	(2, 2, 150000.00, 'shipped', 'direct', 'user01', '6969696969', 'gggg', '', '2026-04-22 03:40:52', '2026-04-22 04:00:53'),
	(3, 2, 2800000.00, 'cancelled', 'direct', 'user01', '6969696969', 'gggg', '', '2026-04-22 03:44:03', '2026-04-22 04:02:17'),
	(15, 2, 11900000.00, 'pending', 'direct', 'user01', '6969696969', 'gggg', '', '2026-04-22 04:57:55', '2026-04-22 04:57:55'),
	(22, 2, 400000.00, 'confirmed', 'direct', 'user01', '6969696969', 'gggg', '', '2026-04-22 05:04:44', '2026-04-22 05:46:25'),
	(23, 2, 10000.00, 'delivered', 'momo', 'Test', '0901234567', 'HN', '', '2026-04-22 06:29:21', '2026-04-23 15:50:42'),
	(24, 2, 1000000.00, 'delivered', 'momo', 'user01', '6969696969', 'gggg', '', '2026-04-22 06:30:17', '2026-04-22 06:35:02'),
	(25, 2, 400000.00, 'delivered', 'momo', 'user01', '6969696969', 'gggg', '', '2026-04-22 06:33:38', '2026-04-22 06:35:04'),
	(53, 2, 600000.00, 'confirmed', 'momo', 'user01', '6969696969', 'gggg', '', '2026-04-22 10:31:15', '2026-04-22 10:31:37'),
	(62, 2, 250000.00, 'cancelled', 'momo', 'user01', '6969696969', 'gggg', '', '2026-04-22 11:01:16', '2026-04-23 15:50:44'),
	(67, 2, 4450000.00, 'shipped', 'momo', 'user01', '6969696969', 'gggg', '', '2026-04-22 11:09:25', '2026-04-23 15:50:35'),
	(71, 2, 600000.00, 'confirmed', 'momo', 'user01', '6969696969', 'gggg', '', '2026-04-23 06:46:18', '2026-04-23 06:46:41'),
	(75, 2, 300000.00, 'shipped', 'momo', 'user01', '6969696969', 'gggg', '', '2026-04-23 06:50:18', '2026-04-23 15:50:32'),
	(78, 2, 150000.00, 'pending', 'direct', 'user01', '6969696969', 'gggg', '', '2026-04-23 07:02:31', '2026-04-23 07:02:31');

-- Dumping structure for table threegym.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`),
  KEY `idx_order_items_product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.order_items: ~21 rows (approximately)
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `price`, `subtotal`, `created_at`) VALUES
	(9, 2, 1, 'Dumbbell 5kg', 1, 150000.00, 150000.00, '2026-04-22 03:40:52'),
	(10, 3, 3, 'Barbell 20kg', 3, 600000.00, 1800000.00, '2026-04-22 03:44:03'),
	(11, 3, 2, 'Dumbbell 10kg', 4, 250000.00, 1000000.00, '2026-04-22 03:44:03'),
	(45, 15, 1, 'Dumbbell 5kg', 13, 150000.00, 1950000.00, '2026-04-22 04:57:55'),
	(46, 15, 3, 'Barbell 20kg', 12, 600000.00, 7200000.00, '2026-04-22 04:57:55'),
	(47, 15, 2, 'Dumbbell 10kg', 11, 250000.00, 2750000.00, '2026-04-22 04:57:55'),
	(56, 22, 2, 'Dumbbell 10kg', 1, 250000.00, 250000.00, '2026-04-22 05:04:44'),
	(57, 22, 1, 'Dumbbell 5kg', 1, 150000.00, 150000.00, '2026-04-22 05:04:44'),
	(58, 23, 1, 'Item1', 1, 10000.00, 10000.00, '2026-04-22 06:29:21'),
	(59, 24, 1, 'Dumbbell 5kg', 1, 150000.00, 150000.00, '2026-04-22 06:30:17'),
	(60, 24, 3, 'Barbell 20kg', 1, 600000.00, 600000.00, '2026-04-22 06:30:17'),
	(61, 24, 2, 'Dumbbell 10kg', 1, 250000.00, 250000.00, '2026-04-22 06:30:17'),
	(62, 25, 2, 'Dumbbell 10kg', 1, 250000.00, 250000.00, '2026-04-22 06:33:38'),
	(63, 25, 1, 'Dumbbell 5kg', 1, 150000.00, 150000.00, '2026-04-22 06:33:38'),
	(96, 53, 3, 'Barbell 20kg', 1, 600000.00, 600000.00, '2026-04-22 10:31:15'),
	(106, 62, 2, 'Dumbbell 10kg', 1, 250000.00, 250000.00, '2026-04-22 11:01:16'),
	(113, 67, 5, 'Stationary Bike', 1, 4200000.00, 4200000.00, '2026-04-22 11:09:25'),
	(114, 67, 2, 'Dumbbell 10kg', 1, 250000.00, 250000.00, '2026-04-22 11:09:25'),
	(118, 71, 3, 'Barbell 20kg', 1, 600000.00, 600000.00, '2026-04-23 06:46:18'),
	(122, 75, 6, 'Pull-up Bar', 1, 300000.00, 300000.00, '2026-04-23 06:50:18'),
	(125, 78, 1, 'Dumbbell 5kg', 1, 150000.00, 150000.00, '2026-04-23 07:02:31');

-- Dumping structure for table threegym.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_category` (`category_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.products: ~20 rows (approximately)
INSERT INTO `products` (`id`, `name`, `description`, `price`, `avatar`, `created_at`, `updated_at`, `category_id`) VALUES
	(1, 'Dumbbell 5kg', 'Tạ tay 5kg phù hợp tập cơ bản', 150000.00, 'product_1774560016_20be1c36.jpg', '2026-03-25 04:48:01', '2026-03-26 21:20:17', 1),
	(2, 'Dumbbell 10kg', 'Tạ tay 10kg cho người tập trung cấp', 250000.00, 'product_1774559753_3551081b.jpg', '2026-03-25 04:48:01', '2026-03-26 21:15:54', 1),
	(3, 'Barbell 20kg', 'Thanh đòn + tạ 20kg', 600000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 1),
	(4, 'Treadmill', 'Máy chạy bộ tại nhà', 7500000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 1),
	(5, 'Stationary Bike', 'Xe đạp tập thể dục', 4200000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 1),
	(6, 'Pull-up Bar', 'Xà đơn gắn cửa', 300000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 1),
	(7, 'Kettlebell 8kg', 'Tạ ấm 8kg', 220000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 1),
	(8, 'Yoga Mat', 'Thảm tập yoga chống trượt', 120000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 2),
	(9, 'Resistance Band Set', 'Bộ dây kháng lực 5 mức', 180000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 2),
	(10, 'Gym Gloves', 'Găng tay tập gym chống trượt', 90000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 2),
	(11, 'Foam Roller', 'Con lăn giãn cơ', 130000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 2),
	(12, 'Skipping Rope', 'Dây nhảy thể lực', 50000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 2),
	(13, 'Gym Backpack', 'Balo đựng đồ tập gym', 200000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 2),
	(14, 'Lifting Belt', 'Đai lưng hỗ trợ nâng tạ', 250000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 2),
	(15, 'Smart Fitness Watch', 'Đồng hồ theo dõi sức khỏe', 1500000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 2),
	(16, 'Protein Whey 1kg', 'Bột whey protein hỗ trợ tăng cơ', 750000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 3),
	(17, 'Creatine 300g', 'Tăng sức mạnh và hiệu suất', 450000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 3),
	(18, 'Mass Gainer 3kg', 'Tăng cân nhanh cho người gầy', 900000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 3),
	(19, 'Pre Workout', 'Tăng năng lượng trước khi tập', 550000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 3),
	(20, 'BCAA 2:1:1', 'Hỗ trợ phục hồi cơ', 400000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 3);

-- Dumping structure for table threegym.product_categories
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.product_categories: ~4 rows (approximately)
INSERT INTO `product_categories` (`id`, `name`, `created_at`, `updated_at`) VALUES
	(1, 'Thiết bị', '2026-03-25 04:46:19', '2026-04-08 08:28:54'),
	(2, 'Phụ kiện', '2026-03-25 04:46:19', '2026-04-08 08:29:13'),
	(3, 'Bổ sung', '2026-03-25 04:46:19', '2026-04-08 08:29:25');

-- Dumping structure for table threegym.rooms
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.rooms: ~4 rows (approximately)
INSERT INTO `rooms` (`id`, `name`, `description`, `avatar`, `created_at`, `updated_at`) VALUES
	(1, 'Phòng Cardio', 'ở trời', '', '2026-04-24 02:00:00', '2026-04-24 02:20:04'),
	(2, 'Phòng Free Weight', 'tphcm', '', '2026-04-24 02:05:00', '2026-04-24 02:19:50'),
	(3, 'Phòng Functional', 'ggg 1234', '', '2026-04-24 02:10:00', '2026-04-24 02:24:19'),
	(4, 'bter', 'feefww', '', '2026-04-24 01:59:36', '2026-04-24 02:20:11');

-- Dumping structure for table threegym.room_equipments
CREATE TABLE IF NOT EXISTS `room_equipments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `warehouse_item_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_item` (`room_id`,`warehouse_item_id`),
  KEY `idx_room_item_room` (`room_id`),
  KEY `idx_room_item_warehouse` (`warehouse_item_id`),
  CONSTRAINT `fk_room_equipments_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_room_equipments_warehouse_item` FOREIGN KEY (`warehouse_item_id`) REFERENCES `warehouse_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.room_equipments: ~10 rows (approximately)
INSERT INTO `room_equipments` (`id`, `room_id`, `warehouse_item_id`, `quantity`, `created_at`, `updated_at`) VALUES
	(19, 2, 2, 4, '2026-04-24 02:19:50', '2026-04-24 02:21:13'),
	(20, 2, 1, 6, '2026-04-24 02:19:50', '2026-04-24 02:21:17'),
	(21, 2, 4, 2, '2026-04-24 02:19:50', '2026-04-24 02:21:04'),
	(22, 1, 5, 2, '2026-04-24 02:20:04', '2026-04-24 02:21:00'),
	(23, 1, 3, 2, '2026-04-24 02:20:04', '2026-04-24 02:21:08'),
	(24, 4, 1, 1, '2026-04-24 02:20:11', '2026-04-24 02:21:17'),
	(35, 3, 1, 5, '2026-04-24 02:24:19', '2026-04-24 02:24:19'),
	(36, 3, 4, 1, '2026-04-24 02:24:19', '2026-04-24 02:24:19'),
	(37, 3, 5, 8, '2026-04-24 02:24:19', '2026-04-24 02:24:19'),
	(38, 3, 3, 3, '2026-04-24 02:24:19', '2026-04-24 02:24:19');

-- Dumping structure for table threegym.service_packages
CREATE TABLE IF NOT EXISTS `service_packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `duration_days` int NOT NULL DEFAULT '30' COMMENT 'Số ngày hiệu lực của gói',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.service_packages: ~3 rows (approximately)
INSERT INTO `service_packages` (`id`, `name`, `price`, `duration_days`, `created_at`) VALUES
	(1, 'NORMAL', 250000.00, 30, '2026-04-23 10:01:54'),
	(2, 'PRO', 350000.00, 30, '2026-04-23 10:01:54'),
	(3, 'VIP', 500000.00, 30, '2026-04-23 10:01:54');

-- Dumping structure for table threegym.user_services
CREATE TABLE IF NOT EXISTS `user_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'FK → accounts.id',
  `package_id` int NOT NULL COMMENT 'FK → service_packages.id',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','expired') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_active` (`user_id`,`status`),
  KEY `idx_us_user_id` (`user_id`),
  KEY `idx_us_package_id` (`package_id`),
  KEY `idx_us_status` (`status`),
  CONSTRAINT `us_fk_package` FOREIGN KEY (`package_id`) REFERENCES `service_packages` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `us_fk_user` FOREIGN KEY (`user_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.user_services: ~0 rows (approximately)
INSERT INTO `user_services` (`id`, `user_id`, `package_id`, `start_date`, `end_date`, `status`, `created_at`) VALUES
	(59, 2, 1, '2026-04-24', '2026-05-24', 'active', '2026-04-24 02:33:03');

-- Dumping structure for table threegym.warehouse_items
CREATE TABLE IF NOT EXISTS `warehouse_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `quantity` int NOT NULL DEFAULT '0',
  `status` enum('available','out_of_stock','maintenance') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_warehouse_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.warehouse_items: ~5 rows (approximately)
INSERT INTO `warehouse_items` (`id`, `name`, `description`, `quantity`, `status`, `location`, `avatar`, `created_at`, `updated_at`) VALUES
	(1, 'Dumbbell Rack', 'Kệ đựng tạ tay khu free-weight', 16, 'available', 'Khu tạ tay', NULL, '2026-04-24 01:00:00', '2026-04-24 02:21:17'),
	(2, 'Barbell 20kg', 'Thanh đòn tiêu chuẩn Olympic', 11, 'available', 'Khu squat', NULL, '2026-04-24 01:01:00', '2026-04-24 02:21:13'),
	(3, 'Treadmill', 'Máy chạy bộ điện', 5, 'maintenance', 'Khu cardio', NULL, '2026-04-24 01:02:00', '2026-04-24 02:21:08'),
	(4, 'Kettlebell 12kg', 'Tạ ấm dùng tập functional', 7, 'out_of_stock', 'Kho tầng 1', NULL, '2026-04-24 01:03:00', '2026-04-24 02:21:04'),
	(5, 'Resistance Bands Set', 'Bộ dây kháng lực đa mức gg', 14, 'out_of_stock', 'Khu lớp nhóm', '', '2026-04-24 01:04:00', '2026-04-24 02:21:00');

-- Dumping structure for table threegym.wishlists
CREATE TABLE IF NOT EXISTS `wishlists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_account_product` (`account_id`,`product_id`),
  KEY `idx_account_id` (`account_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_added_at` (`added_at`),
  CONSTRAINT `fk_wishlists_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_wishlists_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=145 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.wishlists: ~23 rows (approximately)
INSERT INTO `wishlists` (`id`, `account_id`, `product_id`, `quantity`, `added_at`, `updated_at`) VALUES
	(11, 1, 1, 19, '2026-04-18 13:11:52', '2026-04-22 02:30:00'),
	(12, 1, 2, 26, '2026-04-18 13:11:52', '2026-04-22 02:28:44'),
	(13, 1, 3, 8, '2026-04-18 13:11:53', '2026-04-22 02:28:30'),
	(14, 1, 5, 8, '2026-04-18 13:12:30', '2026-04-22 02:21:37'),
	(15, 1, 6, 14, '2026-04-18 13:12:31', '2026-04-22 02:21:36'),
	(17, 1, 8, 2, '2026-04-18 13:38:11', '2026-04-22 02:09:52'),
	(18, 1, 10, 12, '2026-04-18 13:38:12', '2026-04-22 02:09:55'),
	(19, 1, 9, 201, '2026-04-18 13:38:12', '2026-04-22 02:09:53'),
	(20, 1, 20, 3, '2026-04-18 13:38:18', '2026-04-22 02:10:03'),
	(21, 1, 19, 3, '2026-04-18 13:38:18', '2026-04-22 02:10:03'),
	(22, 1, 17, 8, '2026-04-18 13:38:19', '2026-04-22 02:10:00'),
	(23, 1, 4, 6, '2026-04-22 01:12:22', '2026-04-22 02:28:48'),
	(24, 1, 7, 5, '2026-04-22 02:07:20', '2026-04-22 02:09:52'),
	(25, 1, 13, 3, '2026-04-22 02:07:31', '2026-04-22 02:09:57'),
	(26, 1, 14, 3, '2026-04-22 02:07:31', '2026-04-22 02:09:58'),
	(27, 1, 15, 8, '2026-04-22 02:09:41', '2026-04-22 02:10:15'),
	(28, 1, 18, 2, '2026-04-22 02:09:42', '2026-04-22 02:09:59'),
	(29, 1, 12, 1, '2026-04-22 02:09:54', '2026-04-22 02:09:54'),
	(30, 1, 11, 1, '2026-04-22 02:09:54', '2026-04-22 02:09:54'),
	(31, 1, 16, 7, '2026-04-22 02:10:01', '2026-04-22 02:10:35'),
	(139, 2, 1, 1, '2026-04-23 07:03:03', '2026-04-23 07:03:03'),
	(140, 2, 2, 1, '2026-04-23 07:03:04', '2026-04-23 07:03:04'),
	(141, 2, 3, 1, '2026-04-23 07:03:04', '2026-04-23 07:03:04'),
	(142, 2, 16, 1, '2026-04-24 02:54:34', '2026-04-24 02:54:34'),
	(143, 2, 17, 1, '2026-04-24 02:54:34', '2026-04-24 02:54:34'),
	(144, 2, 12, 1, '2026-04-24 02:54:37', '2026-04-24 02:54:37');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
