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

-- Dumping data for table threegym.accounts: ~4 rows (approximately)
INSERT INTO `accounts` (`id`, `username`, `email`, `password`, `avatar`, `address`, `phone`, `role`, `created_at`) VALUES
	(1, 'admin01', 'admin@threegym.com', '$2y$10$Azq/j3Y/WzNhR6Hd.5s2Ve17zLmbbEa8th4tTJ5M9Nghc9IsD3vPq', 'avatar_1_1774429021.png', 'ADMIN', '342423', 'admin', '2026-03-16 07:44:23'),
	(2, 'user01', 'user@threegym.com', '$2y$10$zDqHCmi3D8v1dlsnglvQ.eyj.jxTAkE5av3bCNjQ6cbnkmcvPyKEq', 'avatar_2_1774429319.jpg', 'gggg', '6969696969', 'user', '2026-03-16 07:44:23'),
	(4, '0448_Nguyễn Hải Hoàng', 'haihoang15122002@gmail.com', '$2y$10$x4ZjIEqhoiHWr8.eGZUjO.7QNnuoE1YKjdx9PwOvOFe7pnMwMMH76', NULL, '', '', 'user', '2026-03-21 07:02:13'),
	(5, 'HaiHoan15', 'haihoantamquoc@gmail.com', '$2y$10$DaIWa6VZV1gZ5xGtRZoXneFuwanhafy8T9iHO02sCsM0sf9dD8yLW', 'avatar_5_1774414858.gif', 'srgefwe', '53323423', 'user', '2026-03-24 13:59:39');

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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.products: ~0 rows (approximately)
INSERT INTO `products` (`id`, `name`, `description`, `price`, `avatar`, `created_at`, `updated_at`, `category_id`) VALUES
	(1, 'Dumbbell 5kg', 'Tạ tay 5kg phù hợp tập cơ bản', 150000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 1),
	(2, 'Dumbbell 10kg', 'Tạ tay 10kg cho người tập trung cấp', 250000.00, NULL, '2026-03-25 04:48:01', '2026-03-25 04:48:01', 1),
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table threegym.product_categories: ~0 rows (approximately)
INSERT INTO `product_categories` (`id`, `name`, `created_at`, `updated_at`) VALUES
	(1, 'Equipment', '2026-03-25 04:46:19', '2026-03-25 04:46:19'),
	(2, 'Accessory', '2026-03-25 04:46:19', '2026-03-25 04:46:19'),
	(3, 'Supplement', '2026-03-25 04:46:19', '2026-03-25 04:46:19');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
