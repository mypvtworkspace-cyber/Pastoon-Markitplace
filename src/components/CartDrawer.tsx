import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccessOrder: (order: any) => void;
}> = ({ isOpen, onClose, onSuccessOrder }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, formatPrice, systemConfig } = useApp();
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const commissionRate = systemConfig.defaultCommissionRate;
  const platformFee = Number((subtotal * commissionRate).toFixed(2));

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end">
        <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Your Deal Cart</h2>
              <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs font-extrabold px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                <ShoppingBag className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium">Your cart is currently empty.</p>
                <p className="text-xs text-slate-400">Explore deals, services and products across multiple categories!</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-3 rounded-2xl flex gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-200" />
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.title}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-rose-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400">{item.businessName}</div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </div>

                      <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden text-xs bg-white dark:bg-slate-900">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-slate-800 dark:text-slate-200">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>Transparent {(commissionRate * 100).toFixed(1)}% Platform Fee:</span>
                  <span>{formatPrice(platformFee)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Payable:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccessOrder={(order) => {
            setShowCheckout(false);
            onClose();
            onSuccessOrder(order);
          }}
        />
      )}
    </>
  );
};
