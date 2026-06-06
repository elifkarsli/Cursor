import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GetPark – Boş Park Yeri Bul',
  description:
    'GetPark – Çevrendeki boş park yerlerini saniyeler içinde bul. Topluluk destekli, İstanbul ve İzmir belediye entegrasyonlu akıllı park yeri paylaşım uygulaması.',
  keywords:
    'park yeri bul, otopark, İstanbul park, İzmir park, park paylaş, GetPark, boş park',
  openGraph: {
    type: 'website',
    url: 'https://getparkapp.com/',
    title: 'GetPark – Boş Park Yeri Bul',
    description:
      'Çevrendeki boş park yerlerini saniyeler içinde bul. Topluluk destekli, belediye entegrasyonlu akıllı park yeri paylaşım uygulaması.',
    images: [{ url: 'https://getparkapp.com/logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GetPark – Boş Park Yeri Bul',
    description:
      'Çevrendeki boş park yerlerini saniyeler içinde bul. Topluluk destekli akıllı park yeri paylaşım uygulaması.',
    images: ['https://getparkapp.com/logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/brand-getpark-p.svg" type="image/svg+xml" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />
      </head>
      <body className={inter.className}>
        {children}
        <Script id="tawk-to" strategy="lazyOnload">{`
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/69c914acd69fd51c35e838f0/1jksnhgsj';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `}</Script>
      </body>
    </html>
  )
}
