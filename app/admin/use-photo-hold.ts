'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

// Native, non-passive touch listeners let a normal swipe scroll until the hold
// activates, without disabling pinch zoom over the entire photo grid.
export function usePhotoHold(grid: RefObject<HTMLDivElement | null>, images: string[], move: (from: number, to: number) => void, highlight: (from: number | null, to: number | null) => void) {
  const latest = useRef({ images, move, highlight });
  useLayoutEffect(() => { latest.current = { images, move, highlight }; });
  useEffect(() => {
    const root = grid.current;
    if (!root) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let gesture: { id: number; x: number; y: number; startX: number; startY: number; from: number; order: string[]; active: boolean } | null = null;
    let suppressClickUntil = 0;
    const target = () => {
      if (!gesture) return null;
      const card = document.elementFromPoint(gesture.x, gesture.y)?.closest<HTMLElement>('[data-photo-index]');
      return card && root.contains(card) ? Number(card.dataset.photoIndex) : null;
    };
    const reset = () => {
      clearTimeout(timer); cancelAnimationFrame(frame);
      if (gesture?.active) suppressClickUntil = Date.now() + 500;
      gesture = null;
      latest.current.highlight(null, null);
    };
    const tick = () => {
      if (!gesture?.active) return;
      const scroller = root.closest<HTMLElement>('.editor-body');
      if (scroller) {
        const bounds = scroller.getBoundingClientRect();
        const top = Math.max(0, bounds.top), bottom = Math.min(window.innerHeight, bounds.bottom);
        const speed = gesture.y < top + 65 ? -Math.min(12, (top + 65 - gesture.y) / 5) : gesture.y > bottom - 65 ? Math.min(12, (gesture.y - bottom + 65) / 5) : 0;
        scroller.scrollTop += speed;
      }
      latest.current.highlight(gesture.from, target());
      frame = requestAnimationFrame(tick);
    };
    const start = (event: TouchEvent) => {
      reset();
      const element = event.target instanceof Element ? event.target : null;
      if (event.touches.length !== 1 || !element?.closest('.photo-preview') || element.closest('button')) return;
      const card = element.closest<HTMLElement>('[data-photo-index]');
      if (!card) return;
      const touch = event.touches[0];
      gesture = { id: touch.identifier, x: touch.clientX, y: touch.clientY, startX: touch.clientX, startY: touch.clientY, from: Number(card.dataset.photoIndex), order: [...latest.current.images], active: false };
      timer = setTimeout(() => {
        if (!gesture) return;
        gesture.active = true;
        latest.current.highlight(gesture.from, gesture.from);
        tick();
      }, 350);
    };
    const update = (event: TouchEvent) => {
      if (!gesture) return;
      if (event.touches.length !== 1) { reset(); return; }
      const touch = Array.from(event.touches).find(item => item.identifier === gesture!.id);
      if (!touch) { reset(); return; }
      gesture.x = touch.clientX; gesture.y = touch.clientY;
      if (!gesture.active) {
        if (Math.hypot(gesture.x - gesture.startX, gesture.y - gesture.startY) > 8) reset();
        return;
      }
      if (!event.cancelable) { reset(); return; }
      event.preventDefault();
      latest.current.highlight(gesture.from, target());
    };
    const end = (event: TouchEvent) => {
      if (gesture?.active) {
        if (event.cancelable) event.preventDefault();
        const to = target();
        // A concurrent upload/AI replacement must never reorder the wrong photo.
        if (to !== null && gesture.order.length === latest.current.images.length && gesture.order.every((url, index) => url === latest.current.images[index])) latest.current.move(gesture.from, to);
      }
      reset();
    };
    const context = (event: Event) => { if (event.target instanceof Element && event.target.closest('.photo-preview')) event.preventDefault(); };
    const click = (event: Event) => { if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); } };
    root.addEventListener('touchstart', start, { passive: true });
    root.addEventListener('touchmove', update, { passive: false });
    root.addEventListener('touchend', end, { passive: false });
    root.addEventListener('touchcancel', reset);
    root.addEventListener('contextmenu', context);
    root.addEventListener('click', click, true);
    window.addEventListener('blur', reset);
    return () => {
      clearTimeout(timer); cancelAnimationFrame(frame);
      root.removeEventListener('touchstart', start); root.removeEventListener('touchmove', update);
      root.removeEventListener('touchend', end); root.removeEventListener('touchcancel', reset);
      root.removeEventListener('contextmenu', context); root.removeEventListener('click', click, true);
      window.removeEventListener('blur', reset);
    };
  }, [grid]);
}
