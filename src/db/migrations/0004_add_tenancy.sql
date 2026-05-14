CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`pin_hash` text NOT NULL,
	`fleet_name` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_email_unique` ON `tenants` (`email`);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_tenant_idx` ON `sessions` (`tenant_id`);
--> statement-breakpoint
INSERT INTO `tenants` (`id`, `email`, `pin_hash`, `fleet_name`)
VALUES (
	'tenant_default_001',
	'owner@migrated.local',
	'pbkdf2-sha256$100000$245c147a0e7a734a0f9d553e24c60ed3$a69828bd8c8ed3a7464c3740e00bfc58e234612e1c941f00fc9252818b9ecbe2',
	'My Fleet'
);
--> statement-breakpoint
DROP INDEX IF EXISTS `trucks_truck_number_unique`;
--> statement-breakpoint
ALTER TABLE `trucks` ADD COLUMN `tenant_id` text NOT NULL DEFAULT 'tenant_default_001' REFERENCES `tenants`(`id`) ON DELETE CASCADE;
--> statement-breakpoint
CREATE UNIQUE INDEX `trucks_tenant_number_idx` ON `trucks` (`tenant_id`,`truck_number`);
--> statement-breakpoint
CREATE INDEX `trucks_tenant_idx` ON `trucks` (`tenant_id`);
