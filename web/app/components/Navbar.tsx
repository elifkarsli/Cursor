'use client'

import { useEffect, useState } from 'react'

type Lang = 'tr' | 'en'

interface NavbarProps {
  lang: Lang
  setLang: (lang: Lang) => void
}

export default function Navbar({ lang, setLang }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en)

  const links = [
    { href: '#top', tr: 'Ana Sayfa', en: 'Home', active: true },
    { href: '#about', tr: 'Hakkımızda', en: 'About' },
    { href: '#features', tr: 'Özellikler', en: 'Features' },
    { href: '#cta', tr: 'Fiyatlandırma', en: 'Pricing' },
    { href: '#map', tr: 'Blog', en: 'Blog' },
    { href: '#footer', tr: 'İletişim', en: 'Contact' },
  ]

  return (
    <>
      <nav style={scrolled ? { boxShadow: '0 8px 24px rgba(0,0,0,.06)' } : undefined}>
        <a className="nav-logo" href="#top">
          <span className="nav-brand-text">getpark</span>
        </a>

        <div className="nav-links">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={link.active ? 'active' : ''}>
              {t(link.tr, link.en)}
            </a>
          ))}
        </div>

        <div className="nav-right">
          <div className="lang-box">
            <button className={`lang-btn ${lang === 'tr' ? 'active' : ''}`} onClick={() => setLang('tr')}>
              TR
            </button>
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>
              EN
            </button>
          </div>
          <a className="btn-cta" href="#footer">
            {t('İletişime Geç', 'Get in Touch')}
          </a>
        </div>

        <button className="nav-ham" onClick={() => setMenuOpen((v) => !v)}>
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div className={`mob-menu ${menuOpen ? 'open' : ''}`} id="mob">
        {links.map((link) => (
          <a
            key={`m-${link.href}`}
            href={link.href}
            className={link.active ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            {t(link.tr, link.en)}
          </a>
        ))}
      </div>
    </>
  )
}