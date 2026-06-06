# GetPark Backend — hackathon.getpark.org Canlıya Alma

Cloudflare DNS zaten `hackathon.getpark.org` için açılmış. **525 hatası** = origin (arka uç sunucu) henüz bağlı değil.

En hızlı yol: **VPS + Docker + Cloudflare Tunnel** (port açmaya gerek yok, HTTPS otomatik).

## Gereksinimler

- Bir VPS (Hetzner, DigitalOcean, Railway VM vb.) veya sürekli açık bir sunucu
- Supabase DB bilgileri (mevcut `.env` değerleri)
- `GEMINI_API_KEY` ve `STREETVIEW_API_KEY`
- Cloudflare hesabında `getpark.org` zone erişimi

---

## 1) Backend'i sunucuda çalıştır

```bash
# Sunucuda
git clone <repo-url>
cd getpark-backend/deployments

cp .env.production.example .env.production
nano .env.production   # Supabase + API key'leri gir
```

Supabase için **Transaction Pooler** kullan (port `6543`, user `postgres.PROJECT_REF`).

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f api
```

Test:

```bash
curl http://127.0.0.1:8080/health/live
curl "http://127.0.0.1:8080/api/v1/parking/map?lat=41.0&lng=29.0&radius=500"
```

---

## 2) Cloudflare Tunnel bağla

Sunucuda:

```bash
# cloudflared kur (Debian/Ubuntu örneği)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

cloudflared tunnel login
cloudflared tunnel create getpark-hackathon
```

Config:

```bash
sudo mkdir -p /etc/cloudflared
sudo cp cloudflared.config.example.yml /etc/cloudflared/config.yml
# credentials dosyası: ~/.cloudflared/<tunnel-id>.json → /etc/cloudflared/getpark-hackathon.json
```

DNS route:

```bash
cloudflared tunnel route dns getpark-hackathon hackathon.getpark.org
```

Servis olarak başlat:

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

---

## 3) Cloudflare SSL ayarı

Tunnel kullanıyorsan ekstra ayar gerekmez.

Doğrudan VPS IP'sine proxy yapıyorsan:
- **SSL/TLS → Overview → Full** (origin'de sertifika yoksa Flexible, güvenlik daha düşük)

---

## 4) Mobil uygulama

`GetParkAI/constants/api.ts` production URL:

```
https://hackathon.getpark.org
```

Yerel geliştirme için `GetParkAI/.env`:

```
EXPO_PUBLIC_API_URL=http://MAC_IP:8080
```

---

## 5) Canlı doğrulama

```bash
curl https://hackathon.getpark.org/health/live
curl "https://hackathon.getpark.org/api/v1/parking/map?lat=41.0&lng=29.0&radius=500"
```

Beklenen: `{"status":"alive"}` ve `{"count":...,"spots":[...]}`

---

## Sorun giderme

| Hata | Çözüm |
|------|--------|
| Cloudflare **525** | Tunnel çalışmıyor veya origin kapalı — `systemctl status cloudflared`, `docker ps` |
| **502** | API container down — `docker compose logs api` |
| Parking endpoint yok | `GEMINI_API_KEY` / `STREETVIEW_API_KEY` eksik |
| DB bağlantı hatası | Supabase pooler port 6543 + `default_query_exec_mode` (kodda var) |
| Fotoğraf upload timeout | `SERVER_WRITE_TIMEOUT_SECONDS=120` |
