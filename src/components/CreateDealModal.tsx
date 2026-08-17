import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Tag,
  CheckCircle2,
  AlertCircle,
  Percent,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  ShieldCheck,
  Building2,
  User as UserIcon,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { User, Business, Deal, SystemConfig } from '../types';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  businesses: Business[];
  systemConfig: SystemConfig;
  onDealCreated?: (deal: Deal) => void;
}

export const CreateDealModal: React.FC<CreateDealModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  businesses = [],
  systemConfig,
  onDealCreated,
}) => {
  const [contentOrigin, setContentOrigin] = useState<'business' | 'organic_user'>(
    currentUser?.role === 'seller' || currentUser?.role === 'business_manager' ? 'business' : 'organic_user'
  );
  const [businessId, setBusinessId] = useState(businesses?.[0]?.id || 'biz_general');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('cat_restaurants');
  const [dealType, setDealType] = useState<'voucher' | 'physical_product' | 'service_booking'>('voucher');
  const [originalPrice, setOriginalPrice] = useState<number | ''>(5000);
  const [discountedPrice, setDiscountedPrice] = useState<number | ''>(3500);
  const [totalQuantity, setTotalQuantity] = useState<number>(50);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('Valid for 30 days from purchase. Non-refundable.');
  const [redemptionMethod, setRedemptionMethod] = useState<'in_store_qr' | 'online_code' | 'delivery'>('in_store_qr');
  const [expiryDays, setExpiryDays] = useState<number>(30);
  const [isFlashDeal, setIsFlashDeal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdDeal, setCreatedDeal] = useState<Deal | null>(null);

  // Commission determination
  const selectedBiz = (businesses || []).find((b) => b.id === businessId);
  const isVerifiedMerchant = contentOrigin === 'business' && selectedBiz?.isVerified;
  const commissionRate = isVerifiedMerchant
    ? (systemConfig.verifiedCommissionRate || 0.02)
    : (systemConfig.standardCommissionRate || 0.06);

  const discountPercent =
    originalPrice && discountedPrice && originalPrice > discountedPrice
      ? Math.round(((Number(originalPrice) - Number(discountedPrice)) / Number(originalPrice)) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide title and description.');
      return;
    }
    if (!originalPrice || !discountedPrice || Number(discountedPrice) >= Number(originalPrice)) {
      setError('Discounted price must be strictly less than the original price.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const endDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

    try {
      const response = await fetch('/api/v1/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: contentOrigin === 'business' ? businessId : 'biz_general',
          sellerId: currentUser?.id || 'usr_cust_1',
          sellerName: contentOrigin === 'business' ? (selectedBiz?.name || 'DealHub Partner') : (currentUser?.name || 'Community Member'),
          title,
          description,
          categoryId,
          originalPrice: Number(originalPrice),
          discountedPrice: Number(discountedPrice),
          dealType,
          totalQuantity: Number(totalQuantity),
          images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'],
          termsAndConditions,
          redemptionMethod,
          startDate: new Date().toISOString(),
          endDate,
          isFlashDeal,
          contentOrigin,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCreatedDeal(data.data);
        if (onDealCreated) onDealCreated(data.data);
      } else {
        setError(data.message || 'Failed to submit deal.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error submitting deal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Post a Marketplace Deal or Discount
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {contentOrigin === 'business'
                    ? 'Verified Merchant Deal • 2% Tiered Commission'
                    : 'Community Deal / Recommendation • 6% Standard Commission'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!createdDeal ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Content Origin Selector */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setContentOrigin('business')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    contentOrigin === 'business'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Business Deal (2% Fee)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentOrigin('organic_user')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    contentOrigin === 'organic_user'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Community User (6% Fee)</span>
                </button>
              </div>

              {contentOrigin === 'business' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Your Business Profile *
                  </label>
                  <select
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.isVerified ? '✓ (Verified Merchant)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deal Title / Offer Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 50% Off Deluxe Hand-Car Wash & Polish"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="cat_restaurants">Restaurants & Dining</option>
                    <option value="cat_electronics">Electronics & Gadgets</option>
                    <option value="cat_automotive">Automotive & Detailing</option>
                    <option value="cat_home_services">Home & Cleaning</option>
                    <option value="cat_beauty_spa">Beauty & Spa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deal Type
                  </label>
                  <select
                    value={dealType}
                    onChange={(e: any) => setDealType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="voucher">Digital Voucher / In-Store QR</option>
                    <option value="physical_product">Physical Deliverable Product</option>
                    <option value="service_booking">Appointment / Service Booking</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Calculated Savings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Original Regular Price ({systemConfig.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deal Discounted Price ({systemConfig.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Percentage
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-rose-600 dark:text-rose-400 text-center">
                    {discountPercent}% OFF
                  </div>
                </div>
              </div>

              {/* Commission Transparency Callout */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center">
                <span className="text-slate-500">
                  Platform Commission Tier ({contentOrigin === 'business' ? 'Verified Business' : 'Organic Community'}):
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {(commissionRate * 100).toFixed(0)}% Platform Fee
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product / Deal Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... (High-resolution photo)"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & What's Included *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain exactly what is included in this discount package..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Publish Marketplace Deal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Deal Published Successfully!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                <strong>"{createdDeal.title}"</strong> is now listed on DealHub marketplace with a{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{createdDeal.discountPercentage}% discount</span>.
              </p>
              <button
                onClick={onClose}
                className="w-full max-w-md py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
