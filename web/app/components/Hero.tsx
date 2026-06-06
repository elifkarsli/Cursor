'use client'

type Lang = 'tr' | 'en'

interface HeroProps {
  lang: Lang
}

export default function Hero({ lang }: HeroProps) {
  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en)
  const h = (tr: string, en: string) => ({ __html: lang === 'tr' ? tr : en })

  return (
    <section className="hero">
      <div className="hero-in">
        <div>
          <div className="badge fu">
            <span className="bd" />
            <span>{t('Tek Abonelik · Tüm Özellikler', 'One Subscription · All Features')}</span>
          </div>
          <h1
            className="fu"
            dangerouslySetInnerHTML={h(
              "Boş Park Yeri<br>Bulmak Artık<br><span class='hl'>Çok Kolay</span>",
              "Finding Parking<br>Has Never Been<br><span class='hl'>This Easy</span>"
            )}
          />
          <p className="fu">
            {t(
              "GetPark'a abone ol — harita, fotoğraf, navigasyon, bildirim ve daha fazlası tek pakette. Yayalar ücretsiz park yeri paylaşabilir.",
              'Subscribe to GetPark — map, photos, navigation, notifications and more in one plan. Pedestrians can share parking spots for free.'
            )}
          </p>
          <div className="hero-btns fu">
            <a href="#" className="store-btn dk">
              <span className="si">🍎</span>
              <span className="st">
                <span className="ss">{t("App Store'dan İndir", 'Download on the')}</span>
                <span className="sn">App Store</span>
              </span>
            </a>
            <a href="#" className="store-btn lt">
              <span className="si">▶️</span>
              <span className="st">
                <span className="ss">{t("Google Play'den İndir", 'Get it on')}</span>
                <span className="sn">Google Play</span>
              </span>
            </a>
          </div>
          <div className="hero-stats fu">
            <div className="hstat">
              <div className="n">10K+</div>
              <div className="l">{t('Aktif Kullanıcı', 'Active Users')}</div>
            </div>
            <div className="hstat">
              <div className="n">50K+</div>
              <div className="l">{t('Park Yeri Paylaşıldı', 'Spots Shared')}</div>
            </div>
            <div className="hstat">
              <div className="n">4.8★</div>
              <div className="l">{t('Kullanıcı Puanı', 'User Rating')}</div>
            </div>
          </div>
        </div>
        <div className="hero-vis">
          <div style={{ position: 'relative' }}>
            <div className="phone">
              <div className="phone-notch" />
              <div className="phone-body">
                <div className="phone-map">
                  🗺️
                  <div className="pin" style={{ top: '28%', left: '44%' }}>
                    📍
                  </div>
                  <div className="pin" style={{ top: '52%', left: '24%', animationDelay: '.8s' }}>
                    📍
                  </div>
                  <div className="pin" style={{ top: '44%', left: '64%', animationDelay: '1.4s' }}>
                    📍
                  </div>
                </div>
                <div className="phone-card">
                  <div className="ci">🅿️</div>
                  <div className="ct">
                    <div className="t">{t('Bağcılar, Merkez Cd.', 'Downtown Parking')}</div>
                    <div className="s">{t('320m uzakta · 5 boş yer', '320m away · 5 spots free')}</div>
                  </div>
                  <div className="cb">{t('Boş', 'Free')}</div>
                </div>
              </div>
            </div>
            <div className="fc fc1">
              <span className="fi">📸</span>
              <div className="ft">
                <div className="t1">{t('Fotoğraf Doğrulandı', 'Photo Verified')}</div>
                <div className="t2">{t('Az önce', 'Just now')}</div>
              </div>
            </div>
            <div className="fc fc2">
              <span className="fi">✅</span>
              <div className="ft">
                <div className="t1">{t('Abonelik Aktif', 'Subscription Active')}</div>
                <div className="t2">{t('Tüm özellikler açık', 'All features unlocked')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
