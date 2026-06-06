// Backend API taban adresi.
// Canlı: hackathon.getpark.org (Cloudflare)
// Yerel geliştirme: GetParkAI/.env → EXPO_PUBLIC_API_URL=http://MAC_IP:8080
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://hackathon.getpark.org';
