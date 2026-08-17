import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Megaphone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  DollarSign,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { User, Business, Advertisement, SystemConfig } from '../types';

interface CreateAdvertisementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  businesses: Business[];
  systemConfig: SystemConfig;
  onAdCreated?: (ad: Advertisement) => void;
}

export const CreateAdvertisementModal: React.FC<CreateAdvertisementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  businesses = [],
  systemConfig,
  onAdCreated,
}) => {
  const [businessId, setBusinessId] = useState(businesses?.[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Restaurants & Dining');
  const [categoryId, setCategoryId] = useState('cat_restaurants');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [promotionalBadge, setPromotionalBadge] = useState('Exclusive DealHub Deal');
  const [discountDetails, setDiscountDetails] = useState('');
  const [campaignBudget, setCampaignBudget] = useState(25000);
  const [targetLocation, setTargetLocation] = useState('All');
  const [contactMethod, setContactMethod] = useState('DealHub Direct Chat / Voucher');
  const [paymentReference, setPaymentReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAd, setCreatedAd] = useState<Advertisement | null>(null);

  const selectedBiz = useMemo(() => {
    return (businesses || []).find((b) => b.id === businessId) || (businesses && businesses[0]);
  }, [businessId, businesses]);

  // Real-time quality score calculation (matches server backend algorithm)
  const qualityScore = useMemo(() => {
    let score = 70;
    if (selectedBiz?.isVerified) score += 10;
    if (imageUrl.trim().length > 10) score += 10;
    if (description.trim().length >= 60) score += 5;
    if (discountDetails.trim().length > 0) score += 5;
    return Math.min(100, score);
  }, [selectedBiz, imageUrl, description, discountDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a campaign title and description.');
      return;
    }
    if (campaignBudget < 5000) {
      setError('Minimum advertisement budget is Rs. 5,000.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/advertisements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBiz?.id || 'biz_general',
          title,
          category,
          categoryId,
          description,
          images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800'],
          promotionalBadge,
          discountDetails,
          campaignBudget,
          targetLocation,
          targetCategory: categoryId,
          contactMethod,
          paymentReference: paymentReference || `AD-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCreatedAd(data.data);
        if (onAdCreated) onAdCreated(data.data);
      } else {
        setError(data.message || 'Failed to submit advertisement.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error submitting advertisement.');
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
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Sponsored Advertisement Campaign
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target high-intent shoppers across DealHub with Anti-Fraud Click Protection
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

          {!createdAd ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Quality Score Indicator Widget */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Ad Quality Score: {qualityScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    High scores receive priority placement in the rotation engine without dominating other content.
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  <span>{qualityScore >= 90 ? 'Excellent' : qualityScore >= 80 ? 'Good' : 'Standard'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Promoting Business *
                  </label>
                  <select
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.isVerified ? '✓ (Verified)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setCategory(e.target.options[e.target.selectedIndex].text);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="cat_restaurants">Restaurants & Dining</option>
                    <option value="cat_electronics">Electronics & Mobiles</option>
                    <option value="cat_automotive">Automotive & Detailing</option>
                    <option value="cat_home_services">Home & Electrical Services</option>
                    <option value="cat_beauty_spa">Beauty & Fitness</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Advertisement Headline / Offer Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flash 40% Discount on Family Charcoal Feast"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Promotional Tag Badge
                  </label>
                  <input
                    type="text"
                    value={promotionalBadge}
                    onChange={(e) => setPromotionalBadge(e.target.value)}
                    placeholder="e.g. 40% Off Deal, Verified Sponsor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specific Savings / Discount Details
                  </label>
                  <input
                    type="text"
                    value={discountDetails}
                    onChange={(e) => setDiscountDetails(e.target.value)}
                    placeholder="e.g. Save Rs. 1,500 on dinner for 4"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Creative Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... (High-res banner)"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Offer Description & Call to Action *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail your special promotion, valid timings, and why buyers should choose you..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Campaign Budget ({systemConfig.currencySymbol}) *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="number"
                      min={5000}
                      step={1000}
                      required
                      value={campaignBudget}
                      onChange={(e) => setCampaignBudget(Number(e.target.value))}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    CPC Rs. 15 per verified unique click • Protected from click spam
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target City / Area
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <select
                      value={targetLocation}
                      onChange={(e) => setTargetLocation(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="All">All Regions (Nationwide)</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad / Rawalpindi</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ad Campaign Payment Reference ID
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. TXN-AD-88419 or EasyPaisa Deposit Reference"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                  className="flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-lg shadow-purple-500/20 transition-colors"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Submit for Campaign Approval</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Advertisement Campaign Submitted!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Your campaign <strong>"{createdAd.title}"</strong> has been recorded with a Quality Score of{' '}
                <span className="font-bold text-purple-600 dark:text-purple-400">{createdAd.qualityScore}/100</span>.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl max-w-md mx-auto text-xs text-left border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Allocated Budget:</span>
                  <span className="font-semibold">{systemConfig.currencySymbol} {createdAd.campaignBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Region:</span>
                  <span className="font-semibold">{createdAd.targetLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Moderation Status:</span>
                  <span className="capitalize font-semibold text-amber-600">{createdAd.status.replace('_', ' ')}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full max-w-md py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
              >
                Close & Return to Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
