'use client';

import { useEffect, useMemo, useState } from 'react';

type Language = 'en' | 'vi';
type ViewMode = 'grid' | 'map';

const properties = [
  { id: 1, image: '/property-1.jpg', name: { en: 'Oceanview Residence', vi: 'Căn hộ view biển' }, area: 'My Khe Beach', type: 'Apartment', price: 18000000, beds: 2, baths: 2, size: 82, tag: { en: 'Featured', vi: 'Nổi bật' }, x: 74, y: 34 },
  { id: 2, image: '/property-2.jpg', name: { en: 'The Han River Suite', vi: 'Căn hộ sông Hàn' }, area: 'Hai Chau', type: 'Apartment', price: 15000000, beds: 1, baths: 1, size: 56, tag: { en: 'River view', vi: 'View sông' }, x: 45, y: 48 },
  { id: 3, image: '/property-3.jpg', name: { en: 'An Thuong Garden Home', vi: 'Nhà vườn An Thượng' }, area: 'Ngu Hanh Son', type: 'House', price: 22000000, beds: 3, baths: 3, size: 140, tag: { en: 'New', vi: 'Mới' }, x: 64, y: 72 },
  { id: 4, image: '/property-4.jpg', name: { en: 'Son Tra Urban Studio', vi: 'Studio đô thị Sơn Trà' }, area: 'Son Tra', type: 'Apartment', price: 9500000, beds: 1, baths: 1, size: 45, tag: { en: 'Near beach', vi: 'Gần biển' }, x: 82, y: 19 },
  { id: 5, image: '/property-5.jpg', name: { en: 'Palm Courtyard Villa', vi: 'Biệt thự Palm Courtyard' }, area: 'Ngu Hanh Son', type: 'Villa', price: 38000000, beds: 4, baths: 4, size: 260, tag: { en: 'Private pool', vi: 'Hồ bơi riêng' }, x: 55, y: 84 },
  { id: 6, image: '/property-6.jpg', name: { en: 'My Khe Sky Residence', vi: 'Căn hộ My Khe Sky' }, area: 'My Khe Beach', type: 'Apartment', price: 27000000, beds: 2, baths: 2, size: 96, tag: { en: 'Sea view', vi: 'View biển' }, x: 78, y: 55 },
];

const copy = {
  en: {
    nav: ['Properties', 'Services', 'About', 'Contact'], cta: 'Find a home', eyebrow: 'MONTHLY & LONG-TERM RENTALS · DA NANG',
    titleA: 'Find your place', titleB: 'by the sea.', hero: 'Handpicked apartments, villas and homes for foreigners — with local support from viewing to move-in.',
    location: 'Location', allLocations: 'All of Da Nang', propertyType: 'Property type', anyProperty: 'Any property', budget: 'Monthly budget', anyBudget: 'Any budget', explore: 'Show homes',
    scroll: 'Scroll to explore', collectionEyebrow: 'CURATED FOR COASTAL LIVING', collectionTitle: 'Homes that feel right.', collectionCopy: 'Every listing is carefully selected for comfort, location and a smooth long-term stay.', homesFound: 'homes available', noHomes: 'No homes match these filters.', reset: 'Reset filters',
    perMonth: '/ month', beds: 'beds', baths: 'baths', view: 'Quick view', apartment: 'Apartment', villa: 'Villa', house: 'House', under10: 'Under 10M VND', from10: '10M–20M VND', over20: '20M+ VND',
    serviceEyebrow: 'LOCAL KNOWLEDGE, PERSONAL CARE', serviceTitle: 'Everything you need to move with confidence.',
    services: [['01', 'Curated homes', 'Verified long-term rentals selected around your lifestyle, budget and preferred neighbourhood.'], ['02', 'Personal viewings', 'Fast, flexible viewings with an English- and Vietnamese-speaking local property partner.'], ['03', 'Move-in support', 'Clear lease guidance, utility setup and responsive local support after you receive the keys.']],
    aboutEyebrow: 'YOUR TRUSTED PROPERTY PARTNER', aboutTitle: 'Local expertise. International understanding.', aboutCopy: 'We help foreigners find a comfortable home in Da Nang without the stress. From the first message to the final handover, you have one local contact who understands the city and your needs.', call: 'Call us', whatsapp: 'WhatsApp', zalo: 'Zalo',
    stats: [['6K+', 'Facebook followers'], ['EN · VI', 'Bilingual support'], ['1', 'Dedicated local contact']],
    contactEyebrow: 'LET’S FIND YOUR DA NANG HOME', contactTitle: 'Tell us what you’re looking for.', contactCopy: 'Share your preferred area, budget and move-in date. We’ll send you a tailored shortlist of available homes.', contactCta: 'Start guided search', phoneCta: 'Call +84 98 254 59 57', footer: 'Monthly & long-term rentals for foreigners in Da Nang.', rights: 'All rights reserved.',
  },
  vi: {
    nav: ['Bất động sản', 'Dịch vụ', 'Giới thiệu', 'Liên hệ'], cta: 'Tìm nhà', eyebrow: 'THUÊ THEO THÁNG & DÀI HẠN · ĐÀ NẴNG',
    titleA: 'Tìm ngôi nhà', titleB: 'bên bờ biển.', hero: 'Căn hộ, biệt thự và nhà ở được tuyển chọn dành cho người nước ngoài — hỗ trợ địa phương từ lúc xem nhà đến khi dọn vào.',
    location: 'Khu vực', allLocations: 'Toàn Đà Nẵng', propertyType: 'Loại bất động sản', anyProperty: 'Tất cả loại hình', budget: 'Ngân sách / tháng', anyBudget: 'Mọi ngân sách', explore: 'Xem nhà',
    scroll: 'Cuộn để khám phá', collectionEyebrow: 'TUYỂN CHỌN CHO CUỘC SỐNG VEN BIỂN', collectionTitle: 'Nơi ở thật sự phù hợp.', collectionCopy: 'Mỗi bất động sản đều được chọn kỹ về sự thoải mái, vị trí và trải nghiệm thuê dài hạn thuận tiện.', homesFound: 'căn đang có sẵn', noHomes: 'Không có căn phù hợp với bộ lọc này.', reset: 'Xóa bộ lọc',
    perMonth: '/ tháng', beds: 'phòng ngủ', baths: 'phòng tắm', view: 'Xem nhanh', apartment: 'Căn hộ', villa: 'Biệt thự', house: 'Nhà', under10: 'Dưới 10 triệu', from10: '10–20 triệu', over20: 'Trên 20 triệu',
    serviceEyebrow: 'AM HIỂU ĐỊA PHƯƠNG, HỖ TRỢ TẬN TÂM', serviceTitle: 'Mọi điều bạn cần để an tâm chuyển đến.',
    services: [['01', 'Nhà ở tuyển chọn', 'Bất động sản dài hạn đã xác minh, phù hợp với lối sống, ngân sách và khu vực bạn mong muốn.'], ['02', 'Xem nhà riêng', 'Lịch xem nhà nhanh, linh hoạt với đối tác địa phương nói tiếng Anh và tiếng Việt.'], ['03', 'Hỗ trợ dọn vào', 'Hướng dẫn hợp đồng rõ ràng, thiết lập tiện ích và hỗ trợ nhanh sau khi nhận chìa khóa.']],
    aboutEyebrow: 'ĐỐI TÁC BẤT ĐỘNG SẢN ĐÁNG TIN CẬY', aboutTitle: 'Am hiểu địa phương. Thấu hiểu quốc tế.', aboutCopy: 'Chúng tôi giúp người nước ngoài tìm nơi ở thoải mái tại Đà Nẵng mà không gặp áp lực. Từ tin nhắn đầu tiên đến lúc bàn giao, bạn có một người liên hệ địa phương hiểu thành phố và nhu cầu của bạn.', call: 'Gọi ngay', whatsapp: 'WhatsApp', zalo: 'Zalo',
    stats: [['6K+', 'Người theo dõi Facebook'], ['EN · VI', 'Hỗ trợ song ngữ'], ['1', 'Đầu mối địa phương riêng']],
    contactEyebrow: 'CÙNG TÌM NGÔI NHÀ TẠI ĐÀ NẴNG', contactTitle: 'Hãy cho chúng tôi biết bạn cần gì.', contactCopy: 'Chia sẻ khu vực, ngân sách và ngày dọn vào. Chúng tôi sẽ gửi danh sách nhà phù hợp đang có sẵn.', contactCta: 'Bắt đầu tìm nhà', phoneCta: 'Gọi +84 98 254 59 57', footer: 'Căn hộ, nhà và biệt thự cho người nước ngoài thuê theo tháng và dài hạn tại Đà Nẵng.', rights: 'Đã đăng ký bản quyền.',
  },
};

const interactionCopy = {
  en: { saved: 'Saved', menu: 'Menu', grid: 'Grid', map: 'Map', save: 'Save home', remove: 'Remove saved home', details: 'Property details', available: 'Available now', furnished: 'Fully furnished', wifi: 'High-speed Wi-Fi', support: 'Local support', viewing: 'Request a viewing', close: 'Close', previous: 'Previous photo', next: 'Next photo', savedTitle: 'Your saved homes', savedEmpty: 'Tap the heart on any home to save it here.', browse: 'Browse homes', guided: 'Personal home finder', step: 'Step', nextStep: 'Continue', back: 'Back', areaQuestion: 'Where would you like to live?', typeQuestion: 'What kind of home feels right?', moveQuestion: 'When are you planning to move?', summary: 'Your shortlist brief is ready.', send: 'Send brief on WhatsApp', flexible: 'I’m flexible', asap: 'As soon as possible', month: 'Within one month', later: 'Later', menuClose: 'Close menu', added: 'Home saved', removed: 'Removed from saved homes', mapHint: 'Select a marker to preview a home' },
  vi: { saved: 'Đã lưu', menu: 'Menu', grid: 'Lưới', map: 'Bản đồ', save: 'Lưu căn này', remove: 'Bỏ khỏi danh sách', details: 'Chi tiết bất động sản', available: 'Có thể vào ở ngay', furnished: 'Đầy đủ nội thất', wifi: 'Wi-Fi tốc độ cao', support: 'Hỗ trợ địa phương', viewing: 'Đặt lịch xem nhà', close: 'Đóng', previous: 'Ảnh trước', next: 'Ảnh sau', savedTitle: 'Nhà bạn đã lưu', savedEmpty: 'Nhấn biểu tượng trái tim để lưu căn nhà tại đây.', browse: 'Xem nhà', guided: 'Trợ lý tìm nhà riêng', step: 'Bước', nextStep: 'Tiếp tục', back: 'Quay lại', areaQuestion: 'Bạn muốn sống ở khu vực nào?', typeQuestion: 'Bạn đang tìm loại nhà nào?', moveQuestion: 'Khi nào bạn dự định chuyển vào?', summary: 'Yêu cầu tìm nhà của bạn đã sẵn sàng.', send: 'Gửi yêu cầu qua WhatsApp', flexible: 'Tôi linh hoạt', asap: 'Càng sớm càng tốt', month: 'Trong vòng một tháng', later: 'Muộn hơn', menuClose: 'Đóng menu', added: 'Đã lưu căn nhà', removed: 'Đã bỏ khỏi danh sách', mapHint: 'Chọn một điểm để xem nhanh căn nhà' },
};

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [location, setLocation] = useState('all');
  const [type, setType] = useState('all');
  const [budget, setBudget] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mapSelectedId, setMapSelectedId] = useState<number>(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizard, setWizard] = useState({ area: '', type: '', move: '' });
  const [toast, setToast] = useState('');
  const t = copy[language];
  const ui = interactionCopy[language];

  useEffect(() => {
    try {
      const storedFavorites = JSON.parse(localStorage.getItem('dnre-favorites') || '[]');
      const storedLanguage = localStorage.getItem('dnre-language') as Language | null;
      if (Array.isArray(storedFavorites)) setFavorites(storedFavorites);
      if (storedLanguage === 'en' || storedLanguage === 'vi') setLanguage(storedLanguage);
    } catch { /* keep safe defaults */ }
    setPreferencesReady(true);
  }, []);

  useEffect(() => {
    if (preferencesReady) localStorage.setItem('dnre-favorites', JSON.stringify(favorites));
  }, [favorites, preferencesReady]);

  useEffect(() => {
    if (preferencesReady) localStorage.setItem('dnre-language', language);
    document.documentElement.lang = language;
  }, [language, preferencesReady]);

  useEffect(() => {
    const modalOpen = selectedId !== null || savedOpen || wizardOpen || mobileMenu;
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setSelectedId(null); setSavedOpen(false); setWizardOpen(false); setMobileMenu(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [selectedId, savedOpen, wizardOpen, mobileMenu]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(() => properties.filter((property) => {
    const locationMatch = location === 'all' || property.area === location;
    const typeMatch = type === 'all' || property.type === type;
    const budgetMatch = budget === 'all' || (budget === 'under' && property.price < 10000000) || (budget === 'mid' && property.price >= 10000000 && property.price <= 20000000) || (budget === 'high' && property.price > 20000000);
    return locationMatch && typeMatch && budgetMatch;
  }), [location, type, budget]);

  const activeProperty = properties.find((property) => property.id === selectedId) || null;
  const mapProperty = filtered.find((property) => property.id === mapSelectedId) || filtered[0] || null;
  const savedProperties = properties.filter((property) => favorites.includes(property.id));
  const activeGallery = activeProperty ? [activeProperty.image, ...properties.filter((item) => item.id !== activeProperty.id).slice((activeProperty.id - 1) % 3, ((activeProperty.id - 1) % 3) + 2).map((item) => item.image)] : [];
  const formatPrice = (price: number) => `${new Intl.NumberFormat('vi-VN').format(price)} ₫`;
  const clearFilters = () => { setLocation('all'); setType('all'); setBudget('all'); };
  const openProperty = (id: number) => { setSelectedId(id); setGalleryIndex(0); };
  const toggleFavorite = (id: number) => {
    const isSaved = favorites.includes(id);
    setFavorites((current) => isSaved ? current.filter((item) => item !== id) : [...current, id]);
    setToast(isSaved ? ui.removed : ui.added);
  };
  const showResults = () => document.querySelector('#properties')?.scrollIntoView({ behavior: 'smooth' });
  const openWizard = () => { setWizardStep(1); setWizardOpen(true); };
  const wizardComplete = wizardStep === 4;
  const currentWizardValue = wizardStep === 1 ? wizard.area : wizardStep === 2 ? wizard.type : wizard.move;
  const wizardMessage = encodeURIComponent(language === 'en'
    ? `Hello, I am looking for a ${wizard.type || 'home'} in ${wizard.area || 'Da Nang'}. Move-in: ${wizard.move || 'flexible'}. Please send me suitable long-term rentals.`
    : `Xin chào, tôi đang tìm ${wizard.type || 'nhà ở'} tại ${wizard.area || 'Đà Nẵng'}. Thời gian chuyển vào: ${wizard.move || 'linh hoạt'}. Vui lòng gửi cho tôi các lựa chọn thuê dài hạn phù hợp.`);

  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-shade" />
        <nav className="nav shell" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="Da Nang Real Estate home"><img src="/brand-logo-v2.png" alt="Da Nang Real Estate emblem" /><span><strong>DA NANG</strong><small>REAL ESTATE</small></span></a>
          <div className="navlinks"><a href="#properties">{t.nav[0]}</a><a href="#services">{t.nav[1]}</a><a href="#about">{t.nav[2]}</a><a href="#contact">{t.nav[3]}</a></div>
          <div className="nav-actions">
            <button className="saved-nav" type="button" onClick={() => setSavedOpen(true)} data-testid="saved-button"><span aria-hidden="true">♡</span>{ui.saved}<b>{favorites.length}</b></button>
            <button className="language" onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')} type="button" aria-label="Switch language" data-testid="language-toggle"><span className={language === 'en' ? 'active' : ''}>EN</span><i /><span className={language === 'vi' ? 'active' : ''}>VI</span></button>
            <button className="nav-cta" type="button" onClick={openWizard}>{t.cta}</button>
            <button className="menu-button" type="button" onClick={() => setMobileMenu(true)} aria-label={ui.menu}><i /><i /></button>
          </div>
        </nav>
        <div className="hero-content shell">
          <p className="eyebrow">{t.eyebrow}</p><h1>{t.titleA}<br /><em>{t.titleB}</em></h1><p className="hero-copy">{t.hero}</p>
          <div className="searchbar" role="search" aria-label="Property search">
            <label><span>{t.location}</span><select value={location} onChange={(e) => setLocation(e.target.value)} aria-label={t.location}><option value="all">{t.allLocations}</option><option>My Khe Beach</option><option>Son Tra</option><option>Hai Chau</option><option>Ngu Hanh Son</option></select></label>
            <label><span>{t.propertyType}</span><select value={type} onChange={(e) => setType(e.target.value)} aria-label={t.propertyType}><option value="all">{t.anyProperty}</option><option value="Apartment">{t.apartment}</option><option value="Villa">{t.villa}</option><option value="House">{t.house}</option></select></label>
            <label><span>{t.budget}</span><select value={budget} onChange={(e) => setBudget(e.target.value)} aria-label={t.budget}><option value="all">{t.anyBudget}</option><option value="under">{t.under10}</option><option value="mid">{t.from10}</option><option value="high">{t.over20}</option></select></label>
            <button className="search-button" type="button" onClick={showResults}>{t.explore}<span>{String(filtered.length).padStart(2, '0')}</span></button>
          </div>
        </div>
        <p className="hero-note">{t.scroll}<span aria-hidden="true">↓</span></p>
      </section>

      <section className="collection" id="properties"><div className="shell">
        <header className="section-heading split-heading"><div><p className="eyebrow dark">{t.collectionEyebrow}</p><h2>{t.collectionTitle}</h2></div><p>{t.collectionCopy}</p></header>
        <div className="results-row"><span><strong>{String(filtered.length).padStart(2, '0')}</strong> {t.homesFound}</span><div className="results-actions">{(location !== 'all' || type !== 'all' || budget !== 'all') && <button onClick={clearFilters}>{t.reset} ×</button>}<div className="view-switch" aria-label="View style"><button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} aria-pressed={viewMode === 'grid'}>▦ {ui.grid}</button><button className={viewMode === 'map' ? 'active' : ''} onClick={() => setViewMode('map')} aria-pressed={viewMode === 'map'}>⌖ {ui.map}</button></div></div></div>

        {filtered.length === 0 ? <div className="empty-state"><p>{t.noHomes}</p><button onClick={clearFilters}>{t.reset}</button></div> : viewMode === 'grid' ?
          <div className="property-grid">{filtered.map((property, index) => <article className="property-card" key={property.id}>
            <div className="property-image"><img src={property.image} alt={property.name[language]} /><span className="property-tag">{property.tag[language]}</span><span className="property-count">0{index + 1}</span><button className={`favorite-button ${favorites.includes(property.id) ? 'active' : ''}`} type="button" onClick={() => toggleFavorite(property.id)} aria-label={favorites.includes(property.id) ? ui.remove : ui.save} aria-pressed={favorites.includes(property.id)}>♥</button></div>
            <div className="property-body"><p className="property-place">{property.area} · {language === 'en' ? property.type : property.type === 'Apartment' ? t.apartment : property.type === 'Villa' ? t.villa : t.house}</p><h3>{property.name[language]}</h3><p className="price">{formatPrice(property.price)} <small>{t.perMonth}</small></p><div className="property-meta"><span>⌂ {property.beds} {t.beds}</span><span>◫ {property.baths} {t.baths}</span><span>↔ {property.size} m²</span></div><button className="quick-view-button" type="button" onClick={() => openProperty(property.id)}>{t.view}<span>↗</span></button></div>
          </article>)}</div> :
          <div className="map-layout"><div className="property-map" aria-label="Da Nang property map"><div className="river" /><span className="map-label sea">EAST SEA</span><span className="map-label center">HAI CHAU</span><span className="map-label beach">MY KHE</span>{filtered.map((property) => <button key={property.id} type="button" className={`map-pin ${mapProperty?.id === property.id ? 'active' : ''}`} style={{ left: `${property.x}%`, top: `${property.y}%` }} onClick={() => setMapSelectedId(property.id)} aria-label={property.name[language]}><span>{property.price / 1000000}M</span></button>)}<p className="map-hint">⌖ {ui.mapHint}</p></div>{mapProperty && <article className="map-preview"><img src={mapProperty.image} alt={mapProperty.name[language]} /><div><p className="property-place">{mapProperty.area}</p><h3>{mapProperty.name[language]}</h3><p className="price">{formatPrice(mapProperty.price)} <small>{t.perMonth}</small></p><div className="property-meta"><span>⌂ {mapProperty.beds}</span><span>◫ {mapProperty.baths}</span><span>↔ {mapProperty.size} m²</span></div><button className="quick-view-button" onClick={() => openProperty(mapProperty.id)}>{t.view}<span>↗</span></button></div></article>}</div>}
      </div></section>

      <section className="services" id="services"><div className="shell"><header className="section-heading split-heading light"><div><p className="eyebrow">{t.serviceEyebrow}</p><h2>{t.serviceTitle}</h2></div><p>{language === 'en' ? 'A straightforward rental experience, built around clear communication and dependable local help.' : 'Trải nghiệm thuê nhà đơn giản với giao tiếp rõ ràng và hỗ trợ địa phương đáng tin cậy.'}</p></header><div className="service-grid">{t.services.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p><button type="button" onClick={openWizard} aria-label={`${title} — ${t.cta}`}>↗</button></article>)}</div></div></section>

      <section className="about" id="about"><div className="about-image"><img src="/hero.jpg" alt="Da Nang skyline and Dragon Bridge" /><div className="roundel"><img src="/brand-logo-v2.png" alt="" /><span>DA NANG<br />REAL ESTATE</span></div></div><div className="about-copy"><p className="eyebrow dark">{t.aboutEyebrow}</p><h2>{t.aboutTitle}</h2><p>{t.aboutCopy}</p><div className="about-actions"><a href="tel:+84982545957">{t.call}<span>↗</span></a><a href="https://wa.me/84982545957" target="_blank" rel="noreferrer">{t.whatsapp}<span>↗</span></a><a href="https://zalo.me/84982545957" target="_blank" rel="noreferrer">{t.zalo}<span>↗</span></a></div></div></section>
      <section className="stats"><div className="shell stats-grid">{t.stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>
      <section className="contact" id="contact"><div className="contact-bg" /><div className="shell contact-inner"><p className="eyebrow">{t.contactEyebrow}</p><h2>{t.contactTitle}</h2><p>{t.contactCopy}</p><div className="contact-actions"><button className="gold-button" type="button" onClick={openWizard}>{t.contactCta}<span>→</span></button><a className="text-link" href="tel:+84982545957">{t.phoneCta}<span>↗</span></a></div></div></section>
      <footer><div className="shell footer-main"><a className="brand footer-brand" href="#top"><img src="/brand-logo-v2.png" alt="Da Nang Real Estate" /><span><strong>DA NANG</strong><small>REAL ESTATE</small></span></a><p>{t.footer}</p><div><a href="#properties">{t.nav[0]}</a><a href="#services">{t.nav[1]}</a><a href="#about">{t.nav[2]}</a><a href="#contact">{t.nav[3]}</a></div></div><div className="shell footer-bottom"><span>© 2026 Da Nang Real Estate. {t.rights}</span><a href="tel:+84982545957">+84 98 254 59 57</a></div></footer>
      <a className="floating-contact" href="https://wa.me/84982545957" target="_blank" rel="noreferrer" aria-label="Message on WhatsApp">✦<span>{language === 'en' ? 'Message us' : 'Nhắn tin'}</span></a>

      {mobileMenu && <div className="mobile-menu" role="dialog" aria-modal="true" aria-label={ui.menu}><div className="mobile-menu-top"><a className="brand" href="#top" onClick={() => setMobileMenu(false)}><img src="/brand-logo-v2.png" alt="" /><span><strong>DA NANG</strong><small>REAL ESTATE</small></span></a><button type="button" onClick={() => setMobileMenu(false)} aria-label={ui.menuClose}>×</button></div><div className="mobile-links">{t.nav.map((label, index) => <a key={label} href={['#properties', '#services', '#about', '#contact'][index]} onClick={() => setMobileMenu(false)}><span>0{index + 1}</span>{label}</a>)}</div><button className="gold-button" type="button" onClick={() => { setMobileMenu(false); openWizard(); }}>{t.cta}<span>→</span></button></div>}

      {savedOpen && <div className="drawer-backdrop" onMouseDown={() => setSavedOpen(false)}><aside className="saved-drawer" role="dialog" aria-modal="true" aria-labelledby="saved-title" onMouseDown={(event) => event.stopPropagation()}><header><div><p className="eyebrow dark">{ui.saved}</p><h2 id="saved-title">{ui.savedTitle}</h2></div><button type="button" onClick={() => setSavedOpen(false)} aria-label={ui.close}>×</button></header>{savedProperties.length ? <div className="saved-list">{savedProperties.map((property) => <article key={property.id}><img src={property.image} alt={property.name[language]} /><div><p>{property.area}</p><h3>{property.name[language]}</h3><span>{formatPrice(property.price)}</span><button onClick={() => openProperty(property.id)}>{t.view} ↗</button></div><button className="remove-saved" onClick={() => toggleFavorite(property.id)} aria-label={ui.remove}>×</button></article>)}</div> : <div className="saved-empty"><span>♡</span><p>{ui.savedEmpty}</p><button onClick={() => { setSavedOpen(false); showResults(); }}>{ui.browse}</button></div>}</aside></div>}

      {activeProperty && <div className="modal-backdrop" onMouseDown={() => setSelectedId(null)}><section className="property-modal" role="dialog" aria-modal="true" aria-labelledby="property-modal-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={() => setSelectedId(null)} aria-label={ui.close}>×</button><div className="modal-gallery"><img src={activeGallery[galleryIndex]} alt={`${activeProperty.name[language]} ${galleryIndex + 1}`} /><span>{galleryIndex + 1} / {activeGallery.length}</span><button className="gallery-prev" type="button" onClick={() => setGalleryIndex((galleryIndex - 1 + activeGallery.length) % activeGallery.length)} aria-label={ui.previous}>←</button><button className="gallery-next" type="button" onClick={() => setGalleryIndex((galleryIndex + 1) % activeGallery.length)} aria-label={ui.next}>→</button></div><div className="modal-copy"><p className="property-place">{activeProperty.tag[language]} · {activeProperty.area}</p><h2 id="property-modal-title">{activeProperty.name[language]}</h2><p className="modal-price">{formatPrice(activeProperty.price)} <small>{t.perMonth}</small></p><div className="modal-facts"><span><b>{activeProperty.beds}</b>{t.beds}</span><span><b>{activeProperty.baths}</b>{t.baths}</span><span><b>{activeProperty.size}</b>m²</span></div><p className="modal-description">{language === 'en' ? 'A calm, fully furnished home selected for comfortable long-term living, with responsive local support throughout your stay.' : 'Không gian yên tĩnh, đầy đủ nội thất, phù hợp cho thuê dài hạn với hỗ trợ địa phương nhanh chóng trong suốt thời gian lưu trú.'}</p><ul><li>✓ {ui.available}</li><li>✓ {ui.furnished}</li><li>✓ {ui.wifi}</li><li>✓ {ui.support}</li></ul><div className="modal-actions"><a className="gold-button" href={`https://wa.me/84982545957?text=${encodeURIComponent(`${activeProperty.name[language]} — ${ui.viewing}`)}`} target="_blank" rel="noreferrer">{ui.viewing}<span>→</span></a><button className={`save-large ${favorites.includes(activeProperty.id) ? 'active' : ''}`} type="button" onClick={() => toggleFavorite(activeProperty.id)}>♥ {favorites.includes(activeProperty.id) ? ui.remove : ui.save}</button></div></div></section></div>}

      {wizardOpen && <div className="modal-backdrop wizard-backdrop" onMouseDown={() => setWizardOpen(false)}><section className="finder-modal" role="dialog" aria-modal="true" aria-labelledby="finder-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={() => setWizardOpen(false)} aria-label={ui.close}>×</button><div className="finder-brand"><img src="/brand-logo-v2.png" alt="" /><span>{ui.guided}</span></div><div className="finder-progress"><span>{ui.step} {wizardStep} / 4</span><i><b style={{ width: `${wizardStep * 25}%` }} /></i></div>{!wizardComplete ? <><h2 id="finder-title">{wizardStep === 1 ? ui.areaQuestion : wizardStep === 2 ? ui.typeQuestion : ui.moveQuestion}</h2><div className="finder-options">{(wizardStep === 1 ? ['My Khe Beach', 'Son Tra', 'Hai Chau', 'Ngu Hanh Son', ui.flexible] : wizardStep === 2 ? [t.apartment, t.villa, t.house, ui.flexible] : [ui.asap, ui.month, ui.later, ui.flexible]).map((option) => <button key={option} type="button" className={currentWizardValue === option ? 'active' : ''} onClick={() => setWizard((current) => wizardStep === 1 ? { ...current, area: option } : wizardStep === 2 ? { ...current, type: option } : { ...current, move: option })}><span>{option}</span><i>✓</i></button>)}</div><div className="finder-actions">{wizardStep > 1 && <button type="button" onClick={() => setWizardStep((step) => step - 1)}>← {ui.back}</button>}<button className="finder-next" type="button" disabled={!currentWizardValue} onClick={() => setWizardStep((step) => step + 1)}>{ui.nextStep} →</button></div></> : <div className="finder-summary"><span>✓</span><h2 id="finder-title">{ui.summary}</h2><dl><div><dt>{t.location}</dt><dd>{wizard.area}</dd></div><div><dt>{t.propertyType}</dt><dd>{wizard.type}</dd></div><div><dt>{language === 'en' ? 'Move-in' : 'Chuyển vào'}</dt><dd>{wizard.move}</dd></div></dl><a className="gold-button" href={`https://wa.me/84982545957?text=${wizardMessage}`} target="_blank" rel="noreferrer">{ui.send}<span>→</span></a><button type="button" onClick={() => setWizardStep(1)}>{language === 'en' ? 'Start again' : 'Bắt đầu lại'}</button></div>}</section></div>}

      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}
