import * as FileSystem from 'expo-file-system/legacy';
import { API_BASE_URL } from '../constants/api';

export type MapSpot = {
  id: string;
  latitude: number;
  longitude: number;
  urban_index: number;
  risk_level: string; // "low" | "medium" | "high"
};

// Backend'den yakındaki park noktalarını getirir.
// Sistemde veri yoksa boş dizi döner (sahte/örnek veri YOK).
export async function fetchMapSpots(
  lat: number,
  lng: number,
  radius = 2000,
): Promise<MapSpot[]> {
  const url = `${API_BASE_URL}/api/v1/parking/map?lat=${lat}&lng=${lng}&radius=${radius}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Harita verisi alınamadı (${res.status})`);
  }
  const json = await res.json();
  return Array.isArray(json?.spots) ? json.spots : [];
}

export type UploadParkingResult = {
  spot_id: string;
  urban_parking_index: number;
  empty_spaces: number;
  occupied_spaces: number;
  risk_level: string;
  kvkk_blur_applied: boolean;
};

async function resolveUploadUri(imageUri: string): Promise<string> {
  if (imageUri.startsWith('file://')) return imageUri;
  const dest = `${FileSystem.cacheDirectory}parking-upload-${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: imageUri, to: dest });
  return dest;
}

// Fotoğraf + konum ile park yerini sisteme yükler (Gemini analizi + DB kaydı).
export async function uploadParkingSpot(
  imageUri: string,
  lat: number,
  lng: number,
): Promise<UploadParkingResult> {
  const fileUri = await resolveUploadUri(imageUri);

  const response = await FileSystem.uploadAsync(
    `${API_BASE_URL}/api/v1/parking/analyze`,
    fileUri,
    {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'image',
      mimeType: 'image/jpeg',
      parameters: {
        lat: String(lat),
        lng: String(lng),
      },
      headers: { Accept: 'application/json' },
    },
  );

  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(response.body);
  } catch {
    throw new Error('Sunucu yanıtı okunamadı');
  }

  if (response.status < 200 || response.status >= 300) {
    const msg = (json.message as string) ?? (json.error as string) ?? `Yükleme başarısız (${response.status})`;
    throw new Error(msg);
  }
  return json as UploadParkingResult;
}
