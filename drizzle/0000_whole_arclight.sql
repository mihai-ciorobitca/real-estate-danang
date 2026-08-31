CREATE TABLE `properties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`transaction_type` text DEFAULT 'rent' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`name_en` text NOT NULL,
	`name_vi` text NOT NULL,
	`description_en` text DEFAULT '' NOT NULL,
	`description_vi` text DEFAULT '' NOT NULL,
	`tag_en` text DEFAULT 'New' NOT NULL,
	`tag_vi` text DEFAULT 'Mới' NOT NULL,
	`area` text NOT NULL,
	`property_type` text NOT NULL,
	`price` integer NOT NULL,
	`currency` text DEFAULT 'VND' NOT NULL,
	`beds` integer DEFAULT 1 NOT NULL,
	`baths` integer DEFAULT 1 NOT NULL,
	`size_sqm` integer DEFAULT 1 NOT NULL,
	`map_x` integer DEFAULT 50 NOT NULL,
	`map_y` integer DEFAULT 50 NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`images_json` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_properties_slug` ON `properties` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_properties_public_order` ON `properties` (`status`,`transaction_type`,`sort_order`);--> statement-breakpoint
CREATE TABLE `site_meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
