import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Megaphone,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Advertisement, SystemConfig } from '../types';

interface SponsoredAdsBannerProps {
  systemConfig: SystemConfig;
  activeAds?: Advertisement[];
  onAdClick?: (ad: Advertisement) => void;
  onRequestAdCreation?: () => void;
}

export const SponsoredAdsBanner: React.FC<SponsoredAdsBannerProps> = ({
  systemConfig,
  activeAds = [],
  onAdClick,
  onRequestAdCreation,
}) => {
  const [ads, setAds] = useState<Advertisement[]>(activeAds);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeAds.length > 0) {
      setAds(activeAds);
    } else {
      // Fetch active ads from rotation engine endpoint
      fetch('/api/v1/advertisements/active')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setAds(data.data);
          }
        })
        .catch((err) => console.error('Failed to load active advertisements', err));
    }
  }, [activeAds]);

  // Log impression for current ad
  useEffect(() => {
    if (ads.length > 0 && ads[currentIndex]) {
      const currentAd = ads[currentIndex];
      fetch(`/api/v1/advertisements/${currentAd.id}/impression`, { method: 'POST' }).catch(() => {});
    }
  }, [currentIndex, ads]);

  // Auto-rotate ads every 8 seconds if multiple exist
  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (!ads || ads.length === 0) return null;

  const currentAd = ads[currentIndex] || ads[0];
  if (!currentAd) return null;

  const handleCardClick = () => {
    // Send click to anti-fraud endpoint
    fetch(`/api/v1/advertisements/${currentAd.id}/click`, { method: 'POST' }).catch(() => {});
    if (onAdClick) onAdClick(currentAd);
  };

  return (
    <div className="w-full my-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-purple-500/20">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Ad Image / Visual Badge */}
          <div className="relative w-full md:w-48 h-36 md:h-28 shrink-0 rounded-xl overflow-hidden shadow-md">
            <img
              src={currentAd.images?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800'}
              alt={currentAd.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1">
              <Megaphone className="w-3 h-3" />
              <span>Sponsored</span>
            </div>
            {currentAd.promotionalBadge && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-md text-[10px] font-semibold text-white truncate max-w-[90%]">
                {currentAd.promotionalBadge}
              </div>
            )}
          </div>

          {/* Ad Copy & Details */}
          <div className="flex-1 text-center md:text-left space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                {currentAd.businessName}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                {currentAd.category}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-medium">
                <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                Score: {currentAd.qualityScore}/100
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-1">
              {currentAd.title}
            </h3>

            <p className="text-xs text-slate-300 line-clamp-2 max-w-2xl">
              {currentAd.description}
            </p>

            {currentAd.discountDetails && (
              <div className="inline-block mt-1 text-xs font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {currentAd.discountDetails}
              </div>
            )}
          </div>

          {/* Action CTA & Rotation indicators */}
          <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={handleCardClick}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>Explore Campaign</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {onRequestAdCreation && (
              <button
                onClick={onRequestAdCreation}
                className="text-[11px] text-purple-300 hover:text-white underline transition-colors cursor-pointer"
              >
                Promote your business here
              </button>
            )}

            {/* Rotation Dots */}
            {ads.length > 1 && (
              <div className="flex items-center space-x-1.5 mt-1">
                {ads.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
