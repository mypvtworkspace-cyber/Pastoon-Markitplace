import React, { useState } from 'react';
import { QrCode, X, Copy, Check, ExternalLink, ShieldCheck, Ticket } from 'lucide-react';
import { Deal, Business } from '../types';
import { useApp } from '../context/AppContext';

interface QRCodeModalProps {
  deal: Deal | null;
  business?: Business;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ deal, business, isOpen, onClose }) => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !deal) return null;

  const deepLink = `${window.location.origin}/#deal-${deal.id}`;
  const voucherCode = deal.redemptionCode || `DH-${deal.id.substring(0, 8).toUpperCase()}`;

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(voucherCode);
    }
    setCopied(true);
    showToast('Voucher code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate deterministic QR Code grid SVG pattern based on voucher string
  const generateQRCells = (seedStr: string) => {
    const size = 21; // 21x21 QR Grid
    const cells: boolean[][] = Array(size)
      .fill(false)
      .map(() => Array(size).fill(false));

    // Seed hash calculation
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }

    // Fill finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            cells[startY + r][startX + c] = true;
          }
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(14, 0);
    drawFinder(0, 14);

    // Fill data modules based on hash
    let h = Math.abs(hash);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finder areas
        if ((r < 7 && c < 7) || (r < 7 && c >= 14) || (r >= 14 && c < 7)) continue;
        h = (h * 1664525 + 1013904223) % 2147483647;
        cells[r][c] = h % 3 === 0;
      }
    }

    return cells;
  };

  const qrGrid = generateQRCells(voucherCode + deal.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-left">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <QrCode className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white">In-Store QR Voucher</h3>
              <p className="text-[11px] text-slate-400">{business?.name || 'Partner Seller'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-5 rounded-2xl shadow-xl border-4 border-indigo-600 flex flex-col items-center justify-center mx-auto w-56 h-56 relative group">
          <svg viewBox="0 0 21 21" className="w-full h-full">
            {qrGrid.map((row, rIdx) =>
              row.map(
                (cell, cIdx) =>
                  cell && <rect key={`${rIdx}-${cIdx}`} x={cIdx} y={rIdx} width="1" height="1" fill="#0f172a" />
              )
            )}
          </svg>
          <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow">
              Scan at Counter
            </span>
          </div>
        </div>

        {/* Voucher Code Box */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
            <Ticket className="w-3 h-3 text-amber-400" /> Redemption Voucher Code
          </div>
          <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
            <code className="text-sm font-black text-indigo-400 font-mono tracking-widest">{voucherCode}</code>
            <button
              onClick={handleCopyCode}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Show this QR code or code at merchant location to redeem discount!</span>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 rounded-xl transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
