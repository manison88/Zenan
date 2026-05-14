CREATE TABLE `maintenance_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`truck_id` integer NOT NULL,
	`repair_type_id` integer NOT NULL,
	`service_date` text,
	`service_odometer` real,
	`cost` real DEFAULT 0 NOT NULL,
	`notes` text,
	`next_due_date` text,
	`next_due_odometer` real,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`truck_id`) REFERENCES `trucks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`repair_type_id`) REFERENCES `repair_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `maintenance_truck_idx` ON `maintenance_logs` (`truck_id`);--> statement-breakpoint
CREATE INDEX `maintenance_truck_type_idx` ON `maintenance_logs` (`truck_id`,`repair_type_id`);--> statement-breakpoint
CREATE INDEX `maintenance_next_due_date_idx` ON `maintenance_logs` (`next_due_date`);--> statement-breakpoint
INSERT OR IGNORE INTO `repair_types` (`name`, `is_default`) VALUES ('Oil Change', 1);--> statement-breakpoint
INSERT OR IGNORE INTO `repair_types` (`name`, `is_default`) VALUES ('Brakes', 1);--> statement-breakpoint
INSERT OR IGNORE INTO `repair_types` (`name`, `is_default`) VALUES ('Tires', 1);--> statement-breakpoint
INSERT OR IGNORE INTO `repair_types` (`name`, `is_default`) VALUES ('Tire Rotation', 1);--> statement-breakpoint
INSERT OR IGNORE INTO `repair_types` (`name`, `is_default`) VALUES ('Air Filter', 1);--> statement-breakpoint
INSERT OR IGNORE INTO `repair_types` (`name`, `is_default`) VALUES ('Fuel Filter', 1);--> statement-breakpoint
INSERT OR IGNORE INTO `repair_types` (`name`, `is_default`) VALUES ('Transmission Service', 1);--> statement-breakpoint
INSERT OR IGNORE INTO `repair_types` (`name`, `is_default`) VALUES ('Coolant Flush', 1);--> statement-breakpoint
INSERT OR IGNORE INTO `repair_types` (`name`, `is_default`) VALUES ('DOT Inspection', 1);--> statement-breakpoint
INSERT OR IGNORE INTO `repair_types` (`name`, `is_default`) VALUES ('Other', 1);