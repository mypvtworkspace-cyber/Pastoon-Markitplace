import React, { useState } from 'react';
import {
  FileText,
  X,
  Clock,
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  QrCode,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Share2,
  Copy,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useApp } from '../context/AppContext';
import { QRCodeModal } from './QRCodeModal';

interface OrderTrackingModalProps {
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ orders = [], isOpen, onClose }) => {
  const { formatPrice, showToast, businesses = [] } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);

  // Sync if props update
  React.useEffect(() => {
    if (orders && orders.length > 0) {
      setLocalOrders(orders);
    }
  }, [orders]);

  if (!isOpen) return null;

  // Active orders list safety guard
  const safeOrdersList = Array.isArray(localOrders) ? localOrders : [];

  // Define status milestones
  const milestones: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
    {
      status: 'pending',
      label: 'Pending',
      desc: 'Order placed & payment verified',
      icon: Clock,
    },
    {
      status: 'confirmed',
      label: 'Confirmed',
      desc: 'Merchant accepted order & reserved stock',
      icon: CheckCircle2,
    },
    {
      status: 'processing',
      label: 'Processing',
      desc: 'Item prepared or service slot locked',
      icon: PackageCheck,
    },
    {
      status: 'completed',
      label: 'Redeemed',
      desc: 'Voucher redeemed or product delivered',
      icon: ShieldCheck,
    },
  ];

  const getMilestoneIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
      case 'ready':
        return 2;
      case 'completed':
        return 3;
      case 'refunded':
      case 'cancelled':
      case 'disputed':
        return -1;
      default:
        return 0;
    }
  };

  const handleShareOrder = (order: Order) => {
    const shareUrl = `${window.location.origin}?orderNumber=${order.orderNumber}`;
    const shareText = `Track my order #${order.orderNumber} for ${order.businessName} on DealHub! Voucher: ${order.redemptionVoucherCode || 'DH-VOUCHER'}`;

    if (navigator.share) {
      navigator
        .share({
          title: `DealHub Order #${order.orderNumber}`,
          text: shareText,
          url: shareUrl,
        })
        .catch((err) => {
          console.log('Share dismissed:', err);
        });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
      showToast(`Order #${order.orderNumber} tracking link copied to clipboard!`);
    } else {
      showToast(`Voucher Code: ${order.redemptionVoucherCode}`);
    }
  };

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/10';
      case 'processing':
      case 'ready':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-sm shadow-yellow-500/10';
      case 'confirmed':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10';
      case 'pending':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/10';
      case 'cancelled':
      case 'refunded':
      case 'disputed':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-500/10';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleSimulateStatusAdvance = (orderId: string) => {
    setLocalOrders((prev) =>
      (prev || []).map((o) => {
        if (o.id !== orderId) return o;
        let nextStatus: OrderStatus = 'pending';
        if (o.status === 'pending') nextStatus = 'confirmed';
        else if (o.status === 'confirmed') nextStatus = 'processing';
        else if (o.status === 'processing') nextStatus = 'completed';
        else nextStatus = 'pending';

        showToast(`Real-Time Order #${o.orderNumber} updated to '${nextStatus.toUpperCase()}'!`);
        return {
          ...o,
          status: nextStatus,
          isRedeemed: nextStatus === 'completed' ? true : o.isRedeemed,
        };
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/20">
              <Truck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                Real-Time Order Tracking & Milestone Logs
              </h3>
              <p className="text-xs text-slate-400">
                Track status updates from payment confirmation to merchant redemption
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {safeOrdersList.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-700 stroke-1" />
              <p className="text-sm font-bold text-slate-400">No active orders or vouchers found.</p>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Once you purchase a deal voucher or physical product, real-time milestone tracking will appear here.
              </p>
            </div>
          ) : (
            safeOrdersList.map((ord) => {
              const currentStepIndex = getMilestoneIndex(ord.status);
              const biz = (businesses || []).find((b) => b.id === ord.businessId);

              return (
                <div
                  key={ord.id}
                  className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-5 relative overflow-hidden group shadow-lg"
                >
                  {/* Top Bar Info */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-indigo-400">
                          Order #{ord.orderNumber}
                        </span>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                          2.0% Fee Verified
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-200">
                        Merchant: {ord.businessName}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShareOrder(ord)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
                        title="Share order tracking link or copy to clipboard"
                      >
                        <Share2 className="w-3.5 h-3.5 text-indigo-400" /> Share
                      </button>

                      <button
                        onClick={() => handleSimulateStatusAdvance(ord.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
                        title="Simulate status milestone progression for live demo"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Advance Status
                      </button>

                      <span
                        className={`text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider border ${getStatusBadgeStyle(
                          ord.status
                        )}`}
                      >
                        {ord.status === 'completed' ? 'Redeemed' : ord.status}
                      </span>
                    </div>
                  </div>

                  {/* Real-Time Stepper Progress Bar */}
                  <div className="py-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                      <span>Order Progress Milestones</span>
                      <span className="text-indigo-400 font-mono">
                        Step {Math.max(1, currentStepIndex + 1)} of 4
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative">
                      {milestones.map((m, idx) => {
                        const IconComponent = m.icon;
                        const isPassed = currentStepIndex >= idx;
                        const isCurrent = currentStepIndex === idx;

                        let stepBg = 'bg-slate-900/40 border-slate-800 opacity-40 text-slate-500';
                        let iconBg = 'bg-slate-800 text-slate-500';

                        if (isCurrent) {
                          if (m.status === 'pending') {
                            stepBg = 'bg-sky-950/60 border-sky-500 shadow-md shadow-sky-500/10 text-sky-200';
                            iconBg = 'bg-sky-500 text-slate-950 font-bold';
                          } else if (m.status === 'confirmed') {
                            stepBg = 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/10 text-indigo-200';
                            iconBg = 'bg-indigo-500 text-white font-bold';
                          } else if (m.status === 'processing') {
                            stepBg = 'bg-yellow-950/60 border-yellow-500 shadow-md shadow-yellow-500/10 text-yellow-200';
                            iconBg = 'bg-yellow-500 text-slate-950 font-bold';
                          } else if (m.status === 'completed') {
                            stepBg = 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-500/10 text-emerald-200';
                            iconBg = 'bg-emerald-500 text-slate-950 font-bold';
                          }
                        } else if (isPassed) {
                          stepBg = 'bg-slate-900 border-slate-700 text-slate-300';
                          iconBg = 'bg-indigo-600/80 text-white';
                        }

                        return (
                          <div
                            key={m.status}
                            className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${stepBg}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`p-2 rounded-xl ${iconBg}`}>
                                <IconComponent className="w-4 h-4" />
                              </span>
                              {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>

                            <div>
                              <div className="font-extrabold text-xs text-white flex items-center justify-between">
                                <span>{m.label}</span>
                                {isCurrent && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider bg-white/10">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{m.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Purchased Items / Services:</div>
                    <ul className="divide-y divide-slate-800 text-xs">
                      {(ord.items || []).map((item) => (
                        <li key={item.id} className="py-1.5 flex items-center justify-between">
                          <span className="font-medium text-slate-200">
                            {item.quantity}x {item.title}
                          </span>
                          <span className="font-bold text-slate-300">{formatPrice(item.totalPrice)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Voucher & Total Info */}
                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-extrabold uppercase">Voucher Code</div>
                        <div className="font-mono font-black text-sm text-indigo-400 tracking-widest">
                          {ord.redemptionVoucherCode || 'DH-VOUCHER-OFFICIAL'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Total Paid (Incl Tax & Fee)</div>
                        <div className="font-black text-sm text-emerald-400">{formatPrice(ord.totalAmount)}</div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setShowQR(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Show In-Store QR
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* QR Code Modal popup for selected order voucher */}
      {showQR && selectedOrder && (
        <QRCodeModal
          deal={{
            id: selectedOrder.id,
            title: selectedOrder.items?.[0]?.title || 'Order Voucher',
            redemptionCode: selectedOrder.redemptionVoucherCode,
          } as any}
          business={(businesses || []).find((b) => b.id === selectedOrder.businessId)}
          isOpen={showQR}
          onClose={() => {
            setShowQR(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};
