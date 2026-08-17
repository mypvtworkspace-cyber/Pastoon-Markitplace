import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileWarning,
  Send,
} from 'lucide-react';
import { User, Deal, Advertisement, CommunityReport } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  targetDeal?: Deal | null;
  targetAd?: Advertisement | null;
  onReportSubmitted?: (report: CommunityReport) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetDeal,
  targetAd,
  onReportSubmitted,
}) => {
  const [reasonCategory, setReasonCategory] = useState<
    'fake_product' | 'misleading_discount' | 'scam' | 'duplicate' | 'spam' | 'other'
  >('fake_product');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const title = targetDeal?.title || targetAd?.title || 'Reported Content';
  const targetType = targetDeal ? 'deal' : 'advertisement';
  const targetId = targetDeal?.id || targetAd?.id || '';
  const businessId = targetDeal?.businessId || targetAd?.businessId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide specific details explaining the issue.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedByUserId: currentUser?.id || 'usr_cust_1',
          reportedByUserName: currentUser?.name || 'Community Vigilant',
          targetType,
          targetId,
          targetTitle: title,
          businessId,
          reasonCategory,
          description,
          evidenceUrls: evidenceUrl ? [evidenceUrl] : [],
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsSubmitted(true);
        if (onReportSubmitted) onReportSubmitted(data.data);
      } else {
        setError(data.message || 'Failed to submit report.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error submitting report.');
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
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-950/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Report to Security Queue
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Zero-Tolerance Anti-Fraud & Quality Assurance
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
            <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-2 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500">Flagged Item:</span>
                <p className="font-bold text-slate-900 dark:text-white truncate">{title}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Violation Category *
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e: any) => setReasonCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="fake_product">Fake / Counterfeit Product or Service</option>
                  <option value="misleading_discount">Fake / Misleading Discount Percentage</option>
                  <option value="scam">Potential Financial Scam or Unauthorized Scheme</option>
                  <option value="duplicate">Duplicate / Spam Submission</option>
                  <option value="other">Other Community Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Explain the Issue & Evidence *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe why this product/deal is fake, inflated, or infringing..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reference Link / Screenshot URL (Optional)
                </label>
                <input
                  type="text"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://... photo proof or genuine price comparison"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-lg shadow-red-500/20 transition-colors"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <FileWarning className="w-4 h-4" />
                      <span>Submit to Security</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Report Dispatched to Moderation Queue
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Thank you for helping keep DealHub 100% authentic and trustworthy. Our security administrators will review and take immediate action.
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors"
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
