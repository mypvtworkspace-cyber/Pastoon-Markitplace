import React, { useState, useEffect } from 'react';
import { Flame, Clock, Sparkles, UtensilsCrossed, Smartphone, Shirt, Car, Wrench, Scissors, Hotel, Briefcase, PackageCheck, ShieldCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Campaign, Category } from '../types';

export const HeroBanner: React.FC<{
  campaigns: Campaign[];
  categories: Category[];
  onSelectCategory: (slug: string) => void;
}> = ({ campaigns, categories, onSelectCategory }) => {
  const { setActiveView, setSelectedDealModal, formatPrice } = useApp();

  // Flash deal countdown timer simulator
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeCampaign = (campaigns || []).find((c) => c.status === 'active') || campaigns?.[0];

  const categoryIcons: Record<string, any> = {
    cat_restaurants: UtensilsCrossed,
    cat_electronics: Smartphone,
    cat_fashion: Shirt,
    cat_automotive: Car,
    cat_home_services: Wrench,
    cat_beauty: Scissors,
    cat_travel_hotels: Hotel,
    cat_freelance_digital: Briefcase,
    cat_wholesale: PackageCheck,
  };

  return (
    <div className="space-y-6">
      {/* Featured Sponsored Banner */}
      {activeCampaign && (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 group">
          <div className="absolute inset-0 z-0 opacity-40 group-hover:scale-105 transition-transform duration-700">
            <img src={activeCampaign.bannerImage} alt={activeCampaign.title} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-0" />

          <div className="relative z-10 p-6 sm:p-10 max-w-2xl text-white space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Sponsored • {activeCampaign.sponsorName}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
              {activeCampaign.title}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              {activeCampaign.tagline}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveView('flash_deals')}
                className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-rose-500/30 flex items-center gap-2 transition-all"
              >
                Explore Sponsored Deals <ChevronRight className="w-4 h-4" />
              </button>

              <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 px-3 py-2 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Partners • 2% Platform Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flash Deals Ticker Widget */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/60 border border-rose-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">Today's Mega Flash Deals</span>
              <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                UP TO 60% OFF
              </span>
            </div>
            <p className="text-slate-400 text-xs">Real-time inventory limits. Deducts 2% transparent commission automatically.</p>
          </div>
        </div>

        {/* Live Countdown Clock */}
        <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono font-bold text-amber-400">
          <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>ENDS IN:</span>
          <span className="bg-slate-800 text-white px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>
          <span>:</span>
          <span className="bg-slate-800 text-white px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
          <span>:</span>
          <span className="bg-slate-800 text-white px-2 py-1 rounded text-rose-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
      </div>

      {/* Quick Universal Category Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Universal Categories</h2>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline" onClick={() => setActiveView('deals')}>
            View All Categories ({(categories || []).length})
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
          {(categories || []).map((cat) => {
            const IconComp = categoryIcons[cat.id] || UtensilsCrossed;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 rounded-2xl p-3 text-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-2">
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {cat.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
