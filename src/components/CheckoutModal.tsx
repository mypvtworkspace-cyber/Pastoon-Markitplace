import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, CreditCard, Smartphone, Building, DollarSign, Calendar, Clock, Ticket } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

export const CheckoutModal: React.FC<{
  onClose: () => void;
  onSuccessOrder: (order: any) => void;
}> = ({ onClose, onSuccessOrder }) => {
  const { cart, clearCart, formatPrice, systemConfig, currentUser, showToast } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<string>('easypaisa_jazzcash');
  const [customerName, setCustomerName] = useState(currentUser.name);
  const [customerEmail, setCustomerEmail] = useState(currentUser.email);
  const [customerPhone, setCustomerPhone] = useState(currentUser.phone || '+92 300 1234567');
  const [bookingDate, setBookingDate] = useState('2026-08-15');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('03:00 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const commissionRate = systemConfig.defaultCommissionRate; // e.g. 0.02
  const platformCommission = Number((subtotal * commissionRate).toFixed(2));
  const sellerSettlement = Number((subtotal - platformCommission).toFixed(2));

  const containsService = cart.some((item) => item.type === 'service' || item.dealId?.includes('service'));

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    // Group items by business
    const firstItem = cart?.[0];

    const orderPayload = {
      customerId: currentUser.id,
      customerName,
      customerEmail,
      customerPhone,
      businessId: firstItem?.businessId || 'biz_general',
      items: cart.map((i) => ({
        dealId: i.dealId,
        productId: i.productId,
        serviceId: i.serviceId,
        title: i.title,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        type: i.type,
      })),
      paymentMethod,
      bookingDate: containsService ? bookingDate : undefined,
      bookingTimeSlot: containsService ? bookingTimeSlot : undefined,
    };

    const res = await api.createOrder(orderPayload);
    setIsSubmitting(false);

    if (res.success && res.data) {
      showToast(`Order #${res.data.orderNumber} placed successfully!`);
      clearCart();
      onSuccessOrder(res.data);
    } else {
      showToast(res.message || 'Failed to place order.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" /> Secure Commercial Checkout
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              DealHub Guaranteed • {(commissionRate * 100).toFixed(1)}% Platform Fee
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Items Review */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Summary ({cart.length} items)</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{item.title}</div>
                  <div className="text-[10px] text-slate-400">{item.businessName} • Qty: {item.quantity}</div>
                </div>
                <div className="font-extrabold text-slate-900 dark:text-slate-100">
                  {formatPrice(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transparent Commission & Financial Breakdown */}
        <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
          <div className="font-bold text-slate-100 border-b border-slate-800 pb-1.5 flex justify-between">
            <span>Financial Ledger</span>
            <span className="text-indigo-400">Automated {(commissionRate * 100).toFixed(1)}% Engine</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Items Subtotal:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-amber-300">
            <span>DealHub Platform Commission ({(commissionRate * 100).toFixed(1)}%):</span>
            <span>{formatPrice(platformCommission)}</span>
          </div>

          <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-slate-800">
            <span>Seller Settlement (Net):</span>
            <span>{formatPrice(sellerSettlement)}</span>
          </div>

          <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
            <span>Total Payable:</span>
            <span className="text-emerald-400">{formatPrice(subtotal)}</span>
          </div>
        </div>

        {/* Customer Contact Info Form */}
        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Service Booking Date/Slot Picker */}
          {containsService && (
            <div className="bg-indigo-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-indigo-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Service Appointment Scheduler
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Select Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Time Slot</label>
                  <select
                    value={bookingTimeSlot}
                    onChange={(e) => setBookingTimeSlot(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-slate-100"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Gateway</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('easypaisa_jazzcash')}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === 'easypaisa_jazzcash'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-5 h-5 text-emerald-500" />
                <span>EasyPaisa / JazzCash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-500" />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Building className="w-5 h-5 text-purple-500" />
                <span>Bank Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <DollarSign className="w-5 h-5 text-amber-500" />
                <span>COD / Voucher</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Processing Payment...' : `Confirm Order & Issue Voucher (${formatPrice(subtotal)})`}
          </button>
        </form>
      </div>
    </div>
  );
};
