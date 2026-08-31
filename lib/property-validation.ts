import { slugify } from '@/db/properties';
import type { PropertyInput, PropertyStatus, TransactionType } from '@/lib/property-types';

const statuses = new Set<PropertyStatus>(['draft', 'published', 'sold', 'rented', 'archived']);
const transactions = new Set<TransactionType>(['rent', 'sale']);

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function stringValue(value: unknown, label: string, max = 500): string {
  if (typeof value !== 'string') throw new ValidationError(`${label} is required.`);
  const clean = value.trim();
  if (!clean) throw new ValidationError(`${label} is required.`);
  if (clean.length > max) throw new ValidationError(`${label} is too long.`);
  return clean;
}

function optionalString(value: unknown, fallback = '', max = 2000): string {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, max);
}

function numberValue(value: unknown, label: string, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) throw new ValidationError(`${label} is invalid.`);
  return Math.round(parsed);
}

export function validatePropertyInput(value: unknown): PropertyInput {
  if (!value || typeof value !== 'object') throw new ValidationError('Invalid property data.');
  const body = value as Record<string, unknown>;
  const name = (body.name && typeof body.name === 'object' ? body.name : {}) as Record<string, unknown>;
  const description = (body.description && typeof body.description === 'object' ? body.description : {}) as Record<string, unknown>;
  const tag = (body.tag && typeof body.tag === 'object' ? body.tag : {}) as Record<string, unknown>;
  const nameEn = stringValue(name.en, 'English title', 120);
  const nameVi = stringValue(name.vi, 'Vietnamese title', 120);
  const transactionType = transactions.has(body.transactionType as TransactionType) ? body.transactionType as TransactionType : 'sale';
  const status = statuses.has(body.status as PropertyStatus) ? body.status as PropertyStatus : 'draft';
  const images = Array.isArray(body.images)
    ? body.images.filter((item): item is string => typeof item === 'string' && (/^\/[^/]/.test(item) || /^https:\/\//.test(item))).slice(0, 12)
    : [];
  if (status === 'published' && images.length === 0) throw new ValidationError('Add at least one image before publishing.');

  return {
    slug: slugify(optionalString(body.slug, nameEn, 100)),
    transactionType,
    status,
    images,
    name: { en: nameEn, vi: nameVi },
    description: {
      en: optionalString(description.en, 'A carefully selected property in Da Nang.', 2000),
      vi: optionalString(description.vi, 'Bất động sản được tuyển chọn kỹ tại Đà Nẵng.', 2000),
    },
    tag: { en: optionalString(tag.en, 'New', 50), vi: optionalString(tag.vi, 'Mới', 50) },
    area: stringValue(body.area, 'Area', 80),
    type: stringValue(body.type, 'Property type', 60),
    price: numberValue(body.price, 'Price', 0, 1000000000000),
    currency: optionalString(body.currency, 'VND', 6).toUpperCase(),
    beds: numberValue(body.beds, 'Bedrooms', 0, 50),
    baths: numberValue(body.baths, 'Bathrooms', 0, 50),
    size: numberValue(body.size, 'Size', 1, 100000),
    x: numberValue(body.x, 'Map X position', 0, 100),
    y: numberValue(body.y, 'Map Y position', 0, 100),
    featured: Boolean(body.featured),
    sortOrder: numberValue(body.sortOrder ?? 0, 'Sort order', 0, 100000),
  };
}
