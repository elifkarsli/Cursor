'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Hero from './components/Hero'
import Navbar from './components/Navbar'

const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
})

type Lang = 'tr' | 'en'

export default function Home() {
  const [lang, setLang] = useState<Lang>('tr')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.fu').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en)

  return (
    <>
      <div id="top" />
      <Navbar lang={lang} setLang={setLang} />
      <Hero lang={lang} />

      <section className="tight-section">
        <div className="inner">
          <h2 className="slogan-line fu">
            {t(
              'Park yeri bulmak artık stres değil, birkaç dokunuşluk bir çözüm.',
              'Finding parking is no longer stressful, just a few taps away.'
            )}
          </h2>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="inner">
          <div className="fu">
            <div>
              <div className="head" style={{ marginBottom: 0 }}>
                <h2 className="h2">{t('GetPark Hakkında', 'About GetPark')}</h2>
                <p className="sub about-copy">
                  {t(
                    'GetPark, şehir içi park yeri bulmayı hızlandıran, kolaylaştıran ve daha akıllı hale getiren yeni nesil bir mobil platformdur. Kullanıcıların boş park yerlerini fotoğrafla paylaşabildiği, sürücülerin ise anlık olarak en yakın uygun noktaları keşfedip navigasyonla yönlendirilebildiği bir ekosistem oluşturuyoruz.',
                    'GetPark is a next-generation mobile platform that speeds up, simplifies, and smartens urban parking. We build an ecosystem where users share empty spots with photos, while drivers instantly discover the nearest suitable points and get navigated there.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features">
        <div className="inner">
          <div className="head c fu">
            <div className="label">{t('ÖZELLİKLER', 'FEATURES')}</div>
            <h2 className="h2">{t('Neden GetPark AI?', 'Why GetPark AI?')}</h2>
          </div>
          <div className="how-g">
            <div className="how-c fu">
              <h3>{t('Araç-Park Eşleştirme (AI destekli)', 'Vehicle-Parking Match (AI powered)')}</h3>
              <p>
                {t(
                  'Aracının fotoğrafını yükle, Gemini Vision boyutlarını çıkarsın. Haritada sadece aracının sığacağı park yerleri görünsün. Sığmayanlar hiç gösterilmez.',
                  'Upload your car photo, let Gemini Vision extract dimensions. Show only spots your vehicle fits. Non-fitting spots are never shown.'
                )}
              </p>
            </div>
            <div className="how-c fu">
              <h3>{t('KVKK Uyumlu Gizlilik', 'KVKK-Compliant Privacy')}</h3>
              <p>
                {t(
                  'Hiçbir görüntü saklanmaz. Yüz ve plaka blur uygulanır. AI analiz ettikten sonra görüntüyü anında siler. Sadece anonim JSON verisi kaydedilir.',
                  'No image is stored. Face and plate blur is applied. After AI analysis, the image is deleted instantly. Only anonymous JSON is saved.'
                )}
              </p>
            </div>
            <div className="how-c fu">
              <h3>{t('Urban Parking Index', 'Urban Parking Index')}</h3>
              <p>
                {t(
                  'Her park alanı 0-100 arası skorlanır. Doluluk, erişilebilirlik ve AI güvenilirliği hesaba katılır. Engelli alan boyutları ve kaldırım işgali tespit edilir.',
                  'Each parking area gets a 0-100 score. Occupancy, accessibility, and AI confidence are included. Disabled-space dimensions and sidewalk blocking are detected.'
                )}
              </p>
            </div>
            <div className="how-c fu">
              <h3>{t('Street View Entegrasyonu', 'Street View Integration')}</h3>
              <p>
                {t(
                  'Koordinat gir, Google Street View görüntüsü otomatik alınsın. AI analiz etsin, park skoru üretsin. Kullanıcı fotoğrafı olmadan da çalışır.',
                  'Enter coordinates, fetch Google Street View automatically. Let AI analyze and generate a parking score. Works without user photos too.'
                )}
              </p>
            </div>
            <div className="how-c fu">
              <h3>{t('Gerçek Zamanlı Harita', 'Real-Time Map')}</h3>
              <p>
                {t(
                  'Çevrendeki park noktalarını haritada gör. Sadece aracına uygun olanlar gösterilir. Yeşil/sarı/kırmızı renk kodlaması ile anlık durum.',
                  'See nearby parking points on the map. Only vehicle-compatible ones are shown. Live status with green/yellow/red coding.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="inner">
          <div className="head c fu">
            <div className="label">{t('NASIL ÇALIŞIR', 'HOW IT WORKS')}</div>
            <h2 className="h2">{t('4 Adımda Başla', 'Get Started in 4 Steps')}</h2>
            <p className="sub">
              {t(
                "GetPark'ı kullanmak son derece basit. İndir, abone ol, bul, git.",
                'Using GetPark is incredibly simple. Download, subscribe, find, go.'
              )}
            </p>
          </div>
          <div className="how-g">
            <div className="how-c fu">
              <div className="how-n">01</div>
              <div className="how-i dot-blue">📱</div>
              <h3>{t('Aracını Kaydet', 'Register Your Vehicle')}</h3>
              <p>{t('Fotoğraf çek, AI boyutları çıkarsın, fotoğraf silinsin.', 'Take a photo, let AI extract dimensions, then delete the photo.')}</p>
            </div>
            <div className="how-c fu">
              <div className="how-n">02</div>
              <div className="how-i dot-teal">🎫</div>
              <h3>{t('Park Yeri Bul', 'Find a Parking Spot')}</h3>
              <p>{t('Haritada sadece aracının sığacağı yerler görünsün.', 'See only spots where your vehicle can fit on the map.')}</p>
            </div>
            <div className="how-c fu">
              <div className="how-n">03</div>
              <div className="how-i dot-green">🗺️</div>
              <h3>{t('Navigate Et', 'Start Navigation')}</h3>
              <p>{t('Tek tuşla seçtiğin park yerine navigasyon başlat.', 'Start navigation to your selected spot with one tap.')}</p>
            </div>
            <div className="how-c fu">
              <div className="how-n">04</div>
              <div className="how-i dot-orange">📸</div>
              <h3>{t('Sen de Paylaş', 'Share Too')}</h3>
              <p>{t('Boş park yeri gördüğünde fotoğraf çek, topluluğa katkı sağla.', 'Snap a photo when you spot an empty parking place and contribute to the community.')}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="map">
        <div className="inner">
          <Map lang={lang} />
        </div>
      </section>

      <section id="cta" className="cta-w">
        <div className="cta-in">
          <div className="cta-bdg">
            <span className="bd" />
            <span>{t('Ücretsiz Dene', 'Try for Free')}</span>
          </div>
          <h2
            dangerouslySetInnerHTML={{
              __html: lang === 'tr' ? 'Park Sorununuzu<br>Bugün Çözün' : 'Solve Your Parking<br>Problem Today',
            }}
          />
          <p>{t("GetPark'ı şimdi indir, abone ol ve tüm özelliklerin keyfini çıkar.", 'Download GetPark now, subscribe and enjoy all features.')}</p>
          <div className="cta-btns">
            <a href="#" className="store-btn cw">
              <span className="si">🍎</span>
              <span className="st">
                <span className="ss">{t("App Store'dan İndir", 'Download on the')}</span>
                <span className="sn">App Store</span>
              </span>
            </a>
            <a href="#" className="store-btn cd">
              <span className="si">▶️</span>
              <span className="st">
                <span className="ss">{t("Google Play'den İndir", 'Get it on')}</span>
                <span className="sn">Google Play</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      <footer id="footer">
        <div className="ft-grid">
          <div className="ft-brand">
            <div className="fl">
              <img src="/brand-getpark-p.jpg" alt="GetPark" className="footer-brand-logo" />
            </div>
            <p>{t('Topluluk destekli park yeri paylaşım platformu. Abone ol, bul, git.', 'Community-powered parking platform. Subscribe, find, go.')}</p>
            <div className="ft-socials">
              <a href="https://instagram.com/getparkapp" target="_blank" rel="noreferrer" title="Instagram">📸</a>
              <a href="mailto:info@getpark.org" title="Email">✉️</a>
            </div>
          </div>
          <div className="ft-col">
            <h4>{t('SAYFALAR', 'PAGES')}</h4>
            <ul>
              <li><a href="#top">{t('Ana Sayfa', 'Home')}</a></li>
              <li><a href="#about">{t('Hakkımızda', 'About')}</a></li>
              <li><a href="#features">{t('Özellikler', 'Features')}</a></li>
              <li><a href="#cta">{t('Fiyatlandırma', 'Pricing')}</a></li>
              <li><a href="#map">Blog</a></li>
              <li><a href="#footer">{t('İletişim', 'Contact')}</a></li>
            </ul>
          </div>
          <div className="ft-col">
            <h4>{t('UYGULAMA', 'APP')}</h4>
            <ul>
              <li><a href="#">App Store</a></li>
              <li><a href="#">Google Play</a></li>
            </ul>
          </div>
          <div className="ft-col">
            <h4>{t('İLETİŞİM', 'CONTACT')}</h4>
            <ul>
              <li><a href="mailto:info@getpark.org">info@getpark.org</a></li>
              <li><a href="https://instagram.com/getparkapp" target="_blank" rel="noreferrer">@getparkapp</a></li>
            </ul>
          </div>
        </div>
        <div className="ft-bot">
          <p>{t('© 2026 GetPark. Tüm hakları saklıdır.', '© 2026 GetPark. All rights reserved.')}</p>
          <div className="ft-bot-links">
            <a href="/privacy">{t('Gizlilik Politikası', 'Privacy Policy')}</a>
            <a href="/terms">{t('Kullanım Koşulları', 'Terms of Service')}</a>
          </div>
        </div>
      </footer>
    </>
  )
}