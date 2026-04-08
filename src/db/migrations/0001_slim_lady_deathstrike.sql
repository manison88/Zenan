ALTER TABLE `trucks` ADD `is_demo` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
INSERT INTO `repair_types` (`name`, `is_default`) VALUES
  ('Tires', 1),
  ('Brakes', 1),
  ('Engine', 1),
  ('Oil Change', 1),
  ('Transmission', 1),
  ('Electrical', 1),
  ('Body Work', 1),
  ('Other', 1);
