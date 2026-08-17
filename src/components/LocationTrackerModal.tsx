import React, { useState, useEffect, useMemo } from 'react';
import {
  Navigation,
  MapPin,
  Compass,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Crosshair,
  Maximize2,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MapService, LocationCoordinates } from '../services/mapService';

interface LocationTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationTrackerModal: React.FC<LocationTrackerModalProps> = ({ isOpen, onClose }) => {
  const { selectedCity, setSelectedCity, showToast, businesses = [] } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [detectedLocality, setDetectedLocality] = useState<string | null>(null);

  const cityCoordinates: { name: string; lat: number; lng: number }[] = [
    { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
    { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
    { name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
    { name: 'Rawalpindi', lat: 33.5651, lng: 73.0169 },
    { name: 'Faisalabad', lat: 31.4504, lng: 73.135 },
    { name: 'Peshawar', lat: 34.0151, lng: 71.5249 },
  ];

  // Auto-calculate bounds and dynamic zoom level whenever search city or view refreshes
  const mapBoundsAndZoom = useMemo(() => {
    const currentCityGps = cityCoordinates.find((c) => c.name === selectedCity) || cityCoordinates[0];

    const visibleStores = (businesses || [])
      .filter((b) => !selectedCity || b.city === selectedCity)
      .map((b) => ({
        lat: b.location?.coordinates?.lat || currentCityGps.lat,
        lng: b.location?.coordinates?.lng || currentCityGps.lng,
      }));

    const allPoints = [...visibleStores];
    if (coords) {
      allPoints.push({ lat: coords.lat, lng: coords.lng });
    } else {
      allPoints.push({ lat: currentCityGps.lat, lng: currentCityGps.lng });
    }

    if (allPoints.length === 0) return { zoom: 12, storeCount: 0, center: currentCityGps };

    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;

    allPoints.forEach((p) => {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    });

    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    const maxSpan = Math.max(latSpan, lngSpan);

    let calculatedZoom = 12;
    if (maxSpan < 0.02) calculatedZoom = 15;
    else if (maxSpan < 0.08) calculatedZoom = 14;
    else if (maxSpan < 0.2) calculatedZoom = 13;
    else if (maxSpan < 0.5) calculatedZoom = 11;
    else if (maxSpan < 1.5) calculatedZoom = 9;
    else calculatedZoom = 7;

    return {
      zoom: calculatedZoom,
      storeCount: visibleStores.length,
      center: { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 },
      spanKm: Math.round(maxSpan * 111),
    };
  }, [selectedCity, businesses, coords]);

  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation API is not supported by your browser.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ lat: latitude, lng: longitude, accuracy });

        // Find nearest city
        let closestCity = 'Karachi';
        let minDistance = Infinity;

        cityCoordinates.forEach((c) => {
          const dist = calculateDistanceKm(latitude, longitude, c.lat, c.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = c.name;
          }
        });

        setDetectedLocality(`${closestCity} (GPS Fixed ~${Math.round(minDistance)}km away)`);
        setSelectedCity(closestCity);
        showToast(`GPS Fixed: Location synced to ${closestCity}!`);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg('Location permission was denied. Please allow location access in browser settings.');
        } else {
          setErrorMsg(`Unable to retrieve GPS coordinates (${err.message}). Using manual city selection.`);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (isOpen && !coords) {
      handleRequestLocation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white">GPS Real-Time Location Tracker</h3>
              <p className="text-[11px] text-slate-400">Discover Nearby Deals & Partner Stores</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City Filter & Auto-Zoom bounds header */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">Target Search City:</span>
          </div>

          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              showToast(`City updated to ${e.target.value}! Auto-fitting map zoom bounds...`);
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
          >
            {cityCoordinates.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* GPS Radar & Auto-Fit Bounds Screen */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="flex items-center gap-1 text-emerald-400">
              <Maximize2 className="w-3 h-3" /> Auto-Fit Bounds Active
            </span>
            <span className="text-indigo-400">
              Zoom: {mapBoundsAndZoom.zoom}x | {mapBoundsAndZoom.storeCount} Stores
            </span>
          </div>

          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-950/80 border-2 border-indigo-500 flex items-center justify-center relative shadow-lg shadow-indigo-500/20">
            <Crosshair className={`w-8 h-8 text-indigo-400 ${loading ? 'animate-pulse' : ''}`} />
            <div className="absolute inset-0 rounded-full border border-indigo-500/40 animate-ping opacity-75" />
          </div>

          {loading ? (
            <div className="space-y-1">
              <p className="text-xs font-bold text-indigo-400 flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Requesting Location Permission...
              </p>
              <p className="text-[11px] text-slate-400">Please grant permission in your browser prompt.</p>
            </div>
          ) : coords ? (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-extrabold border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> GPS Location Fixed
              </div>
              <div className="font-mono text-xs text-indigo-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                Lat: {coords.lat.toFixed(4)}° | Lng: {coords.lng.toFixed(4)}° (±{Math.round(coords.accuracy)}m)
              </div>
              {detectedLocality && (
                <div className="text-xs text-slate-300 font-bold">
                  City Matched: <span className="text-emerald-400">{selectedCity}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-400">GPS Tracker Offline</p>
              <p className="text-[11px] text-slate-400">Click below to initiate location permission request.</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Nearby Merchant Distance List */}
        {coords && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Nearby Verified Stores & Distance
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {(businesses || []).slice(0, 4).map((b) => {
                const bLat = b.location?.coordinates?.lat || 24.8607;
                const bLng = b.location?.coordinates?.lng || 67.0011;
                const dist = calculateDistanceKm(coords.lat, coords.lng, bLat, bLng);

                return (
                  <div
                    key={b.id}
                    className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img src={b.logo} alt={b.name} className="w-6 h-6 rounded-lg object-cover" />
                      <span className="font-bold text-slate-200">{b.name}</span>
                    </div>
                    <span className="font-mono text-[11px] font-extrabold text-indigo-400">
                      {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)} km`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleRequestLocation}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <Navigation className="w-3.5 h-3.5" /> Re-Sync GPS Position
          </button>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
