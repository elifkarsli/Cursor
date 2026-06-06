import { useEffect, useState } from 'react';
import { useLocation } from './useLocation';
import { fetchMapSpots, MapSpot } from '../lib/api';
import { Colors } from '../constants/Colors';

export const riskPinColor = (level: string) =>
  level === 'high' ? Colors.danger : level === 'medium' ? Colors.warning : Colors.secondary;

export const riskLabel = (level: string) =>
  level === 'high' ? 'Yüksek Risk' : level === 'medium' ? 'Orta Risk' : 'Düşük Risk';

export function useParkingMap(radius = 3000) {
  const { coords, loading: locLoading, isReal, granted } = useLocation();
  const [spots, setSpots] = useState<MapSpot[]>([]);
  const [loadingSpots, setLoadingSpots] = useState(true);

  useEffect(() => {
    if (locLoading) return;
    let mounted = true;
    setLoadingSpots(true);
    fetchMapSpots(coords.latitude, coords.longitude, radius)
      .then((data) => mounted && setSpots(data))
      .catch(() => mounted && setSpots([]))
      .finally(() => mounted && setLoadingSpots(false));
    return () => {
      mounted = false;
    };
  }, [coords.latitude, coords.longitude, locLoading, radius]);

  const locationLabel = isReal
    ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
    : locLoading
      ? 'Konum alınıyor...'
      : 'Konum izni verilmedi';

  return {
    coords,
    spots,
    loading: locLoading || loadingSpots,
    isReal,
    granted,
    locationLabel,
    hasSpots: spots.length > 0,
  };
}
