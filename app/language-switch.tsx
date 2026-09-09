'use client';

export type SiteLanguage = 'en' | 'vi';
export default function LanguageSwitch({ language, onChange }: { language: SiteLanguage; onChange: (language: SiteLanguage) => void }) {
  return <div className="language-switch" role="group" aria-label={language === 'vi' ? 'Ngôn ngữ' : 'Language'}>
    {(['vi', 'en'] as const).map((value) => <button key={value} type="button" onClick={() => onChange(value)} aria-pressed={language === value} aria-label={value === 'vi' ? 'Tiếng Việt' : 'English'} title={value === 'vi' ? 'Tiếng Việt' : 'English'}>
      {value === 'vi' ? <svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#da251d"/><path d="m15 3 1.6 5h5.2l-4.2 3 1.6 5-4.2-3-4.2 3 1.6-5-4.2-3h5.2z" fill="#ffdf00"/></svg> : <svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#fff"/><path d="M12 0h6v20h-6zM0 7h30v6H0z" fill="#ce1124"/></svg>}
      <span>{value.toUpperCase()}</span>
    </button>)}
  </div>;
}
