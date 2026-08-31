export type Language = 'en' | 'vi';
export type TransactionType = 'rent' | 'sale';
export type PropertyStatus = 'draft' | 'published' | 'sold' | 'rented' | 'archived';

export type LocalizedText = {
  en: string;
  vi: string;
};

export type PropertyRecord = {
  id: number;
  slug: string;
  transactionType: TransactionType;
  status: PropertyStatus;
  images: string[];
  name: LocalizedText;
  description: LocalizedText;
  tag: LocalizedText;
  area: string;
  type: string;
  price: number;
  currency: string;
  beds: number;
  baths: number;
  size: number;
  x: number;
  y: number;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PropertyInput = Omit<PropertyRecord, 'id' | 'createdAt' | 'updatedAt'>;
