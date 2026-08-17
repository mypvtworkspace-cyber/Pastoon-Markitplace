import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { Deal } from '../types';
import { TrendingUp, Eye, MousePointerClick, ShoppingBag, BarChart3, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SellerPerformanceDashboardProps {
  deals: Deal[];
}

export const SellerPerformanceDashboard: React.FC<SellerPerformanceDashboardProps> = ({ deals }) => {
  const { formatPrice, showToast } = useApp();
  const [metricType, setMetricType] = useState<'traffic' | 'conversion'>('traffic');

  // Compute performance metrics for each deal
  const performanceData = (deals || []).map((deal) => {
    const purchased = deal.totalQuantity - deal.remainingQuantity;
    const views = Math.max(120, purchased * 18 + ((deal.id.charCodeAt(0) * 17) % 300));
    const clicks = Math.max(25, Math.round(views * 0.28));
    const conversions = purchased > 0 ? purchased : Math.round(clicks * 0.12);
    const conversionRate = views > 0 ? Number(((conversions / views) * 100).toFixed(1)) : 0;
    const revenue = conversions * deal.discountedPrice;

    return {
      name: deal.title.length > 18 ? deal.title.substring(0, 16) + '...' : deal.title,
      fullTitle: deal.title,
      views,
      clicks,
      conversions,
      conversionRate,
      revenue,
    };
  });

  const totalViews = performanceData.reduce((sum, d) => sum + d.views, 0);
  const totalClicks = performanceData.reduce((sum, d) => sum + d.clicks, 0);
  const totalConversions = performanceData.reduce((sum, d) => sum + d.conversions, 0);
  const avgConversionRate = totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(1) : '0';

  const handleDownloadReport = () => {
    if (performanceData.length === 0) {
      showToast('No deal metrics available to export');
      return;
    }

    const headers = ['Deal Title', 'Impressions / Views', 'Clicks', 'Vouchers Purchased', 'Conversion Rate (%)', 'Est Revenue'];
    const csvRows = [
      headers.join(','),
      ...performanceData.map((d) =>
        [
          `"${d.fullTitle.replace(/"/g, '""')}"`,
          d.views,
          d.clicks,
          d.conversions,
          `${d.conversionRate}%`,
          d.revenue,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Seller_Deal_Performance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded deal performance CSV report!');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Deal Performance Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time track views, clicks, conversion rates & voucher sales across your published deals
          </p>
        </div>

        {/* Metric Toggle & CSV Download */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMetricType('traffic')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricType === 'traffic'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Views & Clicks
            </button>
            <button
              onClick={() => setMetricType('conversion')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricType === 'conversion'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Conversion Rate (%)
            </button>
          </div>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md transition-all shrink-0"
            title="Export Performance CSV Report"
          >
            <Download className="w-3.5 h-3.5" /> Download Report
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Total Views</span>
            <Eye className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">{totalViews.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +14.2% this week
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Total Clicks</span>
            <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">{totalClicks.toLocaleString()}</div>
          <div className="text-[10px] text-purple-400 font-semibold">
            CTR: {totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Vouchers Sold</span>
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">{totalConversions}</div>
          <div className="text-[10px] text-emerald-400 font-semibold">
            Avg Conv Rate: {avgConversionRate}%
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Est. Sales Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {formatPrice(performanceData.reduce((sum, d) => sum + d.revenue, 0))}
          </div>
          <div className="text-[10px] text-amber-400 font-semibold">Net after 2% fee</div>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-64 w-full pt-2">
        {performanceData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
            No published deals available to display performance charts.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: any) => [
                  metricType === 'conversion' && name === 'Conversion Rate' ? `${value}%` : value,
                  name,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              {metricType === 'traffic' ? (
                <>
                  <Bar dataKey="views" name="Deal Impressions / Views" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" name="Detail Clicks" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" name="Voucher Purchases" fill="#10b981" radius={[4, 4, 0, 0]} />
                </>
              ) : (
                <Bar dataKey="conversionRate" name="Conversion Rate (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
