'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Grip, ImagePlus, LoaderCircle, Pause, Play, RotateCcw, Sparkles, X } from 'lucide-react';
import { movePhoto, type PhotoJob } from '@/lib/photo-job-types';
import type { SiteLanguage } from '../language-switch';
import './photo-studio.css';
import { usePhotoHold } from './use-photo-hold';

type Task = Omit<PhotoJob, 'state'> & { state: PhotoJob['state'] | 'queued' };
type Props = { images: string[]; onChange: (images: string[]) => void; onBusy: (busy: boolean) => void; language: SiteLanguage; scope: string; preview?: boolean };
const active = (task: Task) => ['queued','submitting','processing'].includes(task.state);
const errors: Record<string, [string, string]> = {
  auth: ['Please sign in again, then reopen this listing.', 'Vui lòng đăng nhập lại rồi mở lại tin đăng.'],
  ai_configuration: ['The WaveSpeed key must be configured on the server.', 'Cần cấu hình khóa WaveSpeed trên máy chủ.'],
  storage_configuration: ['Image storage is not configured.', 'Chưa cấu hình kho lưu ảnh.'],
  ai_credit: ['WaveSpeed credit is insufficient. Top up and retry.', 'Số dư WaveSpeed không đủ. Nạp thêm rồi thử lại.'],
  ai_busy: ['WaveSpeed is busy. Try again shortly.', 'WaveSpeed đang bận. Vui lòng thử lại sau.'],
  busy: ['Other images are processing. Waiting for a free slot.', 'Các ảnh khác đang được xử lý. Đang chờ đến lượt.'],
  daily_limit: ['Daily processing limit reached (150 images).', 'Đã đạt giới hạn xử lý 150 ảnh mỗi ngày.'],
  invalid_image: ['Upload this image again before enhancing it.', 'Vui lòng tải lại ảnh trước khi nâng cấp.'],
  submission_uncertain: ['Submission could not be confirmed. Check WaveSpeed history before starting again to avoid paying twice.', 'Chưa xác nhận được yêu cầu. Kiểm tra lịch sử WaveSpeed trước khi thử lại để tránh tính phí hai lần.'],
  generation_failed: ['Image processing failed. The original is safe; you can retry.', 'Xử lý ảnh thất bại. Ảnh gốc vẫn còn; bạn có thể thử lại.'],
  storage_save: ['AI finished; retrying permanent image storage.', 'AI đã hoàn tất; đang thử lưu ảnh vào kho.'],
  poll_retry: ['Connection interrupted. Checking again automatically.', 'Kết nối bị gián đoạn. Đang tự động kiểm tra lại.'],
  result_host: ['AI result needs a storage configuration check.', 'Cần kiểm tra cấu hình lưu kết quả AI.'],
  result_format: ['AI returned an unexpected image format.', 'AI trả về định dạng ảnh không hợp lệ.'],
  result_resolution: ['The provider did not return 4K. Keep the original and check the WaveSpeed job.', 'Nhà cung cấp chưa trả về ảnh 4K. Giữ ảnh gốc và kiểm tra tác vụ WaveSpeed.'],
  result_size: ['The 4K file exceeds the storage limit. Keep the original and contact support.', 'Tệp 4K vượt giới hạn kho lưu. Giữ ảnh gốc và liên hệ hỗ trợ.'],
  service_unavailable: ['The service is unavailable. Your original is safe. Try again.', 'Dịch vụ chưa sẵn sàng. Ảnh gốc vẫn còn. Vui lòng thử lại.'],
  upload: ['Upload failed. Try again with a JPG, PNG, WebP or AVIF.', 'Tải ảnh thất bại. Thử lại với JPG, PNG, WebP hoặc AVIF.'],
  heic: ['Export iPhone HEIC photos as JPG first.', 'Vui lòng chuyển ảnh HEIC từ iPhone sang JPG trước.'],
  large: ['Choose an image smaller than 30 MB.', 'Vui lòng chọn ảnh nhỏ hơn 30 MB.'],
};

async function request(path: string, options?: RequestInit) {
  const response = await fetch(path, { ...options, cache: 'no-store', signal: AbortSignal.timeout(55_000) });
  const data = await response.json().catch(() => ({ error: response.status === 413 ? 'large' : 'service_unavailable' }));
  if (!response.ok) throw new Error(data.error || 'service_unavailable');
  return data;
}

// Compress oversized phone photos locally before the multipart request reaches the server.
async function prepareImage(file: File): Promise<File> {
  if (/\.hei[cf]$/i.test(file.name) || /hei[cf]/i.test(file.type)) throw new Error('heic');
  if (file.size > 30 * 1024 * 1024) throw new Error('large');
  if (!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)) throw new Error('upload');
  if (file.size < 3.5 * 1024 * 1024) return file;
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 4096 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('upload');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [.92,.84,.74,.62]) {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size < 3.5 * 1024 * 1024) return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
    }
    throw new Error('large');
  } finally { bitmap.close(); }
}

export default function PhotoStudio({ images, onChange, onBusy, language, scope, preview }: Props) {
  const t = (en: string, vi: string) => language === 'vi' ? vi : en;
  const explain = (code: string) => (errors[code] ?? errors.service_unavailable)[language === 'vi' ? 1 : 0];
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const dragFrom = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const tasksRef = useRef<Task[]>([]);
  const pausedRef = useRef(false);
  const latest = useRef({ images, onChange });
  useLayoutEffect(() => { latest.current = { images, onChange }; }, [images, onChange]);
  const storageKey = `dnre-photo-jobs:${scope}`;
  const update = (fn: (items: Task[]) => Task[]) => {
    const next = fn(tasksRef.current); tasksRef.current = next; setTasks(next);
    try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  };
  const pending = tasks.filter(task => active(task) && images.some(url => url === task.source || url === task.result));
  const busy = uploading || (!paused && (!ready || pending.length > 0));
  useEffect(() => { onBusy(busy); }, [busy, onBusy]);
  useEffect(() => {
    if (!busy) return;
    const leave = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [busy]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    let wake: (() => void) | undefined;
    const wait = () => new Promise<void>(resolve => { wake = resolve; timer = setTimeout(resolve, 4500); });
    const commit = (fn: (items: Task[]) => Task[]) => {
      if (stopped) return;
      const next = fn(tasksRef.current); tasksRef.current = next; setTasks(next);
      try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    };
    async function run() {
      let restored: Task[] = [];
      try { const value = JSON.parse(sessionStorage.getItem(storageKey) || '[]'); if (Array.isArray(value)) restored = value.filter(item => item && typeof item.id === 'string' && typeof item.source === 'string'); } catch {}
      commit(() => restored);
      if (!preview) {
        try {
          const data = await request('/api/admin/photo-jobs');
          const existing = data.jobs as PhotoJob[];
          commit(current => [...current.map(item => existing.find(job => job.id === item.id) ?? item), ...existing.filter(job => !current.some(item => item.id === job.id) && latest.current.images.some(url => url === job.source || url === job.result))]);
          if (!data.configured) setError('ai_configuration');
        } catch (caught) { if (!stopped) setError(caught instanceof Error ? caught.message : 'service_unavailable'); }
      }
      if (stopped) return;
      setReady(true);
      while (!stopped && !preview) {
        const task = !pausedRef.current && tasksRef.current.find(item => active(item) && latest.current.images.includes(item.source));
        if (task) {
          try {
            const data = task.state === 'queued'
              ? await request('/api/admin/photo-jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id, source: task.source }) })
              : await request(`/api/admin/photo-jobs?id=${task.id}`);
            if (stopped) return;
            const job = data.job as PhotoJob;
            commit(items => items.map(item => item.id === task.id ? job : item));
            if (job.state === 'completed' && job.result && !pausedRef.current) {
              latest.current.onChange(latest.current.images.map(url => url === job.source ? job.result! : url));
            }
          } catch (caught) {
            if (stopped) return;
            const code = caught instanceof Error ? caught.message : 'poll_retry';
            // Keep the same request ID on transport failures; the server deduplicates paid submissions.
            const terminal = ['auth','ai_configuration','storage_configuration','daily_limit','invalid_image'].includes(code);
            commit(items => items.map(item => item.id === task.id ? { ...item, error: code, ...(terminal ? { state: 'failed' as const } : {}) } : item));
          }
        }
        await wait();
      }
    }
    void run();
    return () => { stopped = true; clearTimeout(timer); wake?.(); };
  // A studio instance belongs to one editor. Mutable refs allow reorder without restarting a paid request.
  }, [storageKey, preview]);

  function queue(source: string) {
    update(items => [...items.filter(item => item.source !== source), { id: crypto.randomUUID(), source, result: null, state: 'queued', error: null, createdAt: new Date().toISOString() }]);
    setPaused(false); pausedRef.current = false;
  }
  async function upload(files: FileList | null) {
    if (!files?.length || uploading) return;
    if (preview) { setError('auth'); return; }
    if (latest.current.images.length + files.length > 12) { setError('limit'); return; }
    setUploading(true); setError('');
    let count = 0;
    try {
      for (const file of Array.from(files)) {
        setUploadStatus(`${++count}/${files.length} · ${file.name}`);
        try {
          const prepared = await prepareImage(file);
          const body = new FormData(); body.append('file', prepared);
          const data = await request('/api/admin/uploads', { method: 'POST', body });
          if (typeof data.url !== 'string') throw new Error('upload');
          latest.current.onChange([...latest.current.images, data.url]);
          // Update the ref before another upload resolves, even if React has not rendered yet.
          latest.current.images = [...latest.current.images, data.url];
          queue(data.url);
        } catch (caught) { setError(caught instanceof Error && errors[caught.message] ? caught.message : 'upload'); }
      }
    } finally { setUploading(false); setUploadStatus(''); if (input.current) input.current.value = ''; }
  }
  function move(from: number, to: number) {
    latest.current.onChange(movePhoto(latest.current.images, from, to));
    setAnnouncement(t(`Photo ${from + 1} moved to position ${to + 1}.`, `Đã chuyển ảnh ${from + 1} đến vị trí ${to + 1}.`));
  }
  usePhotoHold(grid, images, move, (from, to) => { setDragging(from); setOver(to); });
  const first = pending[0];
  const elapsed = first ? Math.max(0, Math.floor((now - Date.parse(first.createdAt)) / 1000)) : 0;
  const timerText = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
  const relevant = tasks.filter(task => images.includes(task.source) || Boolean(task.result && images.includes(task.result)));
  const complete = relevant.filter(task => task.state === 'completed').length;
  return <div className="photo-studio">
    <div className="photo-studio-intro"><span className="photo-studio-icon"><Sparkles size={24} /></span><div><p>PHOTO STUDIO · 4K</p><h4>{t('Beautiful light. Every detail.', 'Ánh sáng đẹp. Trọn từng chi tiết.')}</h4><span>{t('Upload → arrange → automatic enhancement → review & save.', 'Tải ảnh → sắp xếp → tự động nâng cấp → kiểm tra và lưu.')}</span></div><b>GPT 2.5<span>MEDIUM</span></b></div>
    <p className="photo-guidance">{t('Hold a photo briefly, then drag it to a new position. Hold near the top or bottom to scroll. You can also use the grip or arrows. Photo 1 is the cover. New photos are automatically enhanced; originals remain available.', 'Nhấn giữ ảnh một chút, rồi kéo đến vị trí mới. Giữ gần mép trên hoặc dưới để cuộn. Bạn cũng có thể dùng biểu tượng kéo hoặc mũi tên. Ảnh 1 là ảnh bìa. Ảnh mới tự động được nâng cấp; vẫn giữ lại ảnh gốc.')}</p>
    <input ref={input} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple aria-label={t('Choose property photos','Chọn ảnh bất động sản')} onChange={event => void upload(event.target.files)} />
    <button className="photo-add" type="button" disabled={uploading || !ready || images.length >= 12} onClick={() => input.current?.click()}><ImagePlus size={23} /><span><strong>{uploading ? t('Uploading…','Đang tải lên…') : t('Add photos','Thêm ảnh')}</strong><small>{uploadStatus || t('Up to 12 photos · phone photos compressed automatically','Tối đa 12 ảnh · tự động nén ảnh điện thoại')}</small></span><b>{images.length}/12</b></button>
    {error && <div className="photo-error" role="alert">{error === 'limit' ? t('A maximum of 12 photos is allowed.','Tối đa 12 ảnh.') : explain(error)}<button type="button" aria-label={t('Dismiss','Đóng')} onClick={() => setError('')}><X size={16} /></button></div>}
    {(pending.length > 0 || complete > 0) && <div className="photo-progress">
      <div><strong>{pending.length ? (paused ? t('Checking paused','Đã tạm dừng kiểm tra') : t('Creating your 4K photos','Đang tạo ảnh 4K')) : t('Photos ready to review','Ảnh đã sẵn sàng để kiểm tra')}</strong><span>{complete}/{relevant.length} {t('ready','hoàn tất')}{first && ` · ${timerText}`}</span></div>
      <progress value={complete} max={Math.max(1,relevant.length)} aria-label={t('Completed photos','Ảnh đã hoàn tất')} />
      <p>{pending.length ? t('Elapsed time, not a countdown. Processing time varies. Reopen this listing to continue checking after a reload.', 'Đây là thời gian đã chạy, không phải đếm ngược. Thời gian xử lý có thể thay đổi. Mở lại tin để tiếp tục kiểm tra sau khi tải lại trang.') : t('Compare with originals, then save the listing to publish this order.', 'So sánh với ảnh gốc, sau đó lưu tin để áp dụng thứ tự này.')}</p>
      {pending.length > 0 && <button type="button" onClick={() => { pausedRef.current = !paused; setPaused(!paused); }}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? t('Continue checking','Tiếp tục kiểm tra') : t('Pause checking & keep originals','Tạm dừng kiểm tra và giữ ảnh gốc')}</button>}
      {paused && <small>{t('WaveSpeed jobs already submitted continue running. Pausing does not cancel charges.', 'Các tác vụ đã gửi tới WaveSpeed vẫn tiếp tục. Tạm dừng không hủy chi phí.')}</small>}
    </div>}
    <div className="photo-grid" ref={grid}>
      {images.map((url, index) => {
        const task = [...tasks].reverse().find(item => item.source === url || item.result === url);
        const processing = task && active(task);
        const enhanced = task?.result === url;
        return <article key={url} data-photo-index={index} className={`photo-card ${dragging === index ? 'is-dragging' : ''} ${over === index ? 'is-over' : ''}`}>
          <div className="photo-preview"><img src={url} alt={t(`Property photo ${index + 1}`,`Ảnh bất động sản ${index + 1}`)} draggable={false} /><span className="photo-number">{String(index + 1).padStart(2,'0')}{index === 0 && <small>{t('COVER','ẢNH BÌA')}</small>}</span>
            <button className="photo-remove" type="button" disabled={Boolean(processing)} aria-label={t(`Remove photo ${index + 1}`,`Xóa ảnh ${index + 1}`)} onClick={() => latest.current.onChange(latest.current.images.filter((_,i) => i !== index))}><X size={16} /></button>
            {processing && <span className="photo-processing"><LoaderCircle className={paused ? '' : 'spin'} size={15} />{task.state === 'queued' ? t('Queued','Đang chờ') : t('Enhancing','Đang nâng cấp')}</span>}
            {enhanced && <span className="photo-processing ready"><Check size={15} />4K</span>}
          </div>
          <div className="photo-controls"><button type="button" disabled={index === 0} aria-label={t(`Move photo ${index + 1} earlier`,`Chuyển ảnh ${index + 1} lên trước`)} onClick={() => move(index,index-1)}><ArrowLeft size={17} /></button>
            <button type="button" className="photo-grip" aria-label={t(`Drag photo ${index + 1}; use arrow keys to move`,`Kéo ảnh ${index + 1}; dùng phím mũi tên để di chuyển`)}
              onKeyDown={event => { if (['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(event.key)) { event.preventDefault(); move(index,index + (['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 1)); } }}
              onPointerDown={event => { if (event.button !== 0) return; dragFrom.current = index; draggingRef.current = true; setDragging(index); event.currentTarget.setPointerCapture(event.pointerId); }}
              onPointerMove={event => { if (!draggingRef.current) return; const card = document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>('[data-photo-index]'); setOver(card && grid.current?.contains(card) ? Number(card.dataset.photoIndex) : null); }}
              onPointerUp={event => { const card = document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>('[data-photo-index]'); if (dragFrom.current !== null && card && grid.current?.contains(card)) move(dragFrom.current,Number(card.dataset.photoIndex)); draggingRef.current = false; dragFrom.current = null; setDragging(null); setOver(null); }}
              onPointerCancel={() => { draggingRef.current = false; dragFrom.current = null; setDragging(null); setOver(null); }}><Grip size={19} /></button>
            <button type="button" disabled={index === images.length-1} aria-label={t(`Move photo ${index + 1} later`,`Chuyển ảnh ${index + 1} ra sau`)} onClick={() => move(index,index+1)}><ArrowRight size={17} /></button></div>
          <div className="photo-actions">{task?.result ? <button type="button" onClick={() => latest.current.onChange(latest.current.images.map(image => image === url ? (enhanced ? task.source : task.result!) : image))}>{enhanced ? <RotateCcw size={14} /> : <Sparkles size={14} />}{enhanced ? t('View original','Xem ảnh gốc') : t('Use 4K result','Dùng ảnh 4K')}</button> : !processing && task?.state !== 'uncertain' && <button type="button" disabled={preview || !ready} onClick={() => queue(url)}><Sparkles size={14} />{task ? t('Retry enhancement','Thử nâng cấp lại') : t('Enhance in 4K','Nâng cấp lên 4K')}</button>}</div>
          {task?.error && <p className="photo-card-error">{explain(task.error)}</p>}
        </article>;
      })}
    </div>
    <p className="photo-footnote">{t('Natural light, colour and clarity improvements. Real room layout, furniture and property condition stay unchanged. Review AI results before saving.', 'Cải thiện ánh sáng, màu sắc và độ rõ tự nhiên. Giữ nguyên bố cục, nội thất và tình trạng thực tế. Kiểm tra kết quả AI trước khi lưu.')}</p>
    <span className="visually-hidden" role="status">{announcement}</span>
  </div>;
}
