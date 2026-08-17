import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  ShieldCheck,
  Percent,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Info,
} from 'lucide-react';
import { User, BusinessRegistration, SystemConfig } from '../types';

interface BusinessRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  systemConfig: SystemConfig;
  onRegistrationComplete?: (reg: BusinessRegistration) => void;
}

export const BusinessRegistrationModal: React.FC<BusinessRegistrationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  systemConfig,
  onRegistrationComplete,
}) => {
  const [step, setStep] = useState<'details' | 'fee_breakdown' | 'payment_proof' | 'success'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Restaurants & Dining');
  const [categoryId, setCategoryId] = useState('cat_restaurants');
  const [phone, setPhone] = useState(currentUser?.phone || '+92 300 1234567');
  const [email, setEmail] = useState(currentUser?.email || 'owner@business.com');
  const [whatsapp, setWhatsapp] = useState(currentUser?.phone || '+92 300 1234567');
  const [city, setCity] = useState('Lahore');
  const [area, setArea] = useState('Gulberg III');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('10:00 AM - 10:00 PM');
  const [description, setDescription] = useState('');
  const [verificationDocUrl, setVerificationDocUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer / EasyPaisa');
  const [paymentProofRef, setPaymentProofRef] = useState('');
  const [submittedRegistration, setSubmittedRegistration] = useState<BusinessRegistration | null>(null);

  // Fee calculation (matches backend server.ts logic)
  const baseFee = systemConfig.baseBusinessRegistrationFee || 10000;
  const platformFeeRate = systemConfig.platformRegistrationFeeRate || 0.03; // 3% Platform Charge
  const platformFeeAmount = Number((baseFee * platformFeeRate).toFixed(2));
  const legalTaxRate = systemConfig.legalTaxRate || 0.0;
  const legalTaxAmount = Number((baseFee * legalTaxRate).toFixed(2));
  const totalPayable = Number((baseFee + platformFeeAmount + legalTaxAmount).toFixed(2));

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !address.trim() || !description.trim()) {
      setError('Please fill in all required business information.');
      return;
    }
    setError(null);
    setStep('fee_breakdown');
  };

  const handleProceedToPayment = () => {
    setStep('payment_proof');
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentProofRef.trim()) {
      setError('Please provide your bank/wallet transaction ID or deposit slip reference.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/business-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: currentUser?.id || 'usr_seller_1',
          ownerName: currentUser?.name || 'Business Partner',
          businessName,
          category,
          categoryId,
          phone,
          email,
          whatsapp,
          location: {
            country: 'Pakistan',
            state: 'Punjab',
            city,
            area,
            address,
          },
          openingHours,
          description,
          verificationDocUrl: verificationDocUrl || 'https://dealhub.app/docs/sample_license.pdf',
          paymentMethod,
          paymentProofRef,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmittedRegistration(data.data);
        setStep('success');
        if (onRegistrationComplete) {
          onRegistrationComplete(data.data);
        }
      } else {
        setError(data.message || 'Failed to submit business registration.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error submitting registration.');
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
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Official Business Registration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Join DealHub Verified Merchant Network • 3% Platform Registration Fee
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

          {/* Stepper indicator */}
          <div className="grid grid-cols-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-center">
            <div
              className={`py-2.5 px-3 border-b-2 transition-colors ${
                step === 'details'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                  : 'border-transparent text-slate-400'
              }`}
            >
              1. Business Details
            </div>
            <div
              className={`py-2.5 px-3 border-b-2 transition-colors ${
                step === 'fee_breakdown'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                  : 'border-transparent text-slate-400'
              }`}
            >
              2. 3% Fee Breakdown
            </div>
            <div
              className={`py-2.5 px-3 border-b-2 transition-colors ${
                step === 'payment_proof' || step === 'success'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                  : 'border-transparent text-slate-400'
              }`}
            >
              3. Verification & Submit
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Royal Gourmet Sweets & Bakery"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      const sel = e.target.options[e.target.selectedIndex].text;
                      setCategory(sel);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="cat_restaurants">Restaurants & Dining</option>
                    <option value="cat_electronics">Electronics & Mobiles</option>
                    <option value="cat_automotive">Automotive & Detailing</option>
                    <option value="cat_home_services">Home & Electrical Services</option>
                    <option value="cat_beauty_spa">Beauty, Spa & Salon</option>
                    <option value="cat_freelance">Freelance & Digital Agency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Phone / Hotline *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 0000000"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="info@yourbrand.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Commercial Area / Sector *
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Gulberg, Clifton, DHA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Complete Physical Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop / Office #, Building Name, Street / Road"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business Description & Offerings *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your authentic services, physical showroom, or commercial goods..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-lg shadow-amber-500/20 transition-colors"
                >
                  <span>Continue to 3% Fee Breakdown</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 2: 3% Registration Fee Breakdown */}
          {step === 'fee_breakdown' && (
            <div className="p-6 space-y-5">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-bold text-amber-900 dark:text-amber-300">
                      Transparent Financial Breakdown
                    </h4>
                    <p className="text-amber-800/80 dark:text-amber-400/80 text-xs mt-0.5">
                      In accordance with DealHub Merchant Trust Standards, the 3% platform charge is strictly separated from government and legal taxes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    Base Business Registration Fee (Lifetime):
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {systemConfig.currencySymbol} {baseFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      DealHub Platform Registration Charge:
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                      3.0%
                    </span>
                  </div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    + {systemConfig.currencySymbol} {platformFeeAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    Government / Legal Tax ({systemConfig.legalTaxRate * 100}%):
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {systemConfig.currencySymbol} {legalTaxAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-base pt-2 font-bold text-slate-900 dark:text-white">
                  <span>Total Payable for Verification:</span>
                  <span className="text-xl text-emerald-600 dark:text-emerald-400">
                    {systemConfig.currencySymbol} {totalPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Verified Merchant Benefits */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Verified Merchant Privileges
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Special 2.0% platform deal commission</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Official Gold Verified Merchant Badge</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Priority Sponsored Ad Rotation Engine</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Unlimited Direct Customer Quote Requests</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Back to Details
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-lg shadow-amber-500/20 transition-colors"
                >
                  <span>Proceed to Payment Proof</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Proof Submission */}
          {step === 'payment_proof' && (
            <form onSubmit={handleFinalSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Official Merchant Bank Details
                </h4>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p><strong>Bank:</strong> Meezan Bank Ltd / Standard Chartered</p>
                  <p><strong>Account Title:</strong> DealHub Marketplace Private Ltd</p>
                  <p><strong>IBAN / Account #:</strong> PK88MEZN0001090123456789</p>
                  <p><strong>EasyPaisa / JazzCash Till:</strong> 0300-DEALHUB (987654)</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                    Amount to transfer: {systemConfig.currencySymbol} {totalPayable.toLocaleString()} (Includes 3% platform charge)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method Used *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Meezan Bank Direct Transfer">Meezan Bank Direct Transfer</option>
                  <option value="EasyPaisa Merchant QR">EasyPaisa Merchant QR</option>
                  <option value="JazzCash Mobile Transfer">JazzCash Mobile Transfer</option>
                  <option value="Bank ATM Deposit Slip">Bank ATM Deposit Slip</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Reference / Deposit Ref ID *
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={paymentProofRef}
                    onChange={(e) => setPaymentProofRef(e.target.value)}
                    placeholder="e.g. TXN-892184920 or EP-992819"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business License / NTN Certificate URL (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={verificationDocUrl}
                    onChange={(e) => setVerificationDocUrl(e.target.value)}
                    placeholder="https://... tax certificate or commercial bill"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('fee_breakdown')}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  {isSubmitting ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && submittedRegistration && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Registration Submitted Successfully!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Your application for <strong>{submittedRegistration.businessName}</strong> with reference{' '}
                <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-amber-600 dark:text-amber-400 font-mono text-xs">
                  {submittedRegistration.id}
                </code>{' '}
                is currently under review by DealHub Admin.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-xs text-left max-w-md mx-auto space-y-1.5 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Registration:</span>
                  <span className="font-semibold">{systemConfig.currencySymbol} {submittedRegistration.baseRegistrationFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DealHub 3% Platform Charge:</span>
                  <span className="font-semibold text-amber-600">{systemConfig.currencySymbol} {submittedRegistration.platformRegistrationChargeAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 font-bold">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-600">{systemConfig.currencySymbol} {submittedRegistration.totalAmountPayable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1">
                  <span>Payment Status:</span>
                  <span className="capitalize text-amber-600 font-medium">{submittedRegistration.paymentStatus.replace('_', ' ')}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-md py-3 text-sm font-bold text-white bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-700 rounded-xl transition-colors"
              >
                Close & Return to Marketplace
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
