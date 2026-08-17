import React, { useState, useEffect } from 'react';
import { Crown, DollarSign, ShieldAlert, BarChart3, TrendingUp, Users, Award, Percent, Settings, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

export const OwnerPremiumPanel: React.FC = () => {
  const { systemConfig, updateCommissionRate, formatPrice, setIsManagerInviteModalOpen, showToast } = useApp();
  const [analytics, setAnalytics] = useState<any>(null);
  const [commissionRateInput, setCommissionRateInput] = useState((systemConfig.defaultCommissionRate * 100).toString());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getPlatformAnalytics();
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(commissionRateInput) / 100;
    if (isNaN(parsed) || parsed < 0 || parsed > 0.2) {
      showToast('Commission rate must be between 0% and 20%');
      return;
    }
    await updateCommissionRate(parsed);
    loadAnalytics();
  };

  return (
    <div className="space-y-6">
      
      {/* Owner Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white">DealHub Owner Control & Analytics</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                LEVEL 5 OWNER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Platform Revenue Engine, 2% Commission Settler, Fraud Prevention & Role Matrix
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsManagerInviteModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Users className="w-4 h-4" /> Invite New Manager / Staff
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Marketplace GMV</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-extrabold text-white">{formatPrice(analytics.totalGMV)}</p>
            <span className="text-[10px] text-emerald-400 font-medium">100% Gross Volume Settled</span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Platform Commission Net</span>
              <Percent className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-extrabold text-amber-400">{formatPrice(analytics.totalCommissionRevenue)}</p>
            <span className="text-[10px] text-slate-400 font-medium">Auto-calculated @ {analytics.commissionRatePercent}</span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Verified Businesses</span>
              <Award className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-extrabold text-white">
              {analytics.verifiedBusinessesCount} / {analytics.totalBusinessesCount}
            </p>
            <span className="text-[10px] text-blue-400 font-medium">Tax NTN & Document Verified</span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Sponsor Campaign Budget</span>
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xl font-extrabold text-purple-300">{formatPrice(analytics.totalSponsorBudget)}</p>
            <span className="text-[10px] text-purple-400 font-medium">Active Banner & Deal Sponsorships</span>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 text-xs animate-pulse">
          Loading platform metrics...
        </div>
      )}

      {/* Settings & Transparent Rating Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Commission Rate Settings */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Global Platform Commission Engine</h3>
          </div>
          <p className="text-xs text-slate-400">
            Configure default platform commission rate for universal marketplace orders. (Default: 2.0%).
          </p>

          <form onSubmit={handleSaveCommission} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Commission Rate (%)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  value={commissionRateInput}
                  onChange={(e) => setCommissionRateInput(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 w-32"
                />
                <span className="text-xs font-bold text-amber-400">%</span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition"
                >
                  Update Commission Rate
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Transparent Rating & Verification Principles */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Transparent Business Ranking Policy</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Independent Reviews:</strong> Star ratings (1-5) come strictly from verified buyers. Platform owners cannot manipulate ratings.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Trust Labels:</strong> Businesses are labeled clearly with "VERIFIED", "FEATURED", or "SPONSORED" badges to protect consumer trust.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
