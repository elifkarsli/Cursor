'use client'

import { useEffect, useRef, useState } from 'react'

type Lang = 'tr' | 'en'
type City = 'istanbul' | 'izmir'

interface MapProps {
  lang: Lang
}

interface Spot {
  ll: [number, number]
  title: string
  info: string
  badge: string
  bc: string
  iconType: 'user' | 'muni' | 'full'
}

interface CityData {
  center: [number, number]
  zoom: number
  spots: Spot[]
}

const cities: Record<City, CityData> = {
  istanbul: {
    center: [41.015, 28.978],
    zoom: 13,
    spots: [
      {
        ll: [41.02, 28.976],
        title: 'Kadıköy, Moda Cd.',
        info: '150m · 3 dk önce paylaşıldı',
        badge: 'Boş',
        bc: 'pop-green',
        iconType: 'user',
      },
      {
        ll: [41.043, 29.009],
        title: 'Beşiktaş, Sinanpaşa',
        info: '320m · 8 dk önce paylaşıldı',
        badge: 'Boş',
        bc: 'pop-green',
        iconType: 'user',
      },
      {
        ll: [41.062, 28.987],
        title: 'Şişli, Büyükdere Cd.',
        info: 'Kullanıcı paylaşımı',
        badge: 'Dolu',
        bc: 'pop-red',
        iconType: 'full',
      },
      {
        ll: [41.008, 28.97],
        title: 'Fatih, Millet Cd.',
        info: '200m · 15 dk önce paylaşıldı',
        badge: 'Boş',
        bc: 'pop-green',
        iconType: 'user',
      },
      {
        ll: [41.035, 28.95],
        title: 'Zeytinburnu, E5',
        info: 'Kullanıcı paylaşımı',
        badge: 'Dolu',
        bc: 'pop-red',
        iconType: 'full',
      },
      {
        ll: [41.068, 29.005],
        title: 'Levent Otoparkı',
        info: 'Kapasite: 350 · Boş: 127',
        badge: 'Belediye',
        bc: 'pop-blue',
        iconType: 'muni',
      },
      {
        ll: [41.013, 28.978],
        title: 'Kapalıçarşı Otoparkı',
        info: 'Kapasite: 200 · Boş: 152',
        badge: 'Belediye',
        bc: 'pop-blue',
        iconType: 'muni',
      },
      {
        ll: [41.0365, 28.985],
        title: 'Taksim Meydanı Otoparkı',
        info: 'Kapasite: 210 · Boş: 23',
        badge: 'Doluyor',
        bc: 'pop-red',
        iconType: 'muni',
      },
    ],
  },
  izmir: {
    center: [38.418, 27.128],
    zoom: 13,
    spots: [
      {
        ll: [38.4192, 27.1287],
        title: 'Konak Meydanı Otoparkı',
        info: 'Kapasite: 150 · Boş: 119',
        badge: 'Belediye',
        bc: 'pop-blue',
        iconType: 'muni',
      },
      {
        ll: [38.4382, 27.143],
        title: 'Alsancak Otoparkı',
        info: 'Kapasite: 120 · Boş: 22',
        badge: 'Doluyor',
        bc: 'pop-red',
        iconType: 'muni',
      },
      {
        ll: [38.425, 27.138],
        title: 'Alsancak, Kıbrıs Şehitleri',
        info: '80m · 5 dk önce paylaşıldı',
        badge: 'Boş',
        bc: 'pop-green',
        iconType: 'user',
      },
      {
        ll: [38.415, 27.131],
        title: 'Konak, Anafartalar',
        info: 'Kullanıcı paylaşımı',
        badge: 'Boş',
        bc: 'pop-green',
        iconType: 'user',
      },
      {
        ll: [38.43, 27.145],
        title: 'Karşıyaka Çarşı',
        info: 'Kullanıcı paylaşımı',
        badge: 'Dolu',
        bc: 'pop-red',
        iconType: 'full',
      },
      {
        ll: [38.42, 27.15],
        title: 'Bornova, Şair Eşref',
        info: '120m · 12 dk önce paylaşıldı',
        badge: 'Boş',
        bc: 'pop-green',
        iconType: 'user',
      },
    ],
  },
}

declare global {
  interface Window {
    L: any
  }
}

export default function Map({ lang }: MapProps) {
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [city, setCity] = useState<City>('istanbul')

  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en)

  const makeIcon = (L: any, color: string, emoji: string) =>
    L.divIcon({
      className: '',
      html: `<div class="gp-marker" style="background:${color}">${emoji}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    })

  useEffect(() => {
    let mounted = true

    const initMap = async () => {
      if (!mapContainerRef.current) return
      if (window.L && mapRef.current) return

      if (!window.L) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector(
            'script[src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"]'
          ) as HTMLScriptElement | null

          if (existing) {
            if ((window as any).L) {
              resolve()
              return
            }
            existing.addEventListener('load', () => resolve(), { once: true })
            existing.addEventListener('error', () => reject(new Error('Leaflet load error')), {
              once: true,
            })
            return
          }

          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Leaflet load error'))
          document.body.appendChild(script)
        })
      }

      if (!mounted || !window.L || !mapContainerRef.current) return

      const L = window.L
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      mapRef.current = map
      loadCity('istanbul')
    }

    const loadCity = (cityKey: City) => {
      if (!mapRef.current || !window.L) return

      const L = window.L
      const map = mapRef.current
      const cityData = cities[cityKey]
      const iconUser = makeIcon(L, '#2563EB', '🅿')
      const iconMuni = makeIcon(L, '#059669', '🏛')
      const iconFull = makeIcon(L, '#DC2626', '🅿')

      markersRef.current.forEach((m) => map.removeLayer(m))
      markersRef.current = []

      map.setView(cityData.center, cityData.zoom)

      cityData.spots.forEach((spot) => {
        const icon =
          spot.iconType === 'muni' ? iconMuni : spot.iconType === 'full' ? iconFull : iconUser
        const marker = L.marker(spot.ll, { icon })
          .bindPopup(
            `<div class="pop-inner">
              <div class="pop-title">${spot.title}</div>
              <div class="pop-info">${spot.info}</div>
              <span class="pop-badge ${spot.bc}">${spot.badge}</span>
            </div>`,
            { className: 'gp-popup' }
          )
          .addTo(map)
        markersRef.current.push(marker)
      })
    }

    initMap()

    return () => {
      mounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !window.L) return

    const L = window.L
    const map = mapRef.current
    const cityData = cities[city]
    const iconUser = makeIcon(L, '#2563EB', '🅿')
    const iconMuni = makeIcon(L, '#059669', '🏛')
    const iconFull = makeIcon(L, '#DC2626', '🅿')

    markersRef.current.forEach((m) => map.removeLayer(m))
    markersRef.current = []

    map.setView(cityData.center, cityData.zoom)

    cityData.spots.forEach((spot) => {
      const icon = spot.iconType === 'muni' ? iconMuni : spot.iconType === 'full' ? iconFull : iconUser
      const marker = L.marker(spot.ll, { icon })
        .bindPopup(
          `<div class="pop-inner">
            <div class="pop-title">${spot.title}</div>
            <div class="pop-info">${spot.info}</div>
            <span class="pop-badge ${spot.bc}">${spot.badge}</span>
          </div>`,
          { className: 'gp-popup' }
        )
        .addTo(map)
      markersRef.current.push(marker)
    })
  }, [city])

  return (
    <div className="map-shell fu">
      <div className="map-tabs">
        <button className={`map-tab ${city === 'istanbul' ? 'active' : ''}`} onClick={() => setCity('istanbul')}>
          {t('İstanbul', 'Istanbul')}
        </button>
        <button className={`map-tab ${city === 'izmir' ? 'active' : ''}`} onClick={() => setCity('izmir')}>
          {t('İzmir', 'İzmir')}
        </button>
      </div>
      <div id="gp-map" ref={mapContainerRef} />
      <div className="map-legend">
        <div className="ml-item">
          <span className="ml-dot" style={{ background: '#2563EB' }} />
          <span>{t('Kullanıcı Paylaşımı', 'User Shared')}</span>
        </div>
        <div className="ml-item">
          <span className="ml-dot" style={{ background: '#059669', border: '2px solid #fff' }} />
          <span>{t('Belediye Otoparkı', 'Municipal Car Park')}</span>
        </div>
        <div className="ml-item">
          <span className="ml-dot" style={{ background: '#DC2626' }} />
          <span>{t('Dolu', 'Occupied')}</span>
        </div>
      </div>
    </div>
  )
}
