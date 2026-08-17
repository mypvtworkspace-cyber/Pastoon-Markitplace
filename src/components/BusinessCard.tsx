import React from 'react';
import { Star, MapPin, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { Business } from '../types';
import { useApp } from '../context/AppContext';

interface BusinessCardProps {
  business: Business;
  onSelect: (business: Business) => void;
  onChatWithDealer: (business: Business) => void;
  onOpenReviews?: (business: Business) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onSelect,
  onChatWithDealer,
  onOpenReviews,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Cover Image & Logo Overlay */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={business.coverImage}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

        {/* Plan & Verified Badge */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {business.isVerified && (
            <span className="bg-emerald-500/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs shadow-xs">
              <CheckCircle2 className="w-3 h-3" /> Verified Dealer
            </span>
          )}
          {business.planId === 'business_pro' && (
            <span className="bg-amber-500/90 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-xs shadow-xs">
              ★ Premium
            </span>
          )}
        </div>

        {/* Rating & Reviews Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenReviews) onOpenReviews(business);
          }}
          className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs shadow-xs hover:scale-105 transition-transform cursor-pointer"
          title="View & Post Verified Buyer Reviews"
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{business.rating.toFixed(1)}</span>
          <span className="text-[10px] text-indigo-500 font-extrabold">({business.reviewCount} Reviews)</span>
        </button>

        {/* Business Logo Floating */}
        <div className="absolute -bottom-5 left-4">
          <img
            src={business.logo}
            alt={business.name}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-slate-900 shadow-md bg-white"
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="pt-7 p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {business.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {business.description}
          </p>
        </div>

        <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 gap-1">
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="truncate">{business.location.area}, {business.location.city}</span>
        </div>

        {/* Actions: View Store + Chat with Dealer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
          <button
            onClick={() => onChatWithDealer(business)}
            className="w-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-extrabold text-[11px] py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Chat with Dealer
          </button>

          <button
            onClick={() => onSelect(business)}
            className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-bold text-[11px] py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all shadow-xs"
          >
            View Deals <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
