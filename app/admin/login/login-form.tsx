'use client';
import Link from 'next/link';
import LanguageSwitch from '../../language-switch';
import { useAdminLanguage } from '../use-admin-language';
export default function LoginForm({ returnTo, error }: { returnTo: string; error: boolean }) {
  const { language, changeLanguage, t } = useAdminLanguage();
  return <main className="studio-login" lang={language}>
    <section className="studio-login-scene"><Link href="/"><img src="/luxury/brand-dragon-v5.png" alt="Da Nang Real Estate" /></Link><h2>{t('Beautiful homes. Thoughtfully managed.','Những tổ ấm đẹp. Được chăm sóc tận tâm.')}</h2></section>
    <section className="studio-login-panel"><LanguageSwitch language={language} onChange={changeLanguage}/><h1>{t('Welcome back.','Chào mừng trở lại.')}</h1><p>{t('Sign in to manage your properties, photos and listings.','Đăng nhập để quản lý bất động sản, hình ảnh và tin đăng của bạn.')}</p>
      <form action="/api/admin/login" method="post"><input type="hidden" name="returnTo" value={returnTo}/>
        <label>{t('Email address','Địa chỉ email')}<input name="email" type="email" required autoComplete="username" placeholder="you@example.com"/></label>
        <label>{t('Password','Mật khẩu')}<input name="password" type="password" required autoComplete="current-password"/></label>
        {error && <div className="studio-login-error" role="alert">{t('Incorrect email or password. Please try again.','Email hoặc mật khẩu không đúng. Vui lòng thử lại.')}</div>}
        <button type="submit">{t('Sign in','Đăng nhập')}</button>
      </form><Link href="/">{t('Back to the website','Quay lại website')}</Link>
    </section>
  </main>;
}
