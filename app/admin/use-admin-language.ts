'use client';
import { useEffect, useSyncExternalStore } from 'react';
import type { SiteLanguage } from '../language-switch';
const subscribe = (listener: () => void) => { window.addEventListener('storage', listener); window.addEventListener('dnre-language-change', listener); return () => { window.removeEventListener('storage', listener); window.removeEventListener('dnre-language-change', listener); }; };
const snapshot = (): SiteLanguage => { try { return localStorage.getItem('dnre-language') === 'en' ? 'en' : 'vi'; } catch { return 'vi'; } };
const serverSnapshot = (): SiteLanguage => 'vi';
export function useAdminLanguage() {
  const language = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const changeLanguage = (value: SiteLanguage) => { try { localStorage.setItem('dnre-language', value); } catch {} window.dispatchEvent(new Event('dnre-language-change')); };
  const t = (en: string, vi: string) => language === 'vi' ? vi : en;
  return { language, changeLanguage, t };
}
