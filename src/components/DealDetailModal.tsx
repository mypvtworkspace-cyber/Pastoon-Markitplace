import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Flame,
  MapPin,
  ShieldCheck,
  Tag,
  ShoppingBag,
  Clock,
  FileText,
  Percent,
  Star,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { Deal, Business } from '../types';
import { useApp } from '../context/AppContext';
import { ReviewModal } from './ReviewModal';

export const DealDetailModal: React.FC<{
  deal: Deal;
  business?: Business;
  onClose: () => void;
  onChatWithDealer?: (businessId: string, dealId?: string) => void;
}> = ({ deal, business, onClose, onChatWithDealer }) => {
  const { formatPrice, addToCart, systemConfig, reviews, voteHelpfulReview, currentUser } = useApp();
  const [showReviewModal, setShowReviewModal] = useState(false);

  const commissionFee = Number((deal.discountedPrice * systemConfig.defaultCommissionRate).toFixed(2));
  const sellerSettlement = Number((deal.discountedPrice - commissionFee).toFixed(2));

  // Find reviews linked to this deal or business
  const dealReviews = (reviews || []).filter(
    (r) => (r.dealId === deal.id || (r.businessId === deal.businessId && r.itemType === 'deal')) && (r.status === 'published' || !r.status)
  );

  const averageRating =
    dealReviews.length > 0
      ? Number((dealReviews.reduce((sum, r) => sum + r.rating, 0) / dealReviews.length).toFixed(1))
      : business?.rating || 5.0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-xs transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src={deal?.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'} alt={deal.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1 rounded-xl shadow-lg flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" /> {deal.discountPercentage}% OFF
            </span>

            {deal.isFlashDeal && (
              <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-xl shadow-lg flex items-center gap-1 animate-pulse">
                <Flame className="w-3.5 h-3.5" /> FLASH DEAL
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider mb-1">
              {deal.dealType === 'physical_product' ? 'Physical Product Deal' : 'Service & Booking Voucher'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">{deal.title}</h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Business Info Banner */}
          {business && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-700 bg-white"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {business.name}
                    {business.isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>
                      {business.location.address}, {business.location.city}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="text-right hover:opacity-80 transition-opacity cursor-pointer group"
                >
                  <div className="text-xs font-black text-amber-500 flex items-center gap-0.5 group-hover:scale-105 transition-transform">
                    ★ {averageRating.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold underline">
                    {dealReviews.length} Verified Reviews
                  </div>
                </button>

                {onChatWithDealer && (
                  <button
                    onClick={() => {
                      onClose();
                      onChatWithDealer(business.id, deal.id);
                    }}
                    className="bg-indigo-100 dark:bg-indigo-950/80 hover:bg-indigo-200 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chat with Dealer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pricing & Transparency Section */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 line-through mr-2 font-medium">
                  {formatPrice(deal.originalPrice)}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {formatPrice(deal.discountedPrice)}
                </span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-bold">
                SAVE {formatPrice(deal.originalPrice - deal.discountedPrice)}
              </span>
            </div>

            {/* 2% Commission Breakdown Box */}
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 grid grid-cols-3 gap-2 text-center bg-slate-950/60 p-2.5 rounded-xl">
              <div>
                <div className="font-medium text-slate-400">Listed Deal Price</div>
                <div className="font-bold text-slate-200">{formatPrice(deal.discountedPrice)}</div>
              </div>
              <div>
                <div className="font-medium text-amber-400">DealHub 2% Fee</div>
                <div className="font-bold text-amber-300">{formatPrice(commissionFee)}</div>
              </div>
              <div>
                <div className="font-medium text-slate-400">Seller Net Settlement</div>
                <div className="font-bold text-slate-200">{formatPrice(sellerSettlement)}</div>
              </div>
            </div>
          </div>

          {/* Deal Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" /> Deal Overview
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {deal.description}
            </p>
          </div>

          {/* Customer Reviews Spotlight Box */}
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Customer Ratings & Reviews ({dealReviews.length})
              </h4>
              <button
                onClick={() => setShowReviewModal(true)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View all / Write review &rarr;
              </button>
            </div>

            {dealReviews.length === 0 ? (
              <div className="text-xs text-slate-500 py-2">
                No reviews yet for this deal. Be the first verified buyer to leave feedback!
              </div>
            ) : (
              <div className="space-y-2.5">
                {dealReviews.slice(0, 2).map((rev) => (
                  <div key={rev.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{rev.customerName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-medium">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-amber-400 text-xs font-black">{'★'.repeat(rev.rating)}</div>
                    </div>
                    {rev.title && <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.title}</div>}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Redemption & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-500" /> Redemption Method
              </div>
              <p className="text-slate-600 dark:text-slate-400 capitalize">
                {deal.redemptionMethod.replace('_', ' ')}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" /> Expiry Date
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                {new Date(deal.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <div className="font-bold">Terms & Conditions:</div>
            <p>{deal.termsAndConditions}</p>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center gap-3">
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
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart & Checkout ({formatPrice(deal.discountedPrice)})
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          business={business || null}
          deal={deal}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
};
