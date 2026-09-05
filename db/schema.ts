import { boolean, index, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull(),
  transactionType: text('transaction_type', { enum: ['rent', 'sale'] }).notNull().default('rent'),
  status: text('status', { enum: ['draft', 'published', 'sold', 'rented', 'archived'] }).notNull().default('draft'),
  nameEn: text('name_en').notNull(), nameVi: text('name_vi').notNull(),
  descriptionEn: text('description_en').notNull().default(''), descriptionVi: text('description_vi').notNull().default(''),
  tagEn: text('tag_en').notNull().default('New'), tagVi: text('tag_vi').notNull().default('Mới'),
  area: text('area').notNull(), propertyType: text('property_type').notNull(), price: integer('price').notNull(),
  currency: text('currency').notNull().default('VND'), beds: integer('beds').notNull().default(1),
  baths: integer('baths').notNull().default(1), sizeSqm: integer('size_sqm').notNull().default(1),
  mapX: integer('map_x').notNull().default(50), mapY: integer('map_y').notNull().default(50),
  featured: boolean('featured').notNull().default(false), sortOrder: integer('sort_order').notNull().default(0),
  imagesJson: text('images_json').notNull().default('[]'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('idx_properties_slug').on(table.slug), index('idx_properties_public_order').on(table.status, table.transactionType, table.sortOrder)]);

export const siteMeta = pgTable('site_meta', { key: text('key').primaryKey(), value: text('value').notNull() });
