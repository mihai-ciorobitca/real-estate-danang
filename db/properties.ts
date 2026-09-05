import postgres from 'postgres';
import type { PropertyInput, PropertyRecord, PropertyStatus, TransactionType } from '@/lib/property-types';

type PropertyRow = {
  id: number; slug: string; transaction_type: TransactionType; status: PropertyStatus;
  name_en: string; name_vi: string; description_en: string; description_vi: string;
  tag_en: string; tag_vi: string; area: string; property_type: string; price: number;
  currency: string; beds: number; baths: number; size_sqm: number; map_x: number;
  map_y: number; featured: boolean; sort_order: number; images_json: string;
  created_at: string | Date; updated_at: string | Date;
};

let client: ReturnType<typeof postgres> | null = null;

function database() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  client ??= postgres(process.env.DATABASE_URL, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
  });
  return client;
}

let initialized: Promise<void> | null = null;
export function ensureDatabase(): Promise<void> {
  initialized ??= initializeDatabase().catch((error) => { initialized = null; throw error; });
  return initialized;
}

async function initializeDatabase() {
  const db = database();
  await db`CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE,
    transaction_type TEXT NOT NULL DEFAULT 'rent' CHECK(transaction_type IN ('rent','sale')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','sold','rented','archived')),
    name_en TEXT NOT NULL, name_vi TEXT NOT NULL, description_en TEXT NOT NULL DEFAULT '', description_vi TEXT NOT NULL DEFAULT '',
    tag_en TEXT NOT NULL DEFAULT 'New', tag_vi TEXT NOT NULL DEFAULT 'Mới', area TEXT NOT NULL, property_type TEXT NOT NULL,
    price INTEGER NOT NULL CHECK(price >= 0), currency TEXT NOT NULL DEFAULT 'VND', beds INTEGER NOT NULL DEFAULT 1 CHECK(beds >= 0),
    baths INTEGER NOT NULL DEFAULT 1 CHECK(baths >= 0), size_sqm INTEGER NOT NULL DEFAULT 1 CHECK(size_sqm > 0),
    map_x INTEGER NOT NULL DEFAULT 50 CHECK(map_x BETWEEN 0 AND 100), map_y INTEGER NOT NULL DEFAULT 50 CHECK(map_y BETWEEN 0 AND 100),
    featured BOOLEAN NOT NULL DEFAULT false, sort_order INTEGER NOT NULL DEFAULT 0, images_json TEXT NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`;
  await db`CREATE INDEX IF NOT EXISTS idx_properties_public_order ON properties(status, transaction_type, sort_order)`;
  await db`CREATE TABLE IF NOT EXISTS site_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`;
  const state = await db`SELECT value FROM site_meta WHERE key = 'seed_version'`;
  if (state.length) return;
  await db`INSERT INTO properties (id, slug, status, name_en, name_vi, description_en, description_vi, tag_en, tag_vi, area, property_type, price, beds, baths, size_sqm, map_x, map_y, featured, sort_order, images_json) VALUES
    (1,'oceanview-residence','published','Oceanview Residence','Căn hộ view biển','A light-filled coastal residence with a private balcony and effortless access to My Khe Beach.','Căn hộ ven biển ngập tràn ánh sáng với ban công riêng và lối đi thuận tiện ra biển Mỹ Khê.','Featured','Nổi bật','My Khe Beach','Apartment',18000000,2,2,82,74,34,true,10,'["/luxury/property-1-balcony.webp","/luxury/property-1-bedroom.webp","/property-1.jpg"]'),
    (2,'han-river-suite','published','The Han River Suite','Căn hộ sông Hàn','A refined city suite with river views, modern furnishings and a calm central address.','Căn hộ thành phố tinh tế với tầm nhìn ra sông, nội thất hiện đại và vị trí trung tâm yên tĩnh.','River view','View sông','Hai Chau','Apartment',15000000,1,1,56,45,48,false,20,'["/luxury/property-2-living.webp","/luxury/property-2-bedroom.webp","/property-2.jpg"]'),
    (3,'an-thuong-garden-home','published','An Thuong Garden Home','Nhà vườn An Thượng','A generous garden home created for relaxed long stays near An Thuong.','Ngôi nhà vườn rộng rãi dành cho cuộc sống dài hạn thư thái gần An Thượng.','New','Mới','Ngu Hanh Son','House',22000000,3,3,140,64,72,true,30,'["/luxury/property-3-courtyard.webp","/luxury/property-3-living.webp","/property-3.jpg"]'),
    (4,'son-tra-urban-studio','published','Son Tra Urban Studio','Studio đô thị Sơn Trà','A compact, carefully planned studio close to the beach.','Studio nhỏ gọn, bố trí hợp lý, gần biển.','Near beach','Gần biển','Son Tra','Apartment',9500000,1,1,45,82,19,false,40,'["/luxury/property-4-studio.webp","/luxury/property-4-bedroom.webp","/property-4.jpg"]'),
    (5,'palm-courtyard-villa','published','Palm Courtyard Villa','Biệt thự Palm Courtyard','A private tropical villa with generous social spaces and a secluded pool.','Biệt thự nhiệt đới riêng tư với không gian sinh hoạt rộng và hồ bơi kín đáo.','Private pool','Hồ bơi riêng','Ngu Hanh Son','Villa',38000000,4,4,260,55,84,true,50,'["/luxury/property-5-pool.webp","/luxury/property-5-living.webp","/property-5.jpg"]'),
    (6,'my-khe-sky-residence','published','My Khe Sky Residence','Căn hộ My Khe Sky','An elevated two-bedroom residence with broad sea views.','Căn hộ hai phòng ngủ trên cao với tầm nhìn biển rộng.','Sea view','View biển','My Khe Beach','Apartment',27000000,2,2,96,78,55,true,60,'["/luxury/property-6-living.webp","/luxury/property-6-bath.webp","/property-6.jpg"]') ON CONFLICT (id) DO NOTHING`;
  await db`SELECT setval(pg_get_serial_sequence('properties', 'id'), COALESCE((SELECT MAX(id) FROM properties), 1))`;
  await db`INSERT INTO site_meta (key, value) VALUES ('seed_version', '1') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
}

function mapProperty(row: PropertyRow): PropertyRecord {
  let images: string[] = [];
  try { const parsed = JSON.parse(row.images_json); if (Array.isArray(parsed)) images = parsed.filter((v): v is string => typeof v === 'string' && v.length > 0); } catch {}
  return { id: row.id, slug: row.slug, transactionType: row.transaction_type, status: row.status, images,
    name: { en: row.name_en, vi: row.name_vi }, description: { en: row.description_en, vi: row.description_vi }, tag: { en: row.tag_en, vi: row.tag_vi },
    area: row.area, type: row.property_type, price: row.price, currency: row.currency, beds: row.beds, baths: row.baths,
    size: row.size_sqm, x: row.map_x, y: row.map_y, featured: row.featured, sortOrder: row.sort_order,
    createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString() };
}

export async function listProperties(options: { publishedOnly?: boolean } = {}) {
  await ensureDatabase(); const db = database();
  const rows = options.publishedOnly ? await db`SELECT * FROM properties WHERE status='published' ORDER BY featured DESC, sort_order, id` : await db`SELECT * FROM properties ORDER BY sort_order, id`;
  return (rows as unknown as PropertyRow[]).map(mapProperty);
}
export async function getProperty(id: number) { await ensureDatabase(); const rows = await database()`SELECT * FROM properties WHERE id=${id}`; return rows[0] ? mapProperty(rows[0] as unknown as PropertyRow) : null; }
export async function createProperty(i: PropertyInput) { await ensureDatabase(); const rows = await database()`INSERT INTO properties (slug,transaction_type,status,name_en,name_vi,description_en,description_vi,tag_en,tag_vi,area,property_type,price,currency,beds,baths,size_sqm,map_x,map_y,featured,sort_order,images_json) VALUES (${i.slug},${i.transactionType},${i.status},${i.name.en},${i.name.vi},${i.description.en},${i.description.vi},${i.tag.en},${i.tag.vi},${i.area},${i.type},${i.price},${i.currency},${i.beds},${i.baths},${i.size},${i.x},${i.y},${i.featured},${i.sortOrder},${JSON.stringify(i.images)}) RETURNING *`; return mapProperty(rows[0] as unknown as PropertyRow); }
export async function updateProperty(id: number, i: PropertyInput) { await ensureDatabase(); const rows = await database()`UPDATE properties SET slug=${i.slug},transaction_type=${i.transactionType},status=${i.status},name_en=${i.name.en},name_vi=${i.name.vi},description_en=${i.description.en},description_vi=${i.description.vi},tag_en=${i.tag.en},tag_vi=${i.tag.vi},area=${i.area},property_type=${i.type},price=${i.price},currency=${i.currency},beds=${i.beds},baths=${i.baths},size_sqm=${i.size},map_x=${i.x},map_y=${i.y},featured=${i.featured},sort_order=${i.sortOrder},images_json=${JSON.stringify(i.images)},updated_at=CURRENT_TIMESTAMP WHERE id=${id} RETURNING *`; return rows[0] ? mapProperty(rows[0] as unknown as PropertyRow) : null; }
export async function deleteProperty(id: number) { await ensureDatabase(); const rows = await database()`DELETE FROM properties WHERE id=${id} RETURNING id`; return rows.length > 0; }
export function slugify(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0,80) || `property-${Date.now()}`; }
