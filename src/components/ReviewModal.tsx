import React, { useState, useMemo } from 'react';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Send,
  X,
  ThumbsUp,
  ShieldCheck,
  Filter,
  Search,
  AlertTriangle,
  Award,
  Sparkles,
  ShoppingBag,
  Clock,
  CornerDownRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Review, Business, Deal, ProductServiceItem } from '../types';
import { useApp } from '../context/AppContext';

interface ReviewModalProps {
  business: Business | null;
  deal?: Deal | null;
  product?: ProductServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const RATING_LABELS: { [key: number]: string } = {
  5: '5.0 - Exceptional & Highly Recommended',
  4: '4.0 - Very Good & Quality Experience',
  3: '3.0 - Average & Met Expectations',
  2: '2.0 - Below Expectations / Needs Improvement',
  1: '1.0 - Poor / Unsatisfactory Experience',
};

export const ReviewModal: React.FC<ReviewModalProps> = ({
  business,
  deal,
  product,
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    reviews,
    orders,
    deals,
    productsAndServices,
    addReview,
    replyToReview,
    voteHelpfulReview,
    reportReview,
    showToast,
    requireAuth,
  } = useApp();

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedItemType, setSelectedItemType] = useState<'business' | 'deal' | 'product' | 'service'>('business');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);

  // Filter & Search State
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [onlyVerifiedFilter, setOnlyVerifiedFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'rating_desc' | 'rating_asc' | 'helpful'>('newest');

  // Interactive Action State
  const [replyInput, setReplyInput] = useState<{ [reviewId: string]: string }>({});
  const [activeReplyingId, setActiveReplyingId] = useState<string | null>(null);
  const [reportModalReviewId, setReportModalReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Determine current business
  const currentBusiness = business || (deal ? (deals || []).find((d) => d.id === deal.id) ? (useApp().businesses || []).find((b) => b.id === deal.businessId) : null : null);

  // Filter all reviews for this business/deal
  const relevantReviews = useMemo(() => {
    if (!currentBusiness) return [];
    return reviews.filter((r) => {
      if (r.businessId !== currentBusiness.id) return false;
      // If deal is specifically focused
      if (deal && r.dealId && r.dealId !== deal.id) return false;
      // Filter out hidden or rejected for regular customers (unless current user is the author or admin)
      if (r.status === 'hidden' || r.status === 'rejected') {
        if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin' && r.customerId !== currentUser.id) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, currentBusiness, deal, currentUser]);

  // Rating Statistics Breakdown
  const stats = useMemo(() => {
    const published = relevantReviews.filter((r) => r.status === 'published' || !r.status);
    const count5 = published.filter((r) => r.rating === 5).length;
    const count4 = published.filter((r) => r.rating === 4).length;
    const count3 = published.filter((r) => r.rating === 3).length;
    const count2 = published.filter((r) => r.rating === 2).length;
    const count1 = published.filter((r) => r.rating === 1).length;
    const total = published.length;
    const totalStars = published.reduce((acc, r) => acc + r.rating, 0);
    const average = total > 0 ? Number((totalStars / total).toFixed(1)) : currentBusiness?.rating || 5.0;
    const verifiedCount = published.filter((r) => r.isVerifiedPurchase).length;
    const recommendPercent = total > 0 ? Math.round((published.filter((r) => r.rating >= 4).length / total) * 100) : 100;

    return { count5, count4, count3, count2, count1, total, average, verifiedCount, recommendPercent };
  }, [relevantReviews, currentBusiness]);

  // Check if current user has verified purchases with this business
  const userOrderHistory = useMemo(() => {
    return (orders || []).filter(
      (o) =>
        (o.customerId === currentUser.id || o.customerEmail?.toLowerCase() === currentUser.email?.toLowerCase()) &&
        o.businessId === currentBusiness?.id
    );
  }, [orders, currentUser, currentBusiness]);

  const isUserVerifiedBuyer = userOrderHistory.length > 0;

  // Filtered & Sorted Review List
  const displayedReviews = useMemo(() => {
    let list = [...relevantReviews];

    if (starFilter !== 'all') {
      list = list.filter((r) => Math.round(r.rating) === starFilter);
    }
    if (onlyVerifiedFilter) {
      list = list.filter((r) => r.isVerifiedPurchase);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.comment.toLowerCase().includes(q) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          r.customerName.toLowerCase().includes(q) ||
          (r.dealTitle && r.dealTitle.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'rating_desc') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'rating_asc') {
      list.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === 'helpful') {
      list.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [relevantReviews, starFilter, onlyVerifiedFilter, searchQuery, sortBy]);

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please provide your review feedback comment.');
      return;
    }

    if (!currentBusiness) return;

    requireAuth('To submit a verified star rating and review, please sign in.', async () => {
      setIsSubmitting(true);
      try {
        let dealRefId: string | undefined = undefined;
        let dealRefTitle: string | undefined = undefined;
        let productRefId: string | undefined = undefined;
        let productRefTitle: string | undefined = undefined;
        let serviceRefId: string | undefined = undefined;
        let serviceRefTitle: string | undefined = undefined;

        if (deal) {
          dealRefId = deal.id;
          dealRefTitle = deal.title;
        } else if (selectedItemType === 'deal' && selectedItemId) {
          const found = (deals || []).find((d) => d.id === selectedItemId);
          if (found) {
            dealRefId = found.id;
            dealRefTitle = found.title;
          }
        } else if (selectedItemType === 'product' && selectedItemId) {
          const found = (productsAndServices || []).find((p) => p.id === selectedItemId);
          if (found) {
            productRefId = found.id;
            productRefTitle = found.title;
          }
        } else if (selectedItemType === 'service' && selectedItemId) {
          const found = (productsAndServices || []).find((s) => s.id === selectedItemId);
          if (found) {
            serviceRefId = found.id;
            serviceRefTitle = found.title;
          }
        }

        const matchedOrder = userOrderHistory?.[0];

        await addReview({
          businessId: currentBusiness.id,
          businessName: currentBusiness.name,
          orderId: matchedOrder?.id,
          customerId: currentUser.id,
          customerName: currentUser.name,
          customerAvatar: currentUser.avatar,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
          isVerifiedPurchase: isUserVerifiedBuyer,
          itemType: deal ? 'deal' : selectedItemType,
          dealId: dealRefId,
          dealTitle: dealRefTitle,
          productId: productRefId,
          productTitle: productRefTitle,
          serviceId: serviceRefId,
          serviceTitle: serviceRefTitle,
        });

        // Reset form
        setTitle('');
        setComment('');
        setRating(5);
        setShowWriteReview(false);
      } catch (err) {
        showToast('Error saving review. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  // Handle Business Reply
  const handleSendReply = async (reviewId: string) => {
    const text = replyInput[reviewId];
    if (!text || !text.trim()) return;

    await replyToReview(reviewId, text.trim(), `${currentBusiness?.name} Management`);
    setReplyInput((prev) => ({ ...prev, [reviewId]: '' }));
    setActiveReplyingId(null);
  };

  // Handle Report
  const handleConfirmReport = async () => {
    if (!reportModalReviewId) return;
    if (!reportReason.trim()) {
      showToast('Please state a reason for reporting.');
      return;
    }

    await reportReview(reportModalReviewId, reportReason.trim());
    setReportModalReviewId(null);
    setReportReason('');
  };

  if (!isOpen || !currentBusiness) return null;

  const isSellerOwner =
    currentUser.role === 'seller' ||
    currentUser.id === currentBusiness.ownerId ||
    currentUser.role === 'owner' ||
    currentUser.role === 'super_admin';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src={currentBusiness.logo}
              alt={currentBusiness.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-800 bg-white shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">{currentBusiness.name}</h3>
                {currentBusiness.isVerified && (
                  <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Verified Dealer
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {deal ? `Reviews for: ${deal.title}` : `Customer Ratings & Verified Feedback (${currentBusiness.location.city})`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Rating Overview & Breakdown Card */}
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            
            {/* Big Score Block */}
            <div className="sm:col-span-4 text-center sm:text-left sm:border-r border-slate-200 dark:border-slate-800 sm:pr-5">
              <div className="text-4xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
                <span>{stats.average}</span>
                <span className="text-amber-400 text-3xl">★</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 text-xs my-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(stats.average) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Based on {stats.total} verified reviews
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="w-3 h-3" /> {stats.recommendPercent}% Buyers recommend this store
              </div>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="sm:col-span-5 space-y-1.5 text-xs">
              {[
                { stars: 5, count: stats.count5 },
                { stars: 4, count: stats.count4 },
                { stars: 3, count: stats.count3 },
                { stars: 2, count: stats.count2 },
                { stars: 1, count: stats.count1 },
              ].map(({ stars, count }) => {
                const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <button
                      onClick={() => setStarFilter(starFilter === stars ? 'all' : stars)}
                      className={`font-bold flex items-center gap-0.5 w-10 text-left hover:underline ${
                        starFilter === stars ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {stars} ★
                    </button>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {count} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action Callout Button */}
            <div className="sm:col-span-3 flex flex-col justify-center items-center text-center gap-2">
              {isUserVerifiedBuyer && (
                <div className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Customer
                </div>
              )}
              <button
                onClick={() => setShowWriteReview((prev) => !prev)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                {showWriteReview ? 'Close Form' : 'Write a Review'}
              </button>
            </div>
          </div>

          {/* Write / Submit Review Form Drawer */}
          {showWriteReview && (
            <form
              onSubmit={handleSubmitReview}
              className="bg-slate-50 dark:bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200"
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
                    <Star className="w-4 h-4 fill-current" />
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Share Your Experience with {currentBusiness.name}
                  </h4>
                </div>
                {isUserVerifiedBuyer ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Purchase Tag will be attached
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Standard Community Review
                  </span>
                )}
              </div>

              {/* Star Selection with Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Overall Rating <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {RATING_LABELS[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Review Headline / Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delicious Smash Burgers & Instant QR Redemption!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Detailed Comment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Detailed Feedback <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell other shoppers about product quality, staff service, redemption ease, or delivery speed..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Item Linking Tag */}
              {!deal && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Transaction / Item Type
                    </label>
                    <select
                      value={selectedItemType}
                      onChange={(e) => {
                        setSelectedItemType(e.target.value as any);
                        setSelectedItemId('');
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 mt-1 outline-none"
                    >
                      <option value="business">Entire Store / Business</option>
                      <option value="deal">Specific Deal Voucher</option>
                      <option value="product">Physical Product</option>
                      <option value="service">Service & Booking</option>
                    </select>
                  </div>

                  {selectedItemType === 'deal' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Select Deal
                      </label>
                      <select
                        value={selectedItemId}
                        onChange={(e) => setSelectedItemId(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 mt-1 outline-none"
                      >
                        <option value="">-- Choose Deal --</option>
                        {(deals || [])
                          .filter((d) => d.businessId === currentBusiness.id)
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {(selectedItemType === 'product' || selectedItemType === 'service') && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Select Item
                      </label>
                      <select
                        value={selectedItemId}
                        onChange={(e) => setSelectedItemId(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 mt-1 outline-none"
                      >
                        <option value="">-- Choose Item --</option>
                        {(productsAndServices || [])
                          .filter((p) => p.businessId === currentBusiness.id && p.type === selectedItemType)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWriteReview(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Posting...' : 'Publish Verified Review'}
                </button>
              </div>
            </form>
          )}

          {/* Search, Star Filter & Sorting Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {/* Star Rating Pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setStarFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    starFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStarFilter(starFilter === s ? 'all' : s)}
                    className={`px-2 py-1 rounded-lg font-bold flex items-center gap-0.5 transition-all ${
                      starFilter === s
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {s}★
                  </button>
                ))}
              </div>

              {/* Verified Only Toggle */}
              <button
                onClick={() => setOnlyVerifiedFilter((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                  onlyVerifiedFilter
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Only
              </button>

              {/* Sort By Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="rating_desc">Highest Rating</option>
                <option value="rating_asc">Lowest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {displayedReviews.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium space-y-2">
                <p>No reviews match your selected filter criteria.</p>
                <button
                  onClick={() => {
                    setStarFilter('all');
                    setOnlyVerifiedFilter(false);
                    setSearchQuery('');
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              displayedReviews.map((rev) => {
                const isUserHelpful = (rev.helpfulUserIds || []).includes(currentUser.id);
                return (
                  <div
                    key={rev.id}
                    className="bg-slate-50 dark:bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative group"
                  >
                    {/* Top Row: User Avatar, Name, Verified Badge, Date, Star Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            rev.customerAvatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                          }
                          alt={rev.customerName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-700 bg-white"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                              {rev.customerName}
                            </span>
                            {rev.isVerifiedPurchase && (
                              <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                              </span>
                            )}
                            {rev.isFeatured && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/40 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                                <Award className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            {rev.dealTitle && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[200px]">
                                • Deal: {rev.dealTitle}
                              </span>
                            )}
                            {rev.productTitle && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[200px]">
                                • Product: {rev.productTitle}
                              </span>
                            )}
                            {rev.serviceTitle && (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold truncate max-w-[200px]">
                                • Service: {rev.serviceTitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-black shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Title & Comment */}
                    <div className="space-y-1">
                      {rev.title && (
                        <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {rev.title}
                        </h5>
                      )}
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>

                    {/* Seller Response Thread */}
                    {rev.sellerReply && (
                      <div className="bg-slate-100 dark:bg-slate-900 border-l-3 border-indigo-500 p-3 rounded-r-2xl text-xs space-y-1 mt-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" /> Response from {rev.sellerRepliedBy || currentBusiness.name}:
                          </span>
                          {rev.sellerReplyDate && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(rev.sellerReplyDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed pl-1">
                          {rev.sellerReply}
                        </p>
                      </div>
                    )}

                    {/* Bottom Actions: Helpful Vote, Report, and Dealer Reply Toggle */}
                    <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => voteHelpfulReview(rev.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            isUserHelpful
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful ({rev.helpfulCount || 0})</span>
                        </button>

                        <button
                          onClick={() => setReportModalReviewId(rev.id)}
                          className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" /> Report
                        </button>
                      </div>

                      {/* Store Reply Trigger for Sellers */}
                      {isSellerOwner && !rev.sellerReply && (
                        <div>
                          {activeReplyingId === rev.id ? (
                            <button
                              onClick={() => setActiveReplyingId(null)}
                              className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
                            >
                              Cancel Reply
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveReplyingId(rev.id)}
                              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              <CornerDownRight className="w-3 h-3" /> Reply as Store
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Inline Reply Input for Seller */}
                    {activeReplyingId === rev.id && (
                      <div className="pt-2 flex gap-2 animate-in fade-in duration-150">
                        <input
                          type="text"
                          placeholder="Write a polite response to this customer review..."
                          value={replyInput[rev.id] || ''}
                          onChange={(e) => setReplyInput((prev) => ({ ...prev, [rev.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendReply(rev.id);
                          }}
                          className="flex-1 bg-white dark:bg-slate-900 border border-indigo-500/40 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                        />
                        <button
                          onClick={() => handleSendReply(rev.id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-xs"
                        >
                          Send Response
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Report Modal Sub-Dialog */}
        {reportModalReviewId && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-rose-500 font-extrabold text-sm">
                <AlertTriangle className="w-4 h-4" /> Report Inappropriate Review
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Please specify why this review violates community standards (e.g. spam, abusive language, promotional link):
              </p>
              <textarea
                rows={3}
                placeholder="Reason for reporting..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setReportModalReviewId(null);
                    setReportReason('');
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReport}
                  className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
