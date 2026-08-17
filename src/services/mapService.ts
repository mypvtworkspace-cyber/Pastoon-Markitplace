export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface StoreLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  coordinates: LocationCoordinates;
  distanceKm?: number;
  estimatedTransitMinutes?: number;
}

export interface RouteInfo {
  origin: LocationCoordinates;
  destination: LocationCoordinates;
  distanceKm: number;
  estimatedMinutes: number;
  steps: string[];
}

/**
 * Calculate Haversine distance between two sets of GPS coordinates in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return 0;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Nearest city lookup coordinates database for auto-sync.
 */
export const CITY_GPS_DATABASE: { name: string; coordinates: LocationCoordinates }[] = [
  { name: 'Karachi', coordinates: { lat: 24.8607, lng: 67.0011 } },
  { name: 'Lahore', coordinates: { lat: 31.5204, lng: 74.3587 } },
  { name: 'Islamabad', coordinates: { lat: 33.6844, lng: 73.0479 } },
  { name: 'Rawalpindi', coordinates: { lat: 33.5651, lng: 73.0169 } },
  { name: 'Faisalabad', coordinates: { lat: 31.4504, lng: 73.135 } },
  { name: 'Peshawar', coordinates: { lat: 34.0151, lng: 71.5249 } },
  { name: 'Multan', coordinates: { lat: 30.1575, lng: 71.5249 } },
];

export class MapService {
  /**
   * Safe browser GPS geolocation wrapper with promise resolution & defensive error handling.
   */
  static async getCurrentUserPosition(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser or device environment.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!pos || !pos.coords) {
            reject(new Error('Invalid position data returned from GPS sensor.'));
            return;
          }
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy || 10,
          });
        },
        (err) => {
          let errorMsg = 'Failed to retrieve location.';
          if (err?.code === err?.PERMISSION_DENIED) {
            errorMsg = 'Location access permission was denied by the browser.';
          } else if (err?.code === err?.POSITION_UNAVAILABLE) {
            errorMsg = 'GPS position is currently unavailable.';
          } else if (err?.code === err?.TIMEOUT) {
            errorMsg = 'Location request timed out.';
          }
          reject(new Error(errorMsg));
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  }

  /**
   * Find nearest city based on user's GPS position
   */
  static findNearestCity(coords: LocationCoordinates): { name: string; distanceKm: number } {
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
      return { name: 'Karachi', distanceKm: 0 };
    }

    let nearest = CITY_GPS_DATABASE[0];
    let minDistance = Infinity;

    for (const city of CITY_GPS_DATABASE || []) {
      const dist = calculateHaversineDistance(
        coords.lat,
        coords.lng,
        city.coordinates.lat,
        city.coordinates.lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearest = city;
      }
    }

    return {
      name: nearest?.name || 'Karachi',
      distanceKm: minDistance === Infinity ? 0 : minDistance,
    };
  }

  /**
   * Compute real-time distance and estimated transit time to partner store
   */
  static calculateStoreRoute(
    userCoords: LocationCoordinates,
    storeCoords: LocationCoordinates
  ): RouteInfo {
    const dist = calculateHaversineDistance(
      userCoords?.lat || 0,
      userCoords?.lng || 0,
      storeCoords?.lat || 0,
      storeCoords?.lng || 0
    );

    const estMinutes = Math.max(5, Math.round(dist * 2 + 5));

    return {
      origin: userCoords,
      destination: storeCoords,
      distanceKm: dist,
      estimatedMinutes: estMinutes,
      steps: [
        'Depart from current GPS location',
        `Proceed along primary avenue towards merchant hub (~${dist} km)`,
        'Arrive at merchant store location & show in-store QR code',
      ],
    };
  }
}
