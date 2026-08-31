import { env } from 'cloudflare:workers';
import type { PropertyInput, PropertyRecord, PropertyStatus, TransactionType } from '@/lib/property-types';

type RuntimeEnv = { DB?: D1Database };

type PropertyRow = {
  id: number;
  slug: string;
  transaction_type: TransactionType;
  status: PropertyStatus;
  name_en: string;
  name_vi: string;
  description_en: string;
  description_vi: string;
  tag_en: string;
  tag_vi: string;
  area: string;
  property_type: string;
  price: number;
  currency: string;
  beds: number;
  baths: number;
  size_sqm: number;
  map_x: number;
  map_y: number;
  featured: number;
  sort_order: number;
  images_json: string;
  created_at: string;
  updated_at: string;
};

const seedProperties: Array<PropertyInput & { id: number }> = [
  { id: 1, slug: 'oceanview-residence', transactionType: 'rent', status: 'published', images: ['/luxury/property-1-balcony.webp', '/luxury/property-1-bedroom.webp', '/property-1.jpg'], name: { en: 'Oceanview Residence', vi: 'Căn hộ view biển' }, description: { en: 'A light-filled coastal residence with a private balcony and effortless access to My Khe Beach.', vi: 'Căn hộ ven biển ngập tràn ánh sáng với ban công riêng và lối đi thuận tiện ra biển Mỹ Khê.' }, area: 'My Khe Beach', type: 'Apartment', price: 18000000, currency: 'VND', beds: 2, baths: 2, size: 82, tag: { en: 'Featured', vi: 'Nổi bật' }, x: 74, y: 34, featured: true, sortOrder: 10 },
  { id: 2, slug: 'han-river-suite', transactionType: 'rent', status: 'published', images: ['/luxury/property-2-living.webp', '/luxury/property-2-bedroom.webp', '/property-2.jpg'], name: { en: 'The Han River Suite', vi: 'Căn hộ sông Hàn' }, description: { en: 'A refined city suite with river views, modern furnishings and a calm central address.', vi: 'Căn hộ thành phố tinh tế với tầm nhìn ra sông, nội thất hiện đại và vị trí trung tâm yên tĩnh.' }, area: 'Hai Chau', type: 'Apartment', price: 15000000, currency: 'VND', beds: 1, baths: 1, size: 56, tag: { en: 'River view', vi: 'View sông' }, x: 45, y: 48, featured: false, sortOrder: 20 },
  { id: 3, slug: 'an-thuong-garden-home', transactionType: 'rent', status: 'published', images: ['/luxury/property-3-courtyard.webp', '/luxury/property-3-living.webp', '/property-3.jpg'], name: { en: 'An Thuong Garden Home', vi: 'Nhà vườn An Thượng' }, description: { en: 'A generous garden home created for relaxed long stays near the cafés and coastline of An Thuong.', vi: 'Ngôi nhà vườn rộng rãi dành cho cuộc sống dài hạn thư thái gần các quán cà phê và bờ biển An Thượng.' }, area: 'Ngu Hanh Son', type: 'House', price: 22000000, currency: 'VND', beds: 3, baths: 3, size: 140, tag: { en: 'New', vi: 'Mới' }, x: 64, y: 72, featured: true, sortOrder: 30 },
  { id: 4, slug: 'son-tra-urban-studio', transactionType: 'rent', status: 'published', images: ['/luxury/property-4-studio.webp', '/luxury/property-4-bedroom.webp', '/property-4.jpg'], name: { en: 'Son Tra Urban Studio', vi: 'Studio đô thị Sơn Trà' }, description: { en: 'A compact, carefully planned studio close to the beach and Son Tra’s everyday conveniences.', vi: 'Studio nhỏ gọn, bố trí hợp lý, gần biển và các tiện ích hàng ngày của Sơn Trà.' }, area: 'Son Tra', type: 'Apartment', price: 9500000, currency: 'VND', beds: 1, baths: 1, size: 45, tag: { en: 'Near beach', vi: 'Gần biển' }, x: 82, y: 19, featured: false, sortOrder: 40 },
  { id: 5, slug: 'palm-courtyard-villa', transactionType: 'rent', status: 'published', images: ['/luxury/property-5-pool.webp', '/luxury/property-5-living.webp', '/property-5.jpg'], name: { en: 'Palm Courtyard Villa', vi: 'Biệt thự Palm Courtyard' }, description: { en: 'A private tropical villa with generous social spaces, a secluded pool and four serene bedrooms.', vi: 'Biệt thự nhiệt đới riêng tư với không gian sinh hoạt rộng, hồ bơi kín đáo và bốn phòng ngủ yên bình.' }, area: 'Ngu Hanh Son', type: 'Villa', price: 38000000, currency: 'VND', beds: 4, baths: 4, size: 260, tag: { en: 'Private pool', vi: 'Hồ bơi riêng' }, x: 55, y: 84, featured: true, sortOrder: 50 },
  { id: 6, slug: 'my-khe-sky-residence', transactionType: 'rent', status: 'published', images: ['/luxury/property-6-living.webp', '/luxury/property-6-bath.webp', '/property-6.jpg'], name: { en: 'My Khe Sky Residence', vi: 'Căn hộ My Khe Sky' }, description: { en: 'An elevated two-bedroom residence with broad sea views and polished contemporary interiors.', vi: 'Căn hộ hai phòng ngủ trên cao với tầm nhìn biển rộng và nội thất hiện đại tinh tế.' }, area: 'My Khe Beach', type: 'Apartment', price: 27000000, currency: 'VND', beds: 2, baths: 2, size: 96, tag: { en: 'Sea view', vi: 'View biển' }, x: 78, y: 55, featured: true, sortOrder: 60 },
];

function getBinding(): D1Database {
  const db = (env as unknown as RuntimeEnv).DB;
  if (!db) throw new Error('Cloudflare D1 binding `DB` is unavailable.');
  return db;
}

let initialized: Promise<void> | null = null;

export function ensureDatabase(): Promise<void> {
  initialized ??= initializeDatabase().catch((error) => {
    initialized = null;
    throw error;
  });
  return initialized;
}

async function initializeDatabase() {
  const db = getBinding();
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      transaction_type TEXT NOT NULL DEFAULT 'rent' CHECK(transaction_type IN ('rent','sale')),
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','sold','rented','archived')),
      name_en TEXT NOT NULL,
      name_vi TEXT NOT NULL,
      description_en TEXT NOT NULL DEFAULT '',
      description_vi TEXT NOT NULL DEFAULT '',
      tag_en TEXT NOT NULL DEFAULT 'New',
      tag_vi TEXT NOT NULL DEFAULT 'Mới',
      area TEXT NOT NULL,
      property_type TEXT NOT NULL,
      price INTEGER NOT NULL CHECK(price >= 0),
      currency TEXT NOT NULL DEFAULT 'VND',
      beds INTEGER NOT NULL DEFAULT 1 CHECK(beds >= 0),
      baths INTEGER NOT NULL DEFAULT 1 CHECK(baths >= 0),
      size_sqm INTEGER NOT NULL DEFAULT 1 CHECK(size_sqm > 0),
      map_x INTEGER NOT NULL DEFAULT 50 CHECK(map_x BETWEEN 0 AND 100),
      map_y INTEGER NOT NULL DEFAULT 50 CHECK(map_y BETWEEN 0 AND 100),
      featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0,1)),
      sort_order INTEGER NOT NULL DEFAULT 0,
      images_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_properties_public_order
      ON properties(status, transaction_type, sort_order)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS site_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`),
  ]);

  const seedState = await db.prepare("SELECT value FROM site_meta WHERE key = 'seed_version'").first<{ value: string }>();
  if (seedState) return;

  const inserts = seedProperties.map((property) => db.prepare(`INSERT OR IGNORE INTO properties (
    id, slug, transaction_type, status, name_en, name_vi, description_en, description_vi,
    tag_en, tag_vi, area, property_type, price, currency, beds, baths, size_sqm,
    map_x, map_y, featured, sort_order, images_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(property.id, property.slug, property.transactionType, property.status, property.name.en, property.name.vi,
      property.description.en, property.description.vi, property.tag.en, property.tag.vi, property.area,
      property.type, property.price, property.currency, property.beds, property.baths, property.size,
      property.x, property.y, property.featured ? 1 : 0, property.sortOrder, JSON.stringify(property.images)));
  inserts.push(db.prepare("INSERT OR REPLACE INTO site_meta (key, value) VALUES ('seed_version', '1')"));
  await db.batch(inserts);
  await db.prepare('PRAGMA optimize').run();
}

function mapProperty(row: PropertyRow): PropertyRecord {
  let images: string[] = [];
  try {
    const parsed = JSON.parse(row.images_json);
    if (Array.isArray(parsed)) images = parsed.filter((value): value is string => typeof value === 'string' && value.length > 0);
  } catch { /* malformed legacy image data becomes an empty gallery */ }
  return {
    id: row.id,
    slug: row.slug,
    transactionType: row.transaction_type,
    status: row.status,
    images,
    name: { en: row.name_en, vi: row.name_vi },
    description: { en: row.description_en, vi: row.description_vi },
    tag: { en: row.tag_en, vi: row.tag_vi },
    area: row.area,
    type: row.property_type,
    price: row.price,
    currency: row.currency,
    beds: row.beds,
    baths: row.baths,
    size: row.size_sqm,
    x: row.map_x,
    y: row.map_y,
    featured: Boolean(row.featured),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProperties(options: { publishedOnly?: boolean } = {}): Promise<PropertyRecord[]> {
  await ensureDatabase();
  const db = getBinding();
  const query = options.publishedOnly
    ? "SELECT * FROM properties WHERE status = 'published' ORDER BY featured DESC, sort_order ASC, id ASC"
    : 'SELECT * FROM properties ORDER BY sort_order ASC, id ASC';
  const result = await db.prepare(query).all<PropertyRow>();
  return (result.results ?? []).map(mapProperty);
}

export async function getProperty(id: number): Promise<PropertyRecord | null> {
  await ensureDatabase();
  const row = await getBinding().prepare('SELECT * FROM properties WHERE id = ?').bind(id).first<PropertyRow>();
  return row ? mapProperty(row) : null;
}

export async function createProperty(input: PropertyInput): Promise<PropertyRecord> {
  await ensureDatabase();
  const db = getBinding();
  const result = await db.prepare(`INSERT INTO properties (
    slug, transaction_type, status, name_en, name_vi, description_en, description_vi,
    tag_en, tag_vi, area, property_type, price, currency, beds, baths, size_sqm,
    map_x, map_y, featured, sort_order, images_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(input.slug, input.transactionType, input.status, input.name.en, input.name.vi,
      input.description.en, input.description.vi, input.tag.en, input.tag.vi, input.area, input.type,
      input.price, input.currency, input.beds, input.baths, input.size, input.x, input.y,
      input.featured ? 1 : 0, input.sortOrder, JSON.stringify(input.images)).run();
  const created = await getProperty(Number(result.meta.last_row_id));
  if (!created) throw new Error('Property could not be reloaded after creation.');
  return created;
}

export async function updateProperty(id: number, input: PropertyInput): Promise<PropertyRecord | null> {
  await ensureDatabase();
  await getBinding().prepare(`UPDATE properties SET
    slug = ?, transaction_type = ?, status = ?, name_en = ?, name_vi = ?,
    description_en = ?, description_vi = ?, tag_en = ?, tag_vi = ?, area = ?,
    property_type = ?, price = ?, currency = ?, beds = ?, baths = ?, size_sqm = ?,
    map_x = ?, map_y = ?, featured = ?, sort_order = ?, images_json = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`)
    .bind(input.slug, input.transactionType, input.status, input.name.en, input.name.vi,
      input.description.en, input.description.vi, input.tag.en, input.tag.vi, input.area, input.type,
      input.price, input.currency, input.beds, input.baths, input.size, input.x, input.y,
      input.featured ? 1 : 0, input.sortOrder, JSON.stringify(input.images), id).run();
  return getProperty(id);
}

export async function deleteProperty(id: number): Promise<boolean> {
  await ensureDatabase();
  const result = await getBinding().prepare('DELETE FROM properties WHERE id = ?').bind(id).run();
  return Number(result.meta.changes ?? 0) > 0;
}

export function slugify(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || `property-${Date.now()}`;
}
