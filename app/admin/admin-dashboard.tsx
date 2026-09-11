'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import LanguageSwitch from '../language-switch';
import PhotoStudio from './photo-studio';
import { useAdminLanguage } from './use-admin-language';
import { adminError } from './error-message';
import {
  Archive, ArrowLeft, Building2, Check, ChevronDown, Eye, FilePenLine,
  LayoutDashboard, LoaderCircle, LogOut, MapPin, Plus, Search, Sparkles,
  Trash2, Upload, X,
} from 'lucide-react';
import type { PropertyInput, PropertyRecord, PropertyStatus, TransactionType } from '@/lib/property-types';

type Props = {
  initialProperties: PropertyRecord[];
  currentUser: string;
  signOutPath: string;
  preview?: boolean;
};

type EditorRecord = PropertyInput & { id?: number };

const emptyProperty = (): EditorRecord => ({
  slug: '',
  transactionType: 'sale',
  status: 'draft',
  images: [],
  name: { en: '', vi: '' },
  description: { en: '', vi: '' },
  tag: { en: 'New', vi: 'Mới' },
  area: 'My Khe Beach',
  type: 'Apartment',
  price: 0,
  currency: 'VND',
  beds: 1,
  baths: 1,
  size: 50,
  x: 72,
  y: 42,
  featured: false,
  sortOrder: 100,
});

function toEditor(property: PropertyRecord): EditorRecord {
  const { id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = property;
  return { id, ...input };
}

function money(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(value % 1_000_000_000 ? 1 : 0)}B ₫`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}M ₫`;
  return `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;
}



export default function AdminDashboard({ initialProperties, currentUser, signOutPath, preview = false }: Props) {
  const { language, changeLanguage, t } = useAdminLanguage();
  const typeLabel = (value: string) => language === 'vi' ? ({ Apartment:'Căn hộ', Villa:'Biệt thự', House:'Nhà riêng', Studio:'Studio', Land:'Đất' }[value] || value) : value;
  const statusLabels: Record<PropertyStatus, string> = { draft:t('Draft','Bản nháp'), published:t('Live','Đang hiển thị'), sold:t('Sold','Đã bán'), rented:t('Rented','Đã cho thuê'), archived:t('Archived','Đã lưu trữ') };
  const [sort, setSort] = useState('recent');
  const [properties, setProperties] = useState(initialProperties);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PropertyStatus>('all');
  const [editor, setEditor] = useState<EditorRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const draftKey = 'dnre-editor-draft:' + currentUser;
  const [draftReady, setDraftReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
    if (!preview) {
      try {
        const saved = JSON.parse(sessionStorage.getItem(draftKey) || 'null');
        if (saved && Array.isArray(saved.images) && saved.name && saved.description) setEditor(saved);
      } catch {}
    }
    setDraftReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [draftKey, preview]);
  useEffect(() => {
    if (!draftReady || preview) return;
    try {
      if (editor) sessionStorage.setItem(draftKey, JSON.stringify(editor));
      else sessionStorage.removeItem(draftKey);
    } catch {}
  }, [editor, draftKey, draftReady, preview]);

  const dialogRef = useRef<HTMLElement>(null);
  const editorOpen = editor !== null;
  const editorBusy = useRef(false);
  useEffect(() => { editorBusy.current = saving || uploading; }, [saving, uploading]);
  useEffect(() => {
    if (!editorOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !editorBusy.current) setEditor(null);
      if (event.key !== 'Tab') return;
      const nodes = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select,textarea,a[href]') || []).filter(node => node.offsetParent !== null);
      const first = nodes[0], last = nodes[nodes.length-1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [editorOpen]);
  const filtered = useMemo(() => properties.filter((property) => {
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || [property.name.en, property.name.vi, property.area, property.type, property.slug]
      .some((value) => value.toLowerCase().includes(needle));
    return matchesQuery && (statusFilter === 'all' || property.status === statusFilter);
  }).sort((a,b) => sort === 'price' ? b.price-a.price : sort === 'name' ? a.name[language].localeCompare(b.name[language], language) : Date.parse(b.updatedAt)-Date.parse(a.updatedAt)), [properties, query, statusFilter, sort, language]);

  const metrics = {
    total: properties.length,
    live: properties.filter((property) => property.status === 'published').length,
    draft: properties.filter((property) => property.status === 'draft').length,
    sale: properties.filter((property) => property.transactionType === 'sale').length,
  };

  const updateEditor = <K extends keyof EditorRecord>(key: K, value: EditorRecord[K]) => {
    setEditor((current) => current ? { ...current, [key]: value } : current);
  };

  const updateLocalized = (key: 'name' | 'description' | 'tag', language: 'en' | 'vi', value: string) => {
    setEditor((current) => current ? { ...current, [key]: { ...current[key], [language]: value } } : current);
  };

  const openNew = () => { setError(''); setNotice(''); setEditor(emptyProperty()); };
  const openEdit = (property: PropertyRecord) => { setError(''); setNotice(''); setEditor(toEditor(property)); };

  async function refreshInventory() {
    const response = await fetch('/api/admin/properties', { cache: 'no-store' });
    const data = await response.json() as { properties?: PropertyRecord[]; error?: string };
    if (!response.ok || !data.properties) throw new Error(data.error ?? t("Could not refresh inventory.", "Không thể tải lại danh sách."));
    setProperties(data.properties);
  }

  async function saveProperty() {
    if (!editor || uploading || saving) return;
    if (!editor.name.en.trim() || !editor.name.vi.trim() || !editor.area.trim() || !editor.type.trim()) { setError(t('Complete both titles, area and property type.','Vui lòng nhập tên ở cả hai ngôn ngữ, khu vực và loại bất động sản.')); return; }
    if (!Number.isFinite(editor.price) || editor.price < 0 || editor.size < 1) { setError(t('Enter a valid price and size.','Vui lòng nhập giá và diện tích hợp lệ.')); return; }
    if (editor.status === 'published' && !editor.images.length) { setError(t('Add at least one image before publishing.','Thêm ít nhất một ảnh trước khi đăng tin.')); return; }
    if (preview) { setNotice(t('Design preview only. Changes are not saved.','Đây là bản xem thử. Thay đổi không được lưu.')); setEditor(null); return; }
    setSaving(true); setError(''); setNotice('');
    try {
      const endpoint = editor.id ? `/api/admin/properties/${editor.id}` : '/api/admin/properties';
      const response = await fetch(endpoint, {
        method: editor.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editor),
      });
      const data = await response.json() as { property?: PropertyRecord; error?: string };
      if (!response.ok || !data.property) throw new Error(data.error ?? t("Could not save this property.", "Không thể lưu bất động sản."));
      await refreshInventory();
      setEditor(null);
      setNotice(editor.id ? t("Property updated.", "Đã cập nhật bất động sản.") : t("New property created.", "Đã tạo bất động sản mới."));
    } catch (caught) {
      setError(caught instanceof Error ? adminError(caught.message, language) : t("Could not save this property.", "Không thể lưu bất động sản."));
    } finally { setSaving(false); }
  }

  async function quickStatus(property: PropertyRecord, status: PropertyStatus) {
    if (preview) { setNotice(t('Design preview only. Status is not changed.','Đây là bản xem thử. Trạng thái không thay đổi.')); return; }
    setError('');
    try {
      const response = await fetch(`/api/admin/properties/${property.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...toEditor(property), status }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? t("Could not update status.", "Không thể cập nhật trạng thái."));
      await refreshInventory();
      setNotice(status === 'published' ? t("Property is now live.", "Bất động sản đã hiển thị trên website.") : t("Property moved to drafts.", "Đã chuyển bất động sản về bản nháp."));
    } catch (caught) { setError(caught instanceof Error ? adminError(caught.message, language) : t("Could not update status.", "Không thể cập nhật trạng thái.")); }
  }

  async function removeProperty(property: PropertyRecord) {
    if (preview) { setNotice(t('Design preview only. No properties are deleted.','Đây là bản xem thử. Không xóa bất động sản.')); return; }
    if (!window.confirm(t(`Delete “${property.name[language]}”? This cannot be undone.`, `Xóa “${property.name[language]}”? Không thể hoàn tác thao tác này.`))) return;
    setError('');
    try {
      const response = await fetch(`/api/admin/properties/${property.id}`, { method: 'DELETE' });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? t("Could not delete this property.", "Không thể xóa bất động sản."));
      setProperties((current) => current.filter((item) => item.id !== property.id));
      setNotice(t("Property deleted.", "Đã xóa bất động sản."));
    } catch (caught) { setError(caught instanceof Error ? adminError(caught.message, language) : t("Could not delete this property.", "Không thể xóa bất động sản.")); }
  }


  return (
    <main className="admin-shell" lang={language}>
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/" aria-label="Da Nang Real Estate website">
          <img src="/luxury/brand-dragon-v5.png" alt="" />
          <span><b>DA NANG</b><small>{t("PROPERTY ADMIN", "QUẢN LÝ NHÀ ĐẤT")}</small></span>
        </Link>
        <nav aria-label={t('Admin navigation','Điều hướng quản trị')}>
          <a className="active" href="#inventory"><LayoutDashboard size={18} /> {t("Inventory", "Quản lý nhà đất")}</a>
          <button type="button" onClick={openNew}><Plus size={18} /> {t("Add property", "Thêm bất động sản")}</button>
          <Link href="/" target="_blank"><Eye size={18} /> {t("View website", "Xem website")}</Link>
        </nav>
        <div className="admin-profile">
          <span>{currentUser.slice(0, 1).toUpperCase()}</span>
          <div><b>{currentUser}</b><small>{t("Administrator", "Quản trị viên")}</small></div>
          <a href={signOutPath} target="_top" aria-label={t("Sign out", "Đăng xuất")}><LogOut size={17} /></a>
        </div>
      </aside>

      <section className="admin-workspace" id="inventory">
        {preview && <p className="preview-notice">{t('Local design preview · sample listings · saving disabled','Bản xem thử cục bộ · dữ liệu mẫu · không lưu thay đổi')}</p>}
        <header className="admin-topbar"><LanguageSwitch language={language} onChange={changeLanguage} />
          <div><p>{t("PROPERTY OPERATIONS", "DA NANG REAL ESTATE")}</p><h1>{t("Inventory control", "Không gian quản lý.")}</h1></div>
          <button className="admin-primary" type="button" onClick={openNew}><Plus size={18} /> {t("Add new property", "Thêm bất động sản")}</button>
        </header>

        {(notice || error) && <div className={`admin-notice ${error ? 'error' : ''}`} role="status">
          {error ? <X size={17} /> : <Check size={17} />}{error || notice}
          <button type="button" onClick={() => { setNotice(''); setError(''); }} aria-label={t("Dismiss", "Đóng thông báo")}><X size={15} /></button>
        </div>}

        <div className="admin-welcome"><div><h2>{t('A new day. A new home.','Một ngày mới. Một tổ ấm mới.')}</h2><p>{t('Your properties, beautifully organised.','Quản lý bất động sản của bạn, đơn giản và tinh tế.')}</p><a href="/" target="_blank" rel="noreferrer">{t('Explore the website','Khám phá website')} <Eye size={16}/></a></div></div><div className="admin-metrics">
          <article><span><Building2 size={19} /></span><div><small>{t("Total inventory", "Tổng bất động sản")}</small><strong>{String(metrics.total).padStart(2, '0')}</strong></div></article>
          <article><span><Eye size={19} /></span><div><small>{t("Live on website", "Đang hiển thị")}</small><strong>{String(metrics.live).padStart(2, '0')}</strong></div></article>
          <article><span><FilePenLine size={19} /></span><div><small>{t("Drafts", "Bản nháp")}</small><strong>{String(metrics.draft).padStart(2, '0')}</strong></div></article>
          <article><span><Sparkles size={19} /></span><div><small>{t("For sale", "Đang bán")}</small><strong>{String(metrics.sale).padStart(2, '0')}</strong></div></article>
        </div>

        <div className="inventory-toolbar">
          <label className="admin-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search name, area or type…", "Tìm theo tên, khu vực hoặc loại nhà…")} /></label>
          <label className="admin-select"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | PropertyStatus)}><option value="all">{t("All statuses", "Tất cả trạng thái")}</option><option value="published">{t("Live", "Đang hiển thị")}</option><option value="draft">{t("Draft", "Bản nháp")}</option><option value="sold">{t("Sold", "Đã bán")}</option><option value="rented">{t("Rented", "Đã cho thuê")}</option><option value="archived">{t("Archived", "Đã lưu trữ")}</option></select><ChevronDown size={16} /></label>
          <select className="admin-sort" aria-label={t('Sort listings','Sắp xếp tin đăng')} value={sort} onChange={event => setSort(event.target.value)}><option value="recent">{t('Recently updated','Cập nhật gần đây')}</option><option value="price">{t('Highest price','Giá cao nhất')}</option><option value="name">{t('Name A–Z','Tên A–Z')}</option></select><span>{filtered.length} {t(filtered.length === 1 ? 'property' : 'properties', 'bất động sản')}</span>
        </div>

        <div className="inventory-list">
          <div className="inventory-head"><span>{t("Property", "Bất động sản")}</span><span>{t("Deal", "Giao dịch")}</span><span>{t("Price", "Giá")}</span><span>{t("Status", "Trạng thái")}</span><span>{t("Updated", "Cập nhật")}</span><span>{t("Actions", "Thao tác")}</span></div>
          {filtered.map((property) => <article className="inventory-row" key={property.id}>
            <button className="property-summary" type="button" onClick={() => openEdit(property)}>
              <img src={property.images[0] || '/hero.jpg'} alt="" />
              <span><b>{property.name[language] || property.name.en}</b><small><MapPin size={13} /> {property.area} · {typeLabel(property.type)}</small></span>
            </button>
            <span className={`deal-pill ${property.transactionType}`}>{property.transactionType === 'sale' ? t("For sale", "Đang bán") : t("Rental", "Cho thuê")}</span>
            <b className="inventory-price">{money(property.price)}{property.transactionType === 'rent' && <small>{t("/month", "/tháng")}</small>}</b>
            <span className={`status-pill ${property.status}`}><i />{statusLabels[property.status]}</span>
            <time dateTime={property.updatedAt}>{new Date(property.updatedAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
            <div className="row-actions">
              <button type="button" onClick={() => openEdit(property)} aria-label={`${t('Edit','Chỉnh sửa')} ${property.name[language]}`}><FilePenLine size={17} /></button>
              <button type="button" onClick={() => quickStatus(property, property.status === 'published' ? 'draft' : 'published')} aria-label={property.status === 'published' ? t("Move to drafts", "Chuyển về bản nháp") : t("Publish", "Đăng tin")}>{property.status === 'published' ? <Archive size={17} /> : <Eye size={17} />}</button>
              <button className="danger" type="button" onClick={() => removeProperty(property)} aria-label={`${t('Delete','Xóa')} ${property.name[language]}`}><Trash2 size={17} /></button>
            </div>
          </article>)}
          {!filtered.length && <div className="inventory-empty"><Search size={30} /><h2>{t("No properties found", "Không tìm thấy bất động sản")}</h2><p>{t("Adjust your search or add a new property.", "Thử tìm kiếm khác hoặc thêm bất động sản mới.")}</p><button type="button" onClick={openNew}><Plus size={17} /> {t("Add property", "Thêm bất động sản")}</button></div>}
        </div>
      </section>

      {editor && <div className="editor-backdrop" onMouseDown={() => !saving && !uploading && setEditor(null)}>
        <section className="property-editor" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="editor-title" onMouseDown={(event) => event.stopPropagation()}>
          <header className="editor-header">
            <button type="button" disabled={saving || uploading} onClick={() => setEditor(null)} aria-label={t("Close editor", "Đóng trình chỉnh sửa")}><ArrowLeft size={20} /></button>
            <div><p>{editor.id ? `${t('PROPERTY','BẤT ĐỘNG SẢN')} #${editor.id}` : t("NEW PROPERTY", "BẤT ĐỘNG SẢN MỚI")}</p><h2 id="editor-title">{editor.id ? t("Edit property", "Chỉnh sửa bất động sản") : t("Create a listing", "Tạo tin đăng mới")}</h2></div>
            <button className="editor-save" type="button" onClick={saveProperty} disabled={saving || uploading}>{saving ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />}{saving ? t("Saving…", "Đang lưu…") : t("Save property", "Lưu bất động sản")}</button>
          </header>

          <div className="editor-body">
            {error && <div className="editor-error"><X size={16} />{error}</div>}
            <section className="editor-section">
              <div className="editor-section-title"><span>01</span><div><h3>{t("Listing basics", "Thông tin cơ bản")}</h3><p>{t("Core details shown in search results and cards.", "Thông tin hiển thị trong kết quả tìm kiếm và thẻ bất động sản.")}</p></div></div>
              <div className="editor-fields two">
                <label><span>{t("English title *", "Tên bằng tiếng Anh *")}</span><input value={editor.name.en} onChange={(event) => updateLocalized('name', 'en', event.target.value)} placeholder={t("Oceanview residence", "Căn hộ hướng biển")} /></label>
                <label><span>{t("Vietnamese title *", "Tên bằng tiếng Việt *")}</span><input value={editor.name.vi} onChange={(event) => updateLocalized('name', 'vi', event.target.value)} placeholder="Căn hộ view biển" /></label>
                <label><span>{t("Deal type", "Loại giao dịch")}</span><select value={editor.transactionType} onChange={(event) => updateEditor('transactionType', event.target.value as TransactionType)}><option value="sale">{t("For sale", "Đang bán")}</option><option value="rent">{t("For rent", "Cho thuê")}</option></select></label>
                <label><span>{t("Website status", "Trạng thái hiển thị")}</span><select value={editor.status} onChange={(event) => updateEditor('status', event.target.value as PropertyStatus)}><option value="draft">{t("Draft — hidden", "Bản nháp — ẩn")}</option><option value="published">{t("Live — visible", "Đã đăng — hiển thị")}</option><option value="sold">{t("Sold", "Đã bán")}</option><option value="rented">{t("Rented", "Đã cho thuê")}</option><option value="archived">{t("Archived", "Đã lưu trữ")}</option></select></label>
                <label><span>{t("Property type *", "Loại bất động sản *")}</span><input value={editor.type} onChange={(event) => updateEditor('type', event.target.value)} placeholder={t("Apartment","Căn hộ")} /></label>
                <label><span>{t("Area *", "Khu vực *")}</span><input value={editor.area} onChange={(event) => updateEditor('area', event.target.value)} placeholder={t("My Khe Beach","Biển Mỹ Khê")} /></label>
                <label><span>{t("Price (VND)", "Giá (VND)")}</span><input type="number" min="0" value={editor.price} onChange={(event) => updateEditor('price', Number(event.target.value))} /></label>
                <label><span>{t("URL slug", "Đường dẫn tin đăng")}</span><input value={editor.slug} onChange={(event) => updateEditor('slug', event.target.value)} placeholder={t("Created from English title", "Tự tạo từ tên tiếng Anh")} /></label>
              </div>
            </section>

            <section className="editor-section">
              <div className="editor-section-title"><span>02</span><div><h3>{t("Photos", "Hình ảnh")}</h3><p>{t("Upload up to 12 images. The first image becomes the cover.", "Tải tối đa 12 ảnh. Ảnh đầu tiên là ảnh bìa.")}</p></div></div>
              <PhotoStudio key={editor.id ?? 'new'} scope={currentUser + ':' + (editor.id ?? 'new')} images={editor.images} onChange={images => updateEditor('images', images)} onBusy={setUploading} language={language} preview={preview} />
            </section>

            <section className="editor-section">
              <div className="editor-section-title"><span>03</span><div><h3>{t("Property facts", "Chi tiết bất động sản")}</h3><p>{t("Measurements, labels and map placement.", "Diện tích, nhãn và vị trí trên bản đồ.")}</p></div></div>
              <div className="editor-fields four">
                <label><span>{t("Bedrooms", "Phòng ngủ")}</span><input type="number" min="0" value={editor.beds} onChange={(event) => updateEditor('beds', Number(event.target.value))} /></label>
                <label><span>{t("Bathrooms", "Phòng tắm")}</span><input type="number" min="0" value={editor.baths} onChange={(event) => updateEditor('baths', Number(event.target.value))} /></label>
                <label><span>{t("Size (m²)", "Diện tích (m²)")}</span><input type="number" min="1" value={editor.size} onChange={(event) => updateEditor('size', Number(event.target.value))} /></label>
                <label><span>{t("Display order", "Thứ tự hiển thị")}</span><input type="number" min="0" value={editor.sortOrder} onChange={(event) => updateEditor('sortOrder', Number(event.target.value))} /></label>
                <label><span>{t("English badge", "Nhãn tiếng Anh")}</span><input value={editor.tag.en} onChange={(event) => updateLocalized('tag', 'en', event.target.value)} placeholder={t("Featured", "Nổi bật")} /></label>
                <label><span>{t("Vietnamese badge", "Nhãn tiếng Việt")}</span><input value={editor.tag.vi} onChange={(event) => updateLocalized('tag', 'vi', event.target.value)} placeholder="Nổi bật" /></label>
                <label className="range-field"><span>{t('Map horizontal','Vị trí ngang')} · {editor.x}%</span><input type="range" min="0" max="100" value={editor.x} onChange={(event) => updateEditor('x', Number(event.target.value))} /></label>
                <label className="range-field"><span>{t('Map vertical','Vị trí dọc')} · {editor.y}%</span><input type="range" min="0" max="100" value={editor.y} onChange={(event) => updateEditor('y', Number(event.target.value))} /></label>
              </div>
              <label className="feature-check"><input type="checkbox" checked={editor.featured} onChange={(event) => updateEditor('featured', event.target.checked)} /><span><Sparkles size={18} /><b>{t("Feature this property", "Đánh dấu nổi bật")}</b><small>{t("Prioritise it in the private collection and public inventory.", "Ưu tiên hiển thị trong bộ sưu tập và danh sách trên website.")}</small></span></label>
            </section>

            <section className="editor-section">
              <div className="editor-section-title"><span>04</span><div><h3>{t("Descriptions", "Mô tả")}</h3><p>{t("Full bilingual copy for the property details window.", "Nội dung song ngữ cho trang chi tiết bất động sản.")}</p></div></div>
              <div className="editor-fields two">
                <label><span>{t("English description", "Mô tả tiếng Anh")}</span><textarea rows={6} value={editor.description.en} onChange={(event) => updateLocalized('description', 'en', event.target.value)} /></label>
                <label><span>{t("Vietnamese description", "Mô tả tiếng Việt")}</span><textarea rows={6} value={editor.description.vi} onChange={(event) => updateLocalized('description', 'vi', event.target.value)} /></label>
              </div>
            </section>
          </div>

          <footer className="editor-footer"><span>{editor.status === 'published' ? <><Eye size={16} /> {t("Changes appear on the website after saving.", "Thay đổi sẽ hiển thị trên website sau khi lưu.")}</> : <><FilePenLine size={16} /> {t("This listing remains hidden until published.", "Tin này vẫn ẩn cho đến khi được đăng.")}</>}</span><div><button type="button" disabled={saving || uploading} onClick={() => setEditor(null)}>{t("Cancel", "Hủy")}</button><button className="admin-primary" type="button" onClick={saveProperty} disabled={saving || uploading}>{saving ? <LoaderCircle className="spin" size={18} /> : <Upload size={18} />}{saving ? t("Saving…", "Đang lưu…") : t("Save property", "Lưu bất động sản")}</button></div></footer>
        </section>
      </div>}
    </main>
  );
}
