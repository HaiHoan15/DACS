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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.orders: ~0 rows (approximately)
INSERT INTO `orders` (`id`, `account_id`, `total_amount`, `status`, `payment_method`, `recipient_name`, `recipient_phone`, `recipient_address`, `notes`, `created_at`, `updated_at`) VALUES
	(2, 2, 150000.00, 'shipped', 'direct', 'user01', '6969696969', 'gggg', '', '2026-04-22 03:40:52', '2026-04-22 04:00:53'),
	(3, 2, 2800000.00, 'cancelled', 'direct', 'user01', '6969696969', 'gggg', '', '2026-04-22 03:44:03', '2026-04-22 04:02:17'),
	(15, 2, 11900000.00, 'pending', 'direct', 'user01', '6969696969', 'gggg', '', '2026-04-22 04:57:55', '2026-04-22 04:57:55'),
	(22, 2, 400000.00, 'confirmed', 'direct', 'user01', '6969696969', 'gggg', '', '2026-04-22 05:04:44', '2026-04-22 05:46:25'),
	(23, 2, 10000.00, 'confirmed', 'momo', 'Test', '0901234567', 'HN', '', '2026-04-22 06:29:21', '2026-04-22 06:35:00'),
	(24, 2, 1000000.00, 'delivered', 'momo', 'user01', '6969696969', 'gggg', '', '2026-04-22 06:30:17', '2026-04-22 06:35:02'),
	(25, 2, 400000.00, 'delivered', 'momo', 'user01', '6969696969', 'gggg', '', '2026-04-22 06:33:38', '2026-04-22 06:35:04');

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
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.order_items: ~0 rows (approximately)
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
	(63, 25, 1, 'Dumbbell 5kg', 1, 150000.00, 150000.00, '2026-04-22 06:33:38');

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
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.wishlists: ~12 rows (approximately)
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
	(74, 2, 2, 1, '2026-04-22 06:34:31', '2026-04-22 06:34:31'),
	(75, 2, 3, 1, '2026-04-22 06:34:31', '2026-04-22 06:34:31'),
	(76, 2, 1, 1, '2026-04-22 06:34:32', '2026-04-22 06:34:32');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
