import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type Coords = { latitude: number; longitude: number };

export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [granted, setGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReal, setIsReal] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        // Önce son bilinen konumu dene (daha hızlı)
        const last = await Location.getLastKnownPositionAsync();
        if (last && mounted) {
          setCoords({ latitude: last.coords.latitude, longitude: last.coords.longitude });
          setGranted(true);
          setIsReal(true);
        }

        // Ardından güncel konumu al
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (mounted) {
          setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setGranted(true);
          setIsReal(true);
        }
      } catch {
        // Native modül yok veya izin reddedildi
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Konum alınamadıysa harita için geçici merkez (marker göstermez, sadece fallback)
  const safeCoords: Coords = coords ?? { latitude: 41.0082, longitude: 28.9784 };

  return { coords: safeCoords, rawCoords: coords, granted, loading, isReal };
}
