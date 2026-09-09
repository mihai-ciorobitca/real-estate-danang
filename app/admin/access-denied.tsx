'use client';
import Link from 'next/link';
import LanguageSwitch from '../language-switch';
import { useAdminLanguage } from './use-admin-language';
export default function AccessDenied({ email, signOutPath }: {email:string;signOutPath:string}) {
  const {language,changeLanguage,t}=useAdminLanguage();
  return <main className="studio-login" lang={language}><section className="studio-login-scene"><img src="/luxury/brand-dragon-v5.png" alt="Da Nang Real Estate"/></section><section className="studio-login-panel"><LanguageSwitch language={language} onChange={changeLanguage}/><h1>{t('Admin access required.','Cần quyền quản trị.')}</h1><p>{t('This account does not have permission to manage properties.','Tài khoản này không có quyền quản lý bất động sản.')}<br/>{email}</p><a href={signOutPath}>{t('Use another account','Sử dụng tài khoản khác')}</a><Link href="/">{t('Back to website','Quay lại website')}</Link></section></main>;
}
