'use client';

import { useMemo, useState } from 'react';

type Language = 'en' | 'vi';

const properties = [
  { id: 1, image: '/property-1.jpg', name: { en: 'Oceanview Residence', vi: 'Căn hộ view biển' }, area: 'My Khe Beach', type: 'Apartment', price: 18000000, beds: 2, baths: 2, size: 82, tag: { en: 'Featured', vi: 'Nổi bật' } },
  { id: 2, image: '/property-2.jpg', name: { en: 'The Han River Suite', vi: 'Căn hộ sông Hàn' }, area: 'Hai Chau', type: 'Apartment', price: 15000000, beds: 1, baths: 1, size: 56, tag: { en: 'River view', vi: 'View sông' } },
  { id: 3, image: '/property-3.jpg', name: { en: 'An Thuong Garden Home', vi: 'Nhà vườn An Thượng' }, area: 'Ngu Hanh Son', type: 'House', price: 22000000, beds: 3, baths: 3, size: 140, tag: { en: 'New', vi: 'Mới' } },
  { id: 4, image: '/property-4.jpg', name: { en: 'Son Tra Urban Studio', vi: 'Studio đô thị Sơn Trà' }, area: 'Son Tra', type: 'Apartment', price: 9500000, beds: 1, baths: 1, size: 45, tag: { en: 'Near beach', vi: 'Gần biển' } },
  { id: 5, image: '/property-5.jpg', name: { en: 'Palm Courtyard Villa', vi: 'Biệt thự Palm Courtyard' }, area: 'Ngu Hanh Son', type: 'Villa', price: 38000000, beds: 4, baths: 4, size: 260, tag: { en: 'Private pool', vi: 'Hồ bơi riêng' } },
  { id: 6, image: '/property-6.jpg', name: { en: 'My Khe Sky Residence', vi: 'Căn hộ My Khe Sky' }, area: 'My Khe Beach', type: 'Apartment', price: 27000000, beds: 2, baths: 2, size: 96, tag: { en: 'Sea view', vi: 'View biển' } },
];

const copy = {
  en: {
    nav: ['Properties', 'Services', 'About', 'Contact'], cta: 'Find a home', eyebrow: 'MONTHLY & LONG-TERM RENTALS · DA NANG',
    titleA: 'Find your place', titleB: 'by the sea.', hero: 'Handpicked apartments, villas and homes for foreigners — with local support from viewing to move-in.',
    location: 'Location', allLocations: 'All of Da Nang', propertyType: 'Property type', anyProperty: 'Any property', budget: 'Monthly budget', anyBudget: 'Any budget', explore: 'Explore homes',
    scroll: 'Scroll to explore', collectionEyebrow: 'CURATED FOR COASTAL LIVING', collectionTitle: 'Homes that feel right.', collectionCopy: 'Every listing is carefully selected for comfort, location and a smooth long-term stay.', homesFound: 'homes available', noHomes: 'No homes match these filters.', reset: 'Reset filters',
    perMonth: '/ month', beds: 'beds', baths: 'baths', view: 'View details', apartment: 'Apartment', villa: 'Villa', house: 'House', under10: 'Under 10M VND', from10: '10M–20M VND', over20: '20M+ VND',
    serviceEyebrow: 'LOCAL KNOWLEDGE, PERSONAL CARE', serviceTitle: 'Everything you need to move with confidence.',
    services: [
      ['01', 'Curated homes', 'Verified long-term rentals selected around your lifestyle, budget and preferred neighbourhood.'],
      ['02', 'Personal viewings', 'Fast, flexible viewings with an English- and Vietnamese-speaking local property partner.'],
      ['03', 'Move-in support', 'Clear lease guidance, utility setup and responsive local support after you receive the keys.'],
    ],
    aboutEyebrow: 'YOUR TRUSTED PROPERTY PARTNER', aboutTitle: 'Local expertise. International understanding.', aboutCopy: 'We help foreigners find a comfortable home in Da Nang without the stress. From the first message to the final handover, you have one local contact who understands the city and your needs.', call: 'Call us', whatsapp: 'WhatsApp', zalo: 'Zalo',
    stats: [['6K+', 'Facebook followers'], ['EN · VI', 'Bilingual support'], ['1', 'Dedicated local contact']],
    contactEyebrow: 'LET’S FIND YOUR DA NANG HOME', contactTitle: 'Tell us what you’re looking for.', contactCopy: 'Share your preferred area, budget and move-in date. We’ll send you a tailored shortlist of available homes.', contactCta: 'Message on WhatsApp', phoneCta: 'Call +84 98 254 59 57', footer: 'Monthly & long-term rentals for foreigners in Da Nang.', rights: 'All rights reserved.',
  },
  vi: {
    nav: ['Bất động sản', 'Dịch vụ', 'Giới thiệu', 'Liên hệ'], cta: 'Tìm nhà', eyebrow: 'THUÊ THEO THÁNG & DÀI HẠN · ĐÀ NẴNG',
    titleA: 'Tìm ngôi nhà', titleB: 'bên bờ biển.', hero: 'Căn hộ, biệt thự và nhà ở được tuyển chọn dành cho người nước ngoài — hỗ trợ địa phương từ lúc xem nhà đến khi dọn vào.',
    location: 'Khu vực', allLocations: 'Toàn Đà Nẵng', propertyType: 'Loại bất động sản', anyProperty: 'Tất cả loại hình', budget: 'Ngân sách / tháng', anyBudget: 'Mọi ngân sách', explore: 'Khám phá nhà',
    scroll: 'Cuộn để khám phá', collectionEyebrow: 'TUYỂN CHỌN CHO CUỘC SỐNG VEN BIỂN', collectionTitle: 'Nơi ở thật sự phù hợp.', collectionCopy: 'Mỗi bất động sản đều được chọn kỹ về sự thoải mái, vị trí và trải nghiệm thuê dài hạn thuận tiện.', homesFound: 'căn đang có sẵn', noHomes: 'Không có căn phù hợp với bộ lọc này.', reset: 'Xóa bộ lọc',
    perMonth: '/ tháng', beds: 'phòng ngủ', baths: 'phòng tắm', view: 'Xem chi tiết', apartment: 'Căn hộ', villa: 'Biệt thự', house: 'Nhà', under10: 'Dưới 10 triệu', from10: '10–20 triệu', over20: 'Trên 20 triệu',
    serviceEyebrow: 'AM HIỂU ĐỊA PHƯƠNG, HỖ TRỢ TẬN TÂM', serviceTitle: 'Mọi điều bạn cần để an tâm chuyển đến.',
    services: [
      ['01', 'Nhà ở tuyển chọn', 'Bất động sản dài hạn đã xác minh, phù hợp với lối sống, ngân sách và khu vực bạn mong muốn.'],
      ['02', 'Xem nhà riêng', 'Lịch xem nhà nhanh, linh hoạt với đối tác địa phương nói tiếng Anh và tiếng Việt.'],
      ['03', 'Hỗ trợ dọn vào', 'Hướng dẫn hợp đồng rõ ràng, thiết lập tiện ích và hỗ trợ nhanh sau khi nhận chìa khóa.'],
    ],
    aboutEyebrow: 'ĐỐI TÁC BẤT ĐỘNG SẢN ĐÁNG TIN CẬY', aboutTitle: 'Am hiểu địa phương. Thấu hiểu quốc tế.', aboutCopy: 'Chúng tôi giúp người nước ngoài tìm nơi ở thoải mái tại Đà Nẵng mà không gặp áp lực. Từ tin nhắn đầu tiên đến lúc bàn giao, bạn có một người liên hệ địa phương hiểu thành phố và nhu cầu của bạn.', call: 'Gọi ngay', whatsapp: 'WhatsApp', zalo: 'Zalo',
    stats: [['6K+', 'Người theo dõi Facebook'], ['EN · VI', 'Hỗ trợ song ngữ'], ['1', 'Đầu mối địa phương riêng']],
    contactEyebrow: 'CÙNG TÌM NGÔI NHÀ TẠI ĐÀ NẴNG', contactTitle: 'Hãy cho chúng tôi biết bạn cần gì.', contactCopy: 'Chia sẻ khu vực, ngân sách và ngày dọn vào. Chúng tôi sẽ gửi danh sách nhà phù hợp đang có sẵn.', contactCta: 'Nhắn qua WhatsApp', phoneCta: 'Gọi +84 98 254 59 57', footer: 'Căn hộ, nhà và biệt thự cho người nước ngoài thuê theo tháng và dài hạn tại Đà Nẵng.', rights: 'Đã đăng ký bản quyền.',
  },
};

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [location, setLocation] = useState('all');
  const [type, setType] = useState('all');
  const [budget, setBudget] = useState('all');
  const t = copy[language];

  const filtered = useMemo(() => properties.filter((property) => {
    const locationMatch = location === 'all' || property.area === location;
    const typeMatch = type === 'all' || property.type === type;
    const budgetMatch = budget === 'all' || (budget === 'under' && property.price < 10000000) || (budget === 'mid' && property.price >= 10000000 && property.price <= 20000000) || (budget === 'high' && property.price > 20000000);
    return locationMatch && typeMatch && budgetMatch;
  }), [location, type, budget]);

  const formatPrice = (price: number) => `${new Intl.NumberFormat('vi-VN').format(price)} ₫`;
  const clearFilters = () => { setLocation('all'); setType('all'); setBudget('all'); };

  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-shade" />
        <nav className="nav shell" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="Da Nang Real Estate home">
            <img src="/brand-logo.png" alt="Da Nang Real Estate" />
            <span><strong>DA NANG</strong><small>REAL ESTATE</small></span>
          </a>
          <div className="navlinks">
            <a href="#properties">{t.nav[0]}</a><a href="#services">{t.nav[1]}</a><a href="#about">{t.nav[2]}</a><a href="#contact">{t.nav[3]}</a>
          </div>
          <div className="nav-actions">
            <button className="language" onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')} type="button" aria-label="Switch language"><span className={language === 'en' ? 'active' : ''}>EN</span><i /> <span className={language === 'vi' ? 'active' : ''}>VI</span></button>
            <a className="nav-cta" href="#contact">{t.cta}</a>
          </div>
        </nav>
        <div className="hero-content shell">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.titleA}<br /><em>{t.titleB}</em></h1>
          <p className="hero-copy">{t.hero}</p>
          <div className="searchbar" role="search" aria-label="Property search">
            <label><span>{t.location}</span><select value={location} onChange={(e) => setLocation(e.target.value)} aria-label={t.location}><option value="all">{t.allLocations}</option><option>My Khe Beach</option><option>Son Tra</option><option>Hai Chau</option><option>Ngu Hanh Son</option></select></label>
            <label><span>{t.propertyType}</span><select value={type} onChange={(e) => setType(e.target.value)} aria-label={t.propertyType}><option value="all">{t.anyProperty}</option><option value="Apartment">{t.apartment}</option><option value="Villa">{t.villa}</option><option value="House">{t.house}</option></select></label>
            <label><span>{t.budget}</span><select value={budget} onChange={(e) => setBudget(e.target.value)} aria-label={t.budget}><option value="all">{t.anyBudget}</option><option value="under">{t.under10}</option><option value="mid">{t.from10}</option><option value="high">{t.over20}</option></select></label>
            <a className="search-button" href="#properties">{t.explore}<span aria-hidden="true">→</span></a>
          </div>
        </div>
        <p className="hero-note">{t.scroll}<span aria-hidden="true">↓</span></p>
      </section>

      <section className="collection" id="properties">
        <div className="shell">
          <header className="section-heading split-heading"><div><p className="eyebrow dark">{t.collectionEyebrow}</p><h2>{t.collectionTitle}</h2></div><p>{t.collectionCopy}</p></header>
          <div className="results-row"><span><strong>{String(filtered.length).padStart(2, '0')}</strong> {t.homesFound}</span>{(location !== 'all' || type !== 'all' || budget !== 'all') && <button onClick={clearFilters}>{t.reset} ×</button>}</div>
          {filtered.length ? <div className="property-grid">{filtered.map((property, index) => <article className="property-card" key={property.id}>
            <div className="property-image"><img src={property.image} alt={property.name[language]} /><span className="property-tag">{property.tag[language]}</span><span className="property-count">0{index + 1}</span></div>
            <div className="property-body"><p className="property-place">{property.area} · {language === 'en' ? property.type : property.type === 'Apartment' ? t.apartment : property.type === 'Villa' ? t.villa : t.house}</p><h3>{property.name[language]}</h3><p className="price">{formatPrice(property.price)} <small>{t.perMonth}</small></p><div className="property-meta"><span>⌂ {property.beds} {t.beds}</span><span>◫ {property.baths} {t.baths}</span><span>↔ {property.size} m²</span></div><a href="#contact">{t.view}<span>↗</span></a></div>
          </article>)}</div> : <div className="empty-state"><p>{t.noHomes}</p><button onClick={clearFilters}>{t.reset}</button></div>}
        </div>
      </section>

      <section className="services" id="services">
        <div className="shell"><header className="section-heading split-heading light"><div><p className="eyebrow">{t.serviceEyebrow}</p><h2>{t.serviceTitle}</h2></div><p>{language === 'en' ? 'A straightforward rental experience, built around clear communication and dependable local help.' : 'Trải nghiệm thuê nhà đơn giản với giao tiếp rõ ràng và hỗ trợ địa phương đáng tin cậy.'}</p></header>
          <div className="service-grid">{t.services.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-image"><img src="/hero.jpg" alt="Da Nang skyline and Dragon Bridge" /><div className="roundel"><img src="/brand-logo.png" alt="" /><span>DA NANG<br />REAL ESTATE</span></div></div>
        <div className="about-copy"><p className="eyebrow dark">{t.aboutEyebrow}</p><h2>{t.aboutTitle}</h2><p>{t.aboutCopy}</p><div className="about-actions"><a href="tel:+84982545957">{t.call}<span>↗</span></a><a href="https://wa.me/84982545957" target="_blank" rel="noreferrer">{t.whatsapp}<span>↗</span></a><a href="https://zalo.me/84982545957" target="_blank" rel="noreferrer">{t.zalo}<span>↗</span></a></div></div>
      </section>

      <section className="stats"><div className="shell stats-grid">{t.stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>

      <section className="contact" id="contact"><div className="contact-bg" /><div className="shell contact-inner"><p className="eyebrow">{t.contactEyebrow}</p><h2>{t.contactTitle}</h2><p>{t.contactCopy}</p><div className="contact-actions"><a className="gold-button" href="https://wa.me/84982545957" target="_blank" rel="noreferrer">{t.contactCta}<span>→</span></a><a className="text-link" href="tel:+84982545957">{t.phoneCta}<span>↗</span></a></div></div></section>

      <footer><div className="shell footer-main"><a className="brand footer-brand" href="#top"><img src="/brand-logo.png" alt="Da Nang Real Estate" /><span><strong>DA NANG</strong><small>REAL ESTATE</small></span></a><p>{t.footer}</p><div><a href="#properties">{t.nav[0]}</a><a href="#services">{t.nav[1]}</a><a href="#about">{t.nav[2]}</a><a href="#contact">{t.nav[3]}</a></div></div><div className="shell footer-bottom"><span>© 2026 Da Nang Real Estate. {t.rights}</span><a href="tel:+84982545957">+84 98 254 59 57</a></div></footer>

      <a className="floating-contact" href="https://wa.me/84982545957" target="_blank" rel="noreferrer" aria-label="Message on WhatsApp">✦<span>{language === 'en' ? 'Message us' : 'Nhắn tin'}</span></a>
    </main>
  );
}
