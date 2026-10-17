CREATE TABLE `User` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`password` text NOT NULL,
	`role` text DEFAULT 'customer',
	`status` text DEFAULT 'active'
);
CREATE TABLE `Product` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`category` text,
	`stock` integer DEFAULT 0,
	`description` text,
	`image_url` text
);
CREATE TABLE `Order` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`total_price` real DEFAULT 0,
	`status` text DEFAULT 'pending',
	`created_at` numeric DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `fk_Order_user_id_User_id_fk` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`)
);
CREATE TABLE `Order_Product` (
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer DEFAULT 1,
	CONSTRAINT `Order_Product_pk` PRIMARY KEY(`order_id`, `product_id`),
	CONSTRAINT `fk_Order_Product_product_id_Product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_Order_Product_order_id_Order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE CASCADE
);