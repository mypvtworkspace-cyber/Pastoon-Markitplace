import React, { useState } from 'react';
import { Flame, Clock, Heart, CheckCircle2, ShoppingBag, Eye, Percent, MapPin, MessageSquare, Share2, Check, QrCode } from 'lucide-react';
import { Deal, Business } from '../types';
import { useApp } from '../context/AppContext';
import { CountdownTimer } from './CountdownTimer';
import { QRCodeModal } from './QRCodeModal';

export const DealCard: React.FC<{
  deal: Deal;
  business?: Business;
  onOpenDetail: (deal: Deal) => void;
  onChatWithDealer?: (businessId: string, dealId?: string) => void;
}> = ({ deal, business, onOpenDetail, onChatWithDealer }) => {
  const { formatPrice, favoriteDealIds, toggleFavoriteDeal, addToCart } = useApp();
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const isFav = (favoriteDealIds || []).includes(deal.id);
  const stockPercent = Math.round((deal.remainingQuantity / deal.totalQuantity) * 100);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const deepLink = `${window.location.origin}/#deal-${deal.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(deepLink);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative">
      {/* Image & Badge Overlay */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={deal?.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="bg-rose-600 text-white font-black text-[10px] px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider">
            <Percent className="w-3 h-3" /> {deal.discountPercentage}% OFF
          </span>

          {deal.isFlashDeal && (
            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-1 rounded-lg shadow-md flex items-center gap-1 uppercase animate-pulse">
              <Flame className="w-3 h-3" /> Flash
            </span>
          )}

          {deal.isSponsored && (
            <span className="bg-slate-900/90 text-amber-300 border border-amber-500/40 font-bold text-[10px] px-2 py-0.5 rounded-lg backdrop-blur">
              Sponsored
            </span>
          )}
        </div>

        {/* Action Controls: Share, QR & Favorite */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowQRModal(true);
            }}
            className="p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-slate-200 hover:text-white backdrop-blur transition-all"
            title="Generate In-Store QR Voucher Code"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-slate-200 hover:text-white backdrop-blur transition-all relative"
            title="Share Deal Deep-Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            {copied && (
              <span className="absolute -bottom-7 right-0 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg whitespace-nowrap animate-in fade-in zoom-in duration-150">
                Copied!
              </span>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteDeal(deal.id);
            }}
            className={`p-2 rounded-full backdrop-blur transition-all ${
              isFav ? 'bg-rose-500 text-white' : 'bg-slate-900/60 text-slate-300 hover:text-white'
            }`}
            title={isFav ? 'Remove from Saved Deals' : 'Save to Favorites Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Countdown Timer Overlay / Category Pill */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-1">
          <div className="bg-slate-950/80 text-slate-200 text-[10px] px-2 py-0.5 rounded-md font-medium backdrop-blur">
            {deal.dealType === 'physical_product' ? 'Physical Product' : 'Digital / Service'}
          </div>

          {deal.endDate && <CountdownTimer endDate={deal.endDate} compact />}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Business Info */}
          {business && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1 truncate max-w-[180px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{business.name}</span>
                {business.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              </div>

              <div className="flex items-center gap-0.5 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>{business.location.city}</span>
              </div>
            </div>
          )}

          {/* Deal Title */}
          <h3
            onClick={() => onOpenDetail(deal)}
            className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors leading-snug"
          >
            {deal.title}
          </h3>
        </div>

        {/* Inventory Progress Bar for Flash Deals */}
        {deal.isFlashDeal && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              <span>Stock Remaining:</span>
              <span className={deal.remainingQuantity < 15 ? 'text-rose-500 font-extrabold' : 'text-slate-700 dark:text-slate-300'}>
                {deal.remainingQuantity} / {deal.totalQuantity} Left
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  stockPercent < 25 ? 'bg-rose-500' : stockPercent < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(5, stockPercent)}%` }}
              />
            </div>
          </div>
        )}

        {/* Pricing & Call to Action */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs text-slate-400 line-through font-medium">{formatPrice(deal.originalPrice)}</div>
            <div className="text-base font-black text-emerald-600 dark:text-emerald-400 leading-none">
              {formatPrice(deal.discountedPrice)}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onChatWithDealer && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChatWithDealer(deal.businessId, deal.id);
                }}
                className="p-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors"
                title="Chat with Dealer"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onOpenDetail(deal)}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
              title="View Deal Details"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                addToCart({
                  id: `cart_${deal.id}`,
                  dealId: deal.id,
                  businessId: deal.businessId,
                  businessName: business ? business.name : 'Partner Seller',
                  title: deal.title,
                  unitPrice: deal.discountedPrice,
                  originalPrice: deal.originalPrice,
                  quantity: 1,
                  type: 'deal',
                  image: deal?.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
                });
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Buy
            </button>
          </div>
        </div>
      </div>

      <QRCodeModal
        deal={deal}
        business={business}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
};
