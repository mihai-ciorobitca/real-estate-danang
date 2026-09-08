'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BedDouble, Bath, Maximize, Heart } from 'lucide-react';
import type { PropertyRecord } from '@/lib/property-types';

type Props = { property: PropertyRecord; language: 'en' | 'vi'; index: number; saved: boolean; onSave: () => void; onOpen: () => void };

export default function PropertyCard({ property, language, index, saved, onSave, onOpen }: Props) {
  const [photo, setPhoto] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const images = property.images.length ? property.images : ['/hero.jpg'];
  const current = photo % images.length;
  const en = language === 'en';
  const turn = (direction: number) => setPhoto((value) => (value + direction + images.length) % images.length);
  const type = en ? property.type : ({ Apartment: 'Căn hộ', Villa: 'Biệt thự', House: 'Nhà' }[property.type] || property.type);

  return <article className={`property-card ${index === 0 ? 'lead-property' : ''}`} data-reveal>
    <div className="property-image" onTouchStart={(event) => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={(event) => {
      if (!touch.current) return;
      const dx = event.changedTouches[0].clientX - touch.current.x;
      const dy = event.changedTouches[0].clientY - touch.current.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) turn(dx < 0 ? 1 : -1);
      touch.current = null;
    }}>
      <button className="card-photo-open" onClick={onOpen} aria-label={`${en ? 'View' : 'Xem'} ${property.name[language]}`}>
        <img key={images[current]} loading="lazy" decoding="async" className="property-primary" src={images[current]} alt={`${property.name[language]} — ${current + 1}`} />
      </button>
      {property.tag[language] && <span className="property-tag">{property.tag[language]}</span>}
      <button className={`favorite-button ${saved ? 'active' : ''}`} onClick={onSave} aria-label={en ? (saved ? 'Remove saved home' : 'Save home') : (saved ? 'Bỏ khỏi danh sách' : 'Lưu căn này')} aria-pressed={saved}><Heart size={19} /></button>
      {images.length > 1 && <div className="card-gallery-bar">
        <button onClick={() => turn(-1)} aria-label={en ? 'Previous photo' : 'Ảnh trước'}><ArrowLeft size={18} /></button>
        <span aria-live="polite">{String(current + 1).padStart(2, '0')}<i />{String(images.length).padStart(2, '0')}</span>
        <button onClick={() => turn(1)} aria-label={en ? 'Next photo' : 'Ảnh sau'}><ArrowRight size={18} /></button>
      </div>}
    </div>
    <div className="property-body">
      <p className="property-place">{property.area}<span> / </span>{type}</p>
      <h3><button onClick={onOpen}>{property.name[language]}</button></h3>
      {index === 0 && <p className="property-description">{property.description[language]}</p>}
      <div className="property-meta"><span><BedDouble />{property.beds} {en ? 'beds' : 'phòng ngủ'}</span><span><Bath />{property.baths} {en ? 'baths' : 'phòng tắm'}</span><span><Maximize />{property.size} m²</span></div>
      <div className="card-bottom"><p className="price">{new Intl.NumberFormat('vi-VN').format(property.price)} ₫<small>{property.transactionType === 'rent' ? (en ? 'per month' : 'mỗi tháng') : (en ? 'for sale' : 'đang bán')}</small></p><button className="quick-view-button" onClick={onOpen}><span>{en ? 'Explore home' : 'Khám phá'}</span><ArrowUpRight size={20} /></button></div>
    </div>
  </article>;
}
