import React, { useState } from 'react';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, X, Download, Plus, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

interface CSVBatchDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedDealRow {
  title: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  categoryId: string;
  remainingQuantity: number;
  description: string;
  images: string[];
  dealType: 'physical_product' | 'service_voucher';
  isFlashDeal: boolean;
  isValid: boolean;
  error?: string;
}

const SAMPLE_CSV = `Title,OriginalPrice,DiscountedPrice,Category,Quantity,Description,ImageURL
Premium Wireless Earbuds,12000,7500,cat_electronics,50,Noise cancelling wireless earbuds with charging case,https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600
Luxury Spa Massage Voucher,15000,8999,cat_health,20,Full body relaxing Swedish massage for 60 minutes,https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600
Gourmet Buffet Voucher for Two,6000,3999,cat_food,35,All-you-can-eat dinner buffet voucher for 2 persons,https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600`;

export const CSVBatchDealModal: React.FC<CSVBatchDealModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { categories, currentUser, showToast } = useApp();
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedDealRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('upload');

  if (!isOpen) return null;

  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
      setParsedRows([]);
      return;
    }

    const rows: ParsedDealRow[] = [];
    // Assume Header: Title, OriginalPrice, DiscountedPrice, Category, Quantity, Description, ImageURL
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quotes or standard comma split
      const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      const title = cols[0] || '';
      const originalPrice = parseFloat(cols[1]) || 0;
      const discountedPrice = parseFloat(cols[2]) || 0;
      const categoryId = cols[3] || categories[0]?.id || 'cat_electronics';
      const remainingQuantity = parseInt(cols[4], 10) || 10;
      const description = cols[5] || 'Special limited time promotional deal voucher.';
      const imageUrl = cols[6] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600';

      const discountPercentage = originalPrice > 0 ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0;
      const isValid = title.length >= 3 && originalPrice > 0 && discountedPrice > 0;

      rows.push({
        title,
        originalPrice,
        discountedPrice,
        discountPercentage: Math.max(1, Math.min(99, discountPercentage)),
        categoryId,
        remainingQuantity,
        description,
        images: [imageUrl],
        dealType: categoryId.includes('health') || categoryId.includes('services') ? 'service_voucher' : 'physical_product',
        isFlashDeal: discountPercentage >= 35,
        isValid,
        error: !isValid ? 'Invalid title or pricing values' : undefined,
      });
    }

    setParsedRows(rows);
    if (rows.length > 0) setActiveTab('preview');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setCsvText(content);
        parseCSV(content);
      }
    };
    reader.readAsText(file);
  };

  const handleBatchSubmit = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showToast('No valid deal rows to import');
      return;
    }

    setIsUploading(true);
    try {
      let createdCount = 0;

      for (const row of validRows) {
        const payload = {
          businessId: currentUser.businessId || 'biz_tech1',
          title: row.title,
          description: row.description,
          originalPrice: row.originalPrice,
          discountedPrice: row.discountedPrice,
          discountPercentage: row.discountPercentage,
          categoryId: row.categoryId,
          totalQuantity: row.remainingQuantity,
          remainingQuantity: row.remainingQuantity,
          dealType: row.dealType,
          isFlashDeal: row.isFlashDeal,
          isSponsored: false,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          images: row.images,
        };

        const res = await api.createDeal(payload as any);
        if (res.success) createdCount++;
      }

      showToast(`Successfully batch created ${createdCount} deal vouchers!`);
      onSuccess();
      onClose();
    } catch (err) {
      showToast('Error during batch deal creation');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Batch Create Deals via CSV Upload</h2>
              <p className="text-xs text-slate-400">Import inventory spreadsheet to launch multiple deal vouchers in bulk</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 pt-2 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'upload' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Upload or Paste CSV
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            disabled={parsedRows.length === 0}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'preview' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 disabled:opacity-50'
            }`}
          >
            2. Preview Parsed Deals ({parsedRows.length})
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {activeTab === 'upload' ? (
            <div className="space-y-6">
              {/* File Drag Zone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-8 text-center bg-slate-900/50 transition-colors">
                <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3 animate-bounce" />
                <p className="text-sm font-bold text-slate-200">Select or drop your CSV spreadsheet file</p>
                <p className="text-xs text-slate-500 mt-1">Accepts .csv format with headers Title, OriginalPrice, DiscountedPrice, Category, Quantity</p>

                <label className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20 transition-all">
                  <FileSpreadsheet className="w-4 h-4" /> Browse CSV File
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Sample CSV Copy Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Or Paste Raw CSV Data / Use Sample Template:</span>
                  <button
                    onClick={() => {
                      setCsvText(SAMPLE_CSV);
                      parseCSV(SAMPLE_CSV);
                    }}
                    className="text-indigo-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Load Sample Data
                  </button>
                </div>

                <textarea
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    parseCSV(e.target.value);
                  }}
                  placeholder="Paste CSV rows here..."
                  rows={5}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            /* PREVIEW TAB */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  Found <strong className="text-indigo-400">{parsedRows.length}</strong> items. Valid:{' '}
                  <strong className="text-emerald-400">{parsedRows.filter((r) => r.isValid).length}</strong>
                </span>

                <button
                  onClick={() => setActiveTab('upload')}
                  className="text-slate-400 hover:text-white text-xs underline"
                >
                  Edit CSV Input
                </button>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="p-3">Status</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Original</th>
                      <th className="p-3">Discounted</th>
                      <th className="p-3">Off</th>
                      <th className="p-3">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-800/40' : 'bg-rose-950/20'}>
                        <td className="p-3">
                          {row.isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400" title={row.error} />
                          )}
                        </td>
                        <td className="p-3 font-semibold text-slate-200">{row.title}</td>
                        <td className="p-3 text-slate-400">{row.originalPrice}</td>
                        <td className="p-3 text-emerald-400 font-bold">{row.discountedPrice}</td>
                        <td className="p-3 text-amber-400 font-bold">{row.discountPercentage}%</td>
                        <td className="p-3 text-slate-300">{row.remainingQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">
            Cancel
          </button>

          <button
            onClick={handleBatchSubmit}
            disabled={isUploading || parsedRows.filter((r) => r.isValid).length === 0}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            {isUploading ? (
              'Creating Vouchers...'
            ) : (
              <>
                <Layers className="w-4 h-4" /> Batch Create {parsedRows.filter((r) => r.isValid).length} Deals
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
