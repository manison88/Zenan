CREATE TABLE `fixed_costs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`truck_id` integer NOT NULL,
	`insurance` real DEFAULT 0 NOT NULL,
	`parking` real DEFAULT 0 NOT NULL,
	`eld` real DEFAULT 0 NOT NULL,
	`tolls` real DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`truck_id`) REFERENCES `trucks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fixed_costs_truck_idx` ON `fixed_costs` (`truck_id`);--> statement-breakpoint
CREATE TABLE `fuel_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`truck_id` integer NOT NULL,
	`date` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`gallons` real NOT NULL,
	`amount` real NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`truck_id`) REFERENCES `trucks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `fuel_truck_date_idx` ON `fuel_logs` (`truck_id`,`date`);--> statement-breakpoint
CREATE TABLE `odometer_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`truck_id` integer NOT NULL,
	`week_start_date` text NOT NULL,
	`starting_reading` real NOT NULL,
	`ending_reading` real NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`truck_id`) REFERENCES `trucks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `odometer_truck_week_idx` ON `odometer_logs` (`truck_id`,`week_start_date`);--> statement-breakpoint
CREATE TABLE `repair_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`is_default` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `repair_types_name_unique` ON `repair_types` (`name`);--> statement-breakpoint
CREATE TABLE `repairs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`truck_id` integer NOT NULL,
	`date` text NOT NULL,
	`repair_type_id` integer NOT NULL,
	`amount` real NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`truck_id`) REFERENCES `trucks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`repair_type_id`) REFERENCES `repair_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `repairs_truck_date_idx` ON `repairs` (`truck_id`,`date`);--> statement-breakpoint
CREATE TABLE `trips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`truck_id` integer NOT NULL,
	`date` text NOT NULL,
	`from_city` text NOT NULL,
	`from_state` text NOT NULL,
	`to_city` text NOT NULL,
	`to_state` text NOT NULL,
	`trailer` text,
	`bill_number` text,
	`amount` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`truck_id`) REFERENCES `trucks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `trips_truck_date_idx` ON `trips` (`truck_id`,`date`);--> statement-breakpoint
CREATE TABLE `trucks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`truck_number` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trucks_truck_number_unique` ON `trucks` (`truck_number`);