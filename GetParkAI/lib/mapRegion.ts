import type { MapSpot } from './api';

type LatLng = { latitude: number; longitude: number };

export function regionAroundPoint(
  point: LatLng,
  delta = 0.005,
): LatLng & { latitudeDelta: number; longitudeDelta: number } {
  return {
    latitude: point.latitude,
    longitude: point.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

export function regionFittingPoints(
  points: LatLng[],
  options?: { minDelta?: number; maxDelta?: number; padding?: number },
): LatLng & { latitudeDelta: number; longitudeDelta: number } {
  const minDelta = options?.minDelta ?? 0.003;
  const maxDelta = options?.maxDelta ?? 0.015;
  const padding = options?.padding ?? 1.6;

  if (points.length === 0) {
    return regionAroundPoint({ latitude: 0, longitude: 0 });
  }
  if (points.length === 1) {
    return regionAroundPoint(points[0], minDelta);
  }

  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = Math.max((maxLat - minLat) * padding, minDelta);
  const lngSpan = Math.max((maxLng - minLng) * padding, minDelta);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.min(maxDelta, latSpan),
    longitudeDelta: Math.min(maxDelta, lngSpan),
  };
}

export function spotsMapPoints(center: LatLng, spots: MapSpot[]): LatLng[] {
  return [
    center,
    ...spots.map((s) => ({ latitude: s.latitude, longitude: s.longitude })),
  ];
}
