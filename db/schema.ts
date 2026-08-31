import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const properties = sqliteTable('properties', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull(),
  transactionType: text('transaction_type', { enum: ['rent', 'sale'] }).notNull().default('rent'),
  status: text('status', { enum: ['draft', 'published', 'sold', 'rented', 'archived'] }).notNull().default('draft'),
  nameEn: text('name_en').notNull(),
  nameVi: text('name_vi').notNull(),
  descriptionEn: text('description_en').notNull().default(''),
  descriptionVi: text('description_vi').notNull().default(''),
  tagEn: text('tag_en').notNull().default('New'),
  tagVi: text('tag_vi').notNull().default('Mới'),
  area: text('area').notNull(),
  propertyType: text('property_type').notNull(),
  price: integer('price').notNull(),
  currency: text('currency').notNull().default('VND'),
  beds: integer('beds').notNull().default(1),
  baths: integer('baths').notNull().default(1),
  sizeSqm: integer('size_sqm').notNull().default(1),
  mapX: integer('map_x').notNull().default(50),
  mapY: integer('map_y').notNull().default(50),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  imagesJson: text('images_json').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex('idx_properties_slug').on(table.slug),
  index('idx_properties_public_order').on(table.status, table.transactionType, table.sortOrder),
]);

export const siteMeta = sqliteTable('site_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
