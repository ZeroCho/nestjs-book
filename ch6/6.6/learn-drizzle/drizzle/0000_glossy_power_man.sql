-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commenter` int NOT NULL,
	`comment` varchar(100) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(20) NOT NULL,
	`age` int unsigned NOT NULL,
	`married` tinyint NOT NULL,
	`comment` text,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `name_UNIQUE` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `commenter` FOREIGN KEY (`commenter`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `commenter_idx` ON `comments` (`commenter`);
*/