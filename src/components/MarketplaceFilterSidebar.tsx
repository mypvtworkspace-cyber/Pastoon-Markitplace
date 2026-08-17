import React from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check, Star, ShieldCheck, DollarSign, Percent } from 'lucide-react';

export interface FilterState {
  minPrice: number | '';
  maxPrice: number | '';
  minDiscount: number;
  minRating: number;
  dealType: 'all' | 'physical_product' | 'digital_service';
  onlyVerified: boolean;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'discount_desc';
}

interface MarketplaceFilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const MarketplaceFilterSidebar: React.FC<MarketplaceFilterSidebarProps> = ({
  filters,
  setFilters,
  onReset,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg space-y-6 text-xs text-slate-800 dark:text-slate-200 w-full ${
        isOpenMobile ? 'block' : 'hidden lg:block'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" /> Filter & Refine
        </div>

        <button
          onClick={onReset}
          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-xs"
        >
          Reset All
        </button>
      </div>

      {/* Sorting Dropdown */}
      <div className="space-y-1.5">
        <label className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" /> Sort Marketplace By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="newest">✨ Newest First</option>
          <option value="price_asc">🏷️ Price: Low to High</option>
          <option value="price_desc">💎 Price: High to Low</option>
          <option value="discount_desc">🔥 Highest Discount (%)</option>
          <option value="rating_desc">⭐ Highest Rated</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Price Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : '' }))
            }
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : '' }))
            }
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Minimum Discount % */}
      <div className="space-y-2">
        <label className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-rose-500" /> Minimum Discount
          </span>
          <span className="text-rose-500 font-bold">{filters.minDiscount}%+</span>
        </label>
        <div className="flex gap-1.5">
          {[0, 20, 30, 50].map((disc) => (
            <button
              key={disc}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, minDiscount: disc }))}
              className={`flex-1 py-1.5 rounded-xl font-extrabold text-[11px] border transition-all ${
                filters.minDiscount === disc
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {disc === 0 ? 'All' : `${disc}%+`}
            </button>
          ))}
        </div>
      </div>

      {/* Deal Type */}
      <div className="space-y-2">
        <label className="font-extrabold text-slate-700 dark:text-slate-300">Listing Type</label>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, dealType: 'all' }))}
            className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
              filters.dealType === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, dealType: 'physical_product' }))}
            className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
              filters.dealType === 'physical_product'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, dealType: 'digital_service' }))}
            className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
              filters.dealType === 'digital_service'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Services
          </button>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2">
        <label className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Merchant Rating
        </label>
        <div className="flex gap-1.5">
          {[0, 3, 4].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, minRating: star }))}
              className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] border transition-all ${
                filters.minRating === star
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-black'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {star === 0 ? 'Any' : `${star}★ & Up`}
            </button>
          ))}
        </div>
      </div>

      {/* Verified Business Only Toggle */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Only Verified Dealers
          </span>
          <input
            type="checkbox"
            checked={filters.onlyVerified}
            onChange={(e) => setFilters((prev) => ({ ...prev, onlyVerified: e.target.checked }))}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
