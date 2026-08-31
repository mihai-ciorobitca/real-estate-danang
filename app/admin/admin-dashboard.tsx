'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Archive, ArrowLeft, BedDouble, Building2, Check, ChevronDown, Eye, FilePenLine,
  ImagePlus, LayoutDashboard, LoaderCircle, LogOut, MapPin, Plus, Search, Sparkles,
  Trash2, Upload, X,
} from 'lucide-react';
import type { PropertyInput, PropertyRecord, PropertyStatus, TransactionType } from '@/lib/property-types';

type Props = {
  initialProperties: PropertyRecord[];
  currentUser: string;
  signOutPath: string;
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

const statusLabels: Record<PropertyStatus, string> = {
  draft: 'Draft', published: 'Live', sold: 'Sold', rented: 'Rented', archived: 'Archived',
};

export default function AdminDashboard({ initialProperties, currentUser, signOutPath }: Props) {
  const [properties, setProperties] = useState(initialProperties);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PropertyStatus>('all');
  const [editor, setEditor] = useState<EditorRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => properties.filter((property) => {
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || [property.name.en, property.name.vi, property.area, property.type, property.slug]
      .some((value) => value.toLowerCase().includes(needle));
    return matchesQuery && (statusFilter === 'all' || property.status === statusFilter);
  }), [properties, query, statusFilter]);

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
    if (!response.ok || !data.properties) throw new Error(data.error ?? 'Could not refresh inventory.');
    setProperties(data.properties);
  }

  async function saveProperty() {
    if (!editor) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const endpoint = editor.id ? `/api/admin/properties/${editor.id}` : '/api/admin/properties';
      const response = await fetch(endpoint, {
        method: editor.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editor),
      });
      const data = await response.json() as { property?: PropertyRecord; error?: string };
      if (!response.ok || !data.property) throw new Error(data.error ?? 'Could not save this property.');
      await refreshInventory();
      setEditor(null);
      setNotice(editor.id ? 'Property updated.' : 'New property created.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save this property.');
    } finally { setSaving(false); }
  }

  async function quickStatus(property: PropertyRecord, status: PropertyStatus) {
    setError('');
    try {
      const response = await fetch(`/api/admin/properties/${property.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...toEditor(property), status }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Could not update status.');
      await refreshInventory();
      setNotice(status === 'published' ? 'Property is now live.' : 'Property moved to drafts.');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not update status.'); }
  }

  async function removeProperty(property: PropertyRecord) {
    if (!window.confirm(`Delete “${property.name.en}”? This cannot be undone.`)) return;
    setError('');
    try {
      const response = await fetch(`/api/admin/properties/${property.id}`, { method: 'DELETE' });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Could not delete this property.');
      setProperties((current) => current.filter((item) => item.id !== property.id));
      setNotice('Property deleted.');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not delete this property.'); }
  }

  async function uploadImages(files: FileList | null) {
    if (!editor || !files?.length) return;
    setUploading(true); setError('');
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData(); body.append('file', file);
        const response = await fetch('/api/admin/uploads', { method: 'POST', body });
        const data = await response.json() as { url?: string; error?: string };
        if (!response.ok || !data.url) throw new Error(data.error ?? `Could not upload ${file.name}.`);
        uploaded.push(data.url);
      }
      setEditor((current) => current ? { ...current, images: [...current.images, ...uploaded].slice(0, 12) } : current);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Image upload failed.'); }
    finally { setUploading(false); if (fileInput.current) fileInput.current.value = ''; }
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/" aria-label="Da Nang Real Estate website">
          <img src="/brand-logo-v2.png" alt="" />
          <span><b>DA NANG</b><small>PROPERTY ADMIN</small></span>
        </a>
        <nav aria-label="Admin navigation">
          <a className="active" href="#inventory"><LayoutDashboard size={18} /> Inventory</a>
          <button type="button" onClick={openNew}><Plus size={18} /> Add property</button>
          <a href="/" target="_blank" rel="noreferrer"><Eye size={18} /> View website</a>
        </nav>
        <div className="admin-profile">
          <span>{currentUser.slice(0, 1).toUpperCase()}</span>
          <div><b>{currentUser}</b><small>Administrator</small></div>
          <a href={signOutPath} target="_top" aria-label="Sign out"><LogOut size={17} /></a>
        </div>
      </aside>

      <section className="admin-workspace" id="inventory">
        <header className="admin-topbar">
          <div><p>PROPERTY OPERATIONS</p><h1>Inventory control</h1></div>
          <button className="admin-primary" type="button" onClick={openNew}><Plus size={18} /> Add new property</button>
        </header>

        {(notice || error) && <div className={`admin-notice ${error ? 'error' : ''}`} role="status">
          {error ? <X size={17} /> : <Check size={17} />}{error || notice}
          <button type="button" onClick={() => { setNotice(''); setError(''); }} aria-label="Dismiss"><X size={15} /></button>
        </div>}

        <div className="admin-metrics">
          <article><span><Building2 size={19} /></span><div><small>Total inventory</small><strong>{String(metrics.total).padStart(2, '0')}</strong></div></article>
          <article><span><Eye size={19} /></span><div><small>Live on website</small><strong>{String(metrics.live).padStart(2, '0')}</strong></div></article>
          <article><span><FilePenLine size={19} /></span><div><small>Drafts</small><strong>{String(metrics.draft).padStart(2, '0')}</strong></div></article>
          <article><span><Sparkles size={19} /></span><div><small>For sale</small><strong>{String(metrics.sale).padStart(2, '0')}</strong></div></article>
        </div>

        <div className="inventory-toolbar">
          <label className="admin-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, area or type…" /></label>
          <label className="admin-select"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | PropertyStatus)}><option value="all">All statuses</option><option value="published">Live</option><option value="draft">Draft</option><option value="sold">Sold</option><option value="rented">Rented</option><option value="archived">Archived</option></select><ChevronDown size={16} /></label>
          <span>{filtered.length} {filtered.length === 1 ? 'property' : 'properties'}</span>
        </div>

        <div className="inventory-list">
          <div className="inventory-head"><span>Property</span><span>Deal</span><span>Price</span><span>Status</span><span>Updated</span><span>Actions</span></div>
          {filtered.map((property) => <article className="inventory-row" key={property.id}>
            <button className="property-summary" type="button" onClick={() => openEdit(property)}>
              <img src={property.images[0] || '/hero.jpg'} alt="" />
              <span><b>{property.name.en}</b><small><MapPin size={13} /> {property.area} · {property.type}</small></span>
            </button>
            <span className={`deal-pill ${property.transactionType}`}>{property.transactionType === 'sale' ? 'For sale' : 'Rental'}</span>
            <b className="inventory-price">{money(property.price)}{property.transactionType === 'rent' && <small>/month</small>}</b>
            <span className={`status-pill ${property.status}`}><i />{statusLabels[property.status]}</span>
            <time dateTime={property.updatedAt}>{new Date(property.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
            <div className="row-actions">
              <button type="button" onClick={() => openEdit(property)} aria-label={`Edit ${property.name.en}`}><FilePenLine size={17} /></button>
              <button type="button" onClick={() => quickStatus(property, property.status === 'published' ? 'draft' : 'published')} aria-label={property.status === 'published' ? 'Move to drafts' : 'Publish'}>{property.status === 'published' ? <Archive size={17} /> : <Eye size={17} />}</button>
              <button className="danger" type="button" onClick={() => removeProperty(property)} aria-label={`Delete ${property.name.en}`}><Trash2 size={17} /></button>
            </div>
          </article>)}
          {!filtered.length && <div className="inventory-empty"><Search size={30} /><h2>No properties found</h2><p>Adjust your search or add a new property.</p><button type="button" onClick={openNew}><Plus size={17} /> Add property</button></div>}
        </div>
      </section>

      {editor && <div className="editor-backdrop" onMouseDown={() => !saving && setEditor(null)}>
        <section className="property-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title" onMouseDown={(event) => event.stopPropagation()}>
          <header className="editor-header">
            <button type="button" onClick={() => setEditor(null)} aria-label="Close editor"><ArrowLeft size={20} /></button>
            <div><p>{editor.id ? `PROPERTY #${editor.id}` : 'NEW PROPERTY'}</p><h2 id="editor-title">{editor.id ? 'Edit property' : 'Create a listing'}</h2></div>
            <button className="editor-save" type="button" onClick={saveProperty} disabled={saving || uploading}>{saving ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />}{saving ? 'Saving…' : 'Save property'}</button>
          </header>

          <div className="editor-body">
            {error && <div className="editor-error"><X size={16} />{error}</div>}
            <section className="editor-section">
              <div className="editor-section-title"><span>01</span><div><h3>Listing basics</h3><p>Core details shown in search results and cards.</p></div></div>
              <div className="editor-fields two">
                <label><span>English title *</span><input value={editor.name.en} onChange={(event) => updateLocalized('name', 'en', event.target.value)} placeholder="Oceanview residence" /></label>
                <label><span>Vietnamese title *</span><input value={editor.name.vi} onChange={(event) => updateLocalized('name', 'vi', event.target.value)} placeholder="Căn hộ view biển" /></label>
                <label><span>Deal type</span><select value={editor.transactionType} onChange={(event) => updateEditor('transactionType', event.target.value as TransactionType)}><option value="sale">For sale</option><option value="rent">For rent</option></select></label>
                <label><span>Website status</span><select value={editor.status} onChange={(event) => updateEditor('status', event.target.value as PropertyStatus)}><option value="draft">Draft — hidden</option><option value="published">Live — visible</option><option value="sold">Sold</option><option value="rented">Rented</option><option value="archived">Archived</option></select></label>
                <label><span>Property type *</span><input value={editor.type} onChange={(event) => updateEditor('type', event.target.value)} placeholder="Apartment" /></label>
                <label><span>Area *</span><input value={editor.area} onChange={(event) => updateEditor('area', event.target.value)} placeholder="My Khe Beach" /></label>
                <label><span>Price (VND)</span><input type="number" min="0" value={editor.price} onChange={(event) => updateEditor('price', Number(event.target.value))} /></label>
                <label><span>URL slug</span><input value={editor.slug} onChange={(event) => updateEditor('slug', event.target.value)} placeholder="Created from English title" /></label>
              </div>
            </section>

            <section className="editor-section">
              <div className="editor-section-title"><span>02</span><div><h3>Photos</h3><p>Upload up to 12 images. The first image becomes the cover.</p></div></div>
              <input ref={fileInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(event) => uploadImages(event.target.files)} />
              <button className="image-drop" type="button" onClick={() => fileInput.current?.click()} disabled={uploading}>
                {uploading ? <LoaderCircle className="spin" size={27} /> : <ImagePlus size={27} />}<b>{uploading ? 'Uploading images…' : 'Add property photos'}</b><span>JPG, PNG, WebP or AVIF · maximum 8 MB each</span>
              </button>
              {!!editor.images.length && <div className="image-grid">{editor.images.map((image, index) => <figure key={`${image}-${index}`}><img src={image} alt="" /><figcaption>{index === 0 ? 'COVER' : String(index + 1).padStart(2, '0')}</figcaption><button type="button" onClick={() => updateEditor('images', editor.images.filter((_, imageIndex) => imageIndex !== index))} aria-label={`Remove image ${index + 1}`}><X size={15} /></button></figure>)}</div>}
            </section>

            <section className="editor-section">
              <div className="editor-section-title"><span>03</span><div><h3>Property facts</h3><p>Measurements, labels and map placement.</p></div></div>
              <div className="editor-fields four">
                <label><span>Bedrooms</span><input type="number" min="0" value={editor.beds} onChange={(event) => updateEditor('beds', Number(event.target.value))} /></label>
                <label><span>Bathrooms</span><input type="number" min="0" value={editor.baths} onChange={(event) => updateEditor('baths', Number(event.target.value))} /></label>
                <label><span>Size (m²)</span><input type="number" min="1" value={editor.size} onChange={(event) => updateEditor('size', Number(event.target.value))} /></label>
                <label><span>Display order</span><input type="number" min="0" value={editor.sortOrder} onChange={(event) => updateEditor('sortOrder', Number(event.target.value))} /></label>
                <label><span>English badge</span><input value={editor.tag.en} onChange={(event) => updateLocalized('tag', 'en', event.target.value)} placeholder="Featured" /></label>
                <label><span>Vietnamese badge</span><input value={editor.tag.vi} onChange={(event) => updateLocalized('tag', 'vi', event.target.value)} placeholder="Nổi bật" /></label>
                <label className="range-field"><span>Map horizontal · {editor.x}%</span><input type="range" min="0" max="100" value={editor.x} onChange={(event) => updateEditor('x', Number(event.target.value))} /></label>
                <label className="range-field"><span>Map vertical · {editor.y}%</span><input type="range" min="0" max="100" value={editor.y} onChange={(event) => updateEditor('y', Number(event.target.value))} /></label>
              </div>
              <label className="feature-check"><input type="checkbox" checked={editor.featured} onChange={(event) => updateEditor('featured', event.target.checked)} /><span><Sparkles size={18} /><b>Feature this property</b><small>Prioritise it in the private collection and public inventory.</small></span></label>
            </section>

            <section className="editor-section">
              <div className="editor-section-title"><span>04</span><div><h3>Descriptions</h3><p>Full bilingual copy for the property details window.</p></div></div>
              <div className="editor-fields two">
                <label><span>English description</span><textarea rows={6} value={editor.description.en} onChange={(event) => updateLocalized('description', 'en', event.target.value)} /></label>
                <label><span>Vietnamese description</span><textarea rows={6} value={editor.description.vi} onChange={(event) => updateLocalized('description', 'vi', event.target.value)} /></label>
              </div>
            </section>
          </div>

          <footer className="editor-footer"><span>{editor.status === 'published' ? <><Eye size={16} /> Changes appear on the website after saving.</> : <><FilePenLine size={16} /> This listing remains hidden until published.</>}</span><div><button type="button" onClick={() => setEditor(null)}>Cancel</button><button className="admin-primary" type="button" onClick={saveProperty} disabled={saving || uploading}>{saving ? <LoaderCircle className="spin" size={18} /> : <Upload size={18} />}{saving ? 'Saving…' : 'Save property'}</button></div></footer>
        </section>
      </div>}
    </main>
  );
}
