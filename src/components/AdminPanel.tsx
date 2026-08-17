import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Key,
  RotateCcw,
  Search,
  Filter,
  BarChart3,
  Percent,
  Megaphone,
  MessageSquare,
  Activity,
  UserCheck,
  LockKeyhole,
  Clock,
  Shield,
  Layers,
  Tag,
  Star,
  Award,
  Trash2,
  ThumbsUp,
  Check,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, AuditLog, ChatModerationRequest, ChatMessage, Conversation, Review } from '../types';
import { api } from '../lib/api';
import { OwnerPremiumPanel } from './OwnerPremiumPanel';

interface AdminPanelProps {
  onClose?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const {
    user,
    systemConfig,
    updateCommissionRate,
    formatPrice,
    businesses,
    orders,
    verifyBusiness,
    reviews,
    moderateReview,
    deleteReview,
    replyToReview,
  } = useApp();

  // Admin Role State (Defaults to Super Admin or user's assigned role)
  const [activeAdminRole, setActiveAdminRole] = useState<UserRole>('super_admin');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'security' | 'finance' | 'marketplace' | 'sponsorships' | 'reviews' | 'support'
  >('overview');

  // Stats & Logs Data
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [moderationRequests, setModerationRequests] = useState<ChatModerationRequest[]>([]);
  const [selectedChatForReview, setSelectedChatForReview] = useState<string | null>(null);
  const [chatMessagesToReview, setChatMessagesToReview] = useState<ChatMessage[]>([]);
  const [chatJustificationReason, setChatJustificationReason] = useState('');
  const [showChatAccessModal, setShowChatAccessModal] = useState(false);

  // Review Moderation Filters State
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('all');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<string>('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState<string>('');
  const [reviewBusinessFilter, setReviewBusinessFilter] = useState<string>('all');

  // High-Risk Confirmation Dialog State
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);
  const [pendingHighRiskAction, setPendingHighRiskAction] = useState<{
    type: string;
    title: string;
    description: string;
    execute: () => void;
  } | null>(null);
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');

  // Commission Editor State
  const [newCommissionPercent, setNewCommissionPercent] = useState(
    (systemConfig.defaultCommissionRate * 100).toString()
  );

  // Search/Filter states
  const [auditSearch, setAuditSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const statsRes = await api.getPlatformAnalytics();
    if (statsRes.success) setAnalytics(statsRes.data);

    const logsRes = await api.getAuditLogs();
    if (logsRes.success && logsRes.data) setAuditLogs(logsRes.data);

    const modRes = await api.getChatModerationRequests();
    if (modRes.success && modRes.data) setModerationRequests(modRes.data);
  }

  // Handle High-Risk Actions with Required Double-Confirmation & Audit Logging
  const triggerHighRiskAction = (
    title: string,
    description: string,
    actionType: string,
    executeFn: () => void
  ) => {
    setPendingHighRiskAction({
      type: actionType,
      title,
      description,
      execute: async () => {
        executeFn();
        await api.createAuditLog({
          actorId: user?.id || 'admin_user',
          actorRole: activeAdminRole,
          action: actionType,
          details: `HIGH-RISK CONFIRMED: ${description}`,
        });
        loadData();
      },
    });
    setAdminPasswordConfirm('');
    setShowHighRiskModal(true);
  };

  const handleConfirmHighRisk = () => {
    if (!adminPasswordConfirm) return;
    if (pendingHighRiskAction) {
      pendingHighRiskAction.execute();
    }
    setShowHighRiskModal(false);
    setPendingHighRiskAction(null);
    setAdminPasswordConfirm('');
  };

  const handleUpdateCommission = () => {
    const rate = parseFloat(newCommissionPercent) / 100;
    if (isNaN(rate) || rate < 0 || rate > 0.2) {
      alert('Please enter a valid commission percentage between 0% and 20%.');
      return;
    }

    triggerHighRiskAction(
      'Modify Platform Commission Rate',
      `Change default platform commission rate from ${(systemConfig.defaultCommissionRate * 100).toFixed(1)}% to ${newCommissionPercent}%`,
      'COMMISSION_RATE_UPDATE',
      () => {
        updateCommissionRate(rate);
      }
    );
  };

  // Controlled Moderation Access Request for Private Chat Review
  const handleRequestChatAccess = async (conversationId: string) => {
    if (!chatJustificationReason.trim()) {
      alert('A valid justification reason is strictly required before accessing private chats.');
      return;
    }

    triggerHighRiskAction(
      'Access Moderation Controlled Chat',
      `Granting temporary moderation access to private conversation ${conversationId}. Reason: "${chatJustificationReason}"`,
      'SENSITIVE_CHAT_ACCESS_GRANTED',
      async () => {
        const res = await api.getChatMessages(conversationId, user?.id || 'admin', chatJustificationReason);
        if (res.success && res.data) {
          setChatMessagesToReview(res.data);
          setSelectedChatForReview(conversationId);
          setShowChatAccessModal(false);
          setChatJustificationReason('');
        }
      }
    );
  };

  // Granular Role Permission Helper
  const hasPermission = (requiredRole: string[]) => {
    if (activeAdminRole === 'super_admin') return true;
    return requiredRole.includes(activeAdminRole);
  };

  const filteredLogs = (auditLogs || []).filter(
    (log) =>
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorRole.toLowerCase().includes(auditSearch.toLowerCase())
  );

  // Filtered Reviews for Moderation Center
  const filteredReviews = (reviews || []).filter((r) => {
    if (reviewStatusFilter !== 'all' && (r.status || 'published') !== reviewStatusFilter) return false;
    if (reviewRatingFilter !== 'all' && Math.round(r.rating) !== parseInt(reviewRatingFilter)) return false;
    if (reviewBusinessFilter !== 'all' && r.businessId !== reviewBusinessFilter) return false;
    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase();
      return (
        r.comment.toLowerCase().includes(q) ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        r.customerName.toLowerCase().includes(q) ||
        r.businessName.toLowerCase().includes(q) ||
        (r.dealTitle && r.dealTitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const flaggedReviewsCount = (reviews || []).filter((r) => r.status === 'flagged').length;
  const pendingReviewsCount = (reviews || []).filter((r) => r.status === 'pending_moderation').length;
  const totalVerifiedPurchases = (reviews || []).filter((r) => r.isVerifiedPurchase).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Security Control Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">DealHub Enterprise Governance</h1>
                <span className="bg-rose-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Ultra ProMax Shield
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Audited & SQL-Injection Immunized • Active Admin: {user?.name || 'Administrator'}
              </p>
            </div>
          </div>

          {/* Granular Admin Role Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1 shrink-0">
              Role:
            </span>
            {(
              [
                { role: 'super_admin', label: 'Super Admin', color: 'bg-rose-600 text-white' },
                { role: 'finance_admin', label: 'Finance', color: 'bg-emerald-600 text-white' },
                { role: 'security_admin', label: 'Security', color: 'bg-indigo-600 text-white' },
                { role: 'marketing_admin', label: 'Marketing', color: 'bg-purple-600 text-white' },
                { role: 'support_admin', label: 'Support', color: 'bg-amber-600 text-white' },
                { role: 'moderation_admin', label: 'Moderation', color: 'bg-cyan-600 text-white' },
                { role: 'business_verification_admin', label: 'Verification', color: 'bg-blue-600 text-white' },
              ] as const
            ).map((r) => (
              <button
                key={r.role}
                onClick={() => setActiveAdminRole(r.role as UserRole)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeAdminRole === r.role
                    ? r.color + ' shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full p-4 md:p-6 flex-1 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto">
          {[
            {
              id: 'overview',
              label: 'Overview',
              icon: BarChart3,
              roles: [
                'super_admin',
                'finance_admin',
                'security_admin',
                'marketing_admin',
                'support_admin',
                'moderation_admin',
                'business_verification_admin',
              ],
            },
            {
              id: 'reviews',
              label: 'Review Moderation',
              icon: Star,
              roles: ['super_admin', 'moderation_admin', 'support_admin', 'business_verification_admin'],
              badge: flaggedReviewsCount > 0 ? flaggedReviewsCount : undefined,
            },
            {
              id: 'security',
              label: 'Security & Audit',
              icon: Lock,
              roles: ['super_admin', 'security_admin', 'moderation_admin'],
            },
            {
              id: 'finance',
              label: 'Finance & 2% Fee',
              icon: DollarSign,
              roles: ['super_admin', 'finance_admin'],
            },
            {
              id: 'marketplace',
              label: 'Marketplace & Dealers',
              icon: Building2,
              roles: ['super_admin', 'business_verification_admin', 'support_admin'],
            },
            {
              id: 'sponsorships',
              label: 'Sponsorships & Ads',
              icon: Megaphone,
              roles: ['super_admin', 'marketing_admin'],
            },
            {
              id: 'support',
              label: 'Chat Moderation',
              icon: ShieldAlert,
              roles: ['super_admin', 'support_admin', 'moderation_admin'],
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isPermitted = hasPermission(tab.roles);
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                disabled={!isPermitted}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                    : isPermitted
                    ? 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    : 'border-transparent text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="bg-rose-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
                {!isPermitted && <Lock className="w-3 h-3 text-slate-600 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Level 5 Owner Control Section */}
            <OwnerPremiumPanel />

            {/* Quick Security & Audit Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" /> Recent Security & Audit Event Trail
                </h3>
                <button
                  onClick={() => setActiveTab('security')}
                  className="text-xs text-indigo-400 hover:underline font-bold"
                >
                  View Full Audit Log →
                </button>
              </div>

              <div className="divide-y divide-slate-800/60">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono text-[10px]">
                        {log.actorRole}
                      </span>
                      <span className="font-bold text-slate-200">{log.action}</span>
                      <span className="text-slate-400 truncate max-w-md">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: REVIEW MODERATION CENTER */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Top Review Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Total Reviews</div>
                  <div className="text-xl font-black text-white">{reviews.length}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Verified Purchases</div>
                  <div className="text-xl font-black text-emerald-400">{totalVerifiedPurchases}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Flagged by Community</div>
                  <div className="text-xl font-black text-rose-400">{flaggedReviewsCount}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Featured Feedback</div>
                  <div className="text-xl font-black text-indigo-400">
                    {reviews.filter((r) => r.isFeatured).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reviews by text, customer, or store..."
                  value={reviewSearchQuery}
                  onChange={(e) => setReviewSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end text-xs">
                {/* Status Filter */}
                <select
                  value={reviewStatusFilter}
                  onChange={(e) => setReviewStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="flagged">Flagged</option>
                  <option value="pending_moderation">Pending Moderation</option>
                  <option value="hidden">Hidden</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* Rating Filter */}
                <select
                  value={reviewRatingFilter}
                  onChange={(e) => setReviewRatingFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars ★</option>
                  <option value="4">4 Stars ★</option>
                  <option value="3">3 Stars ★</option>
                  <option value="2">2 Stars ★</option>
                  <option value="1">1 Star ★</option>
                </select>

                {/* Business Filter */}
                <select
                  value={reviewBusinessFilter}
                  onChange={(e) => setReviewBusinessFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none max-w-[180px]"
                >
                  <option value="all">All Businesses</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reviews Moderation Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> User Review Moderation Queue (
                  {filteredReviews.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Customer & Purchase</th>
                      <th className="p-3">Store / Item</th>
                      <th className="p-3">Rating & Feedback</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Moderator Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredReviews.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No reviews found matching the selected moderation filters.
                        </td>
                      </tr>
                    ) : (
                      filteredReviews.map((rev) => (
                        <tr key={rev.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Customer */}
                          <td className="p-3 space-y-1 align-top">
                            <div className="font-extrabold text-white flex items-center gap-1.5">
                              {rev.customerName}
                            </div>
                            {rev.isVerifiedPurchase ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">Unverified</span>
                            )}
                            <div className="text-[10px] text-slate-400">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Business / Item */}
                          <td className="p-3 space-y-1 align-top">
                            <div className="font-bold text-indigo-300">{rev.businessName}</div>
                            {rev.dealTitle && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                Deal: {rev.dealTitle}
                              </div>
                            )}
                            {rev.productTitle && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                Product: {rev.productTitle}
                              </div>
                            )}
                          </td>

                          {/* Feedback & Star */}
                          <td className="p-3 space-y-1.5 align-top max-w-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400 font-bold text-xs">
                                {'★'.repeat(rev.rating)}
                              </span>
                              {rev.title && (
                                <span className="font-bold text-white text-xs truncate">
                                  {rev.title}
                                </span>
                              )}
                              {rev.isFeatured && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-black">
                                  Featured
                                </span>
                              )}
                            </div>
                            <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                              {rev.comment}
                            </p>
                            {rev.sellerReply && (
                              <div className="text-[11px] text-indigo-400 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                                <strong>Merchant Reply:</strong> {rev.sellerReply}
                              </div>
                            )}
                            {rev.moderationReason && (
                              <div className="text-[10px] text-rose-400 bg-rose-950/40 p-1 rounded border border-rose-900/60">
                                Flag Reason: {rev.moderationReason}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="p-3 align-top">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                (rev.status || 'published') === 'published'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : (rev.status || 'published') === 'flagged'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                                  : (rev.status || 'published') === 'hidden'
                                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {rev.status || 'published'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right space-y-1 align-top whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Approve Button */}
                              {(rev.status === 'flagged' ||
                                rev.status === 'pending_moderation' ||
                                rev.status === 'hidden' ||
                                rev.status === 'rejected') && (
                                <button
                                  onClick={() => moderateReview(rev.id, 'published')}
                                  title="Approve & Publish Review"
                                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Toggle Feature Button */}
                              <button
                                onClick={() =>
                                  moderateReview(rev.id, 'published', undefined, !rev.isFeatured)
                                }
                                title={rev.isFeatured ? 'Unfeature Review' : 'Spotlight & Feature Review'}
                                className={`p-1.5 rounded-lg transition-all ${
                                  rev.isFeatured
                                    ? 'bg-amber-500 text-slate-950 font-black'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                }`}
                              >
                                <Award className="w-3.5 h-3.5" />
                              </button>

                              {/* Hide Button */}
                              {rev.status !== 'hidden' && (
                                <button
                                  onClick={() => moderateReview(rev.id, 'hidden', 'Moderator hidden')}
                                  title="Hide from Public View"
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Flag Button */}
                              {rev.status !== 'flagged' && (
                                <button
                                  onClick={() =>
                                    moderateReview(rev.id, 'flagged', 'Flagged by Moderator')
                                  }
                                  title="Flag Review"
                                  className="p-1.5 bg-amber-950 text-amber-400 hover:bg-amber-900 rounded-lg transition-all"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete with High Risk Protection */}
                              <button
                                onClick={() => {
                                  triggerHighRiskAction(
                                    'Delete Customer Review',
                                    `Permanently delete review #${rev.id} from customer ${rev.customerName} for ${rev.businessName}`,
                                    'REVIEW_DELETE',
                                    () => deleteReview(rev.id, 'Administrator action')
                                  );
                                }}
                                title="Permanently Delete Review"
                                className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY & AUDIT */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="font-black text-sm text-white flex items-center gap-2">
                  <LockKeyhole className="w-4 h-4 text-rose-500" /> Immutable Platform Audit Log
                </h2>
                <p className="text-xs text-slate-400">
                  All administrative operations are permanently logged and non-deletable.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Filter logs..."
                  className="pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Actor / Role</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Details & Parameters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-500">
                          No audit log records found.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono text-[11px] text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded-md font-bold text-[10px]">
                              {log.actorRole}
                            </span>
                          </td>
                          <td className="p-3 font-extrabold text-white">{log.action}</td>
                          <td className="p-3 text-slate-300">{log.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FINANCE */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            {/* Commission Settings Box */}
            <div className="bg-slate-900 border border-indigo-900/50 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <Percent className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Platform Commission Configuration</h3>
                  <p className="text-xs text-slate-400">
                    Default percentage automatically charged on all deal & voucher sales (e.g. 2.0%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 max-w-md">
                <span className="text-xs font-bold text-slate-300">Default Rate:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={newCommissionPercent}
                  onChange={(e) => setNewCommissionPercent(e.target.value)}
                  className="w-20 px-3 py-1.5 text-xs font-bold bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-xs font-bold text-slate-300">%</span>

                <button
                  onClick={handleUpdateCommission}
                  className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all"
                >
                  Save & Update Rate
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 font-extrabold text-xs text-white">
                Platform Orders & 2% Commission Breakdown
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Order #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Business</th>
                      <th className="p-3">Gross Subtotal</th>
                      <th className="p-3">2% Platform Fee</th>
                      <th className="p-3">Seller Net</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-indigo-400">{ord.orderNumber}</td>
                        <td className="p-3">{ord.customerName}</td>
                        <td className="p-3 font-bold">{ord.businessName}</td>
                        <td className="p-3 font-extrabold text-white">{formatPrice(ord.subtotal)}</td>
                        <td className="p-3 font-extrabold text-amber-400">
                          {formatPrice(ord.platformCommissionAmount)}
                        </td>
                        <td className="p-3 font-extrabold text-emerald-400">
                          {formatPrice(ord.sellerGrossSettlement)}
                        </td>
                        <td className="p-3">
                          <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MARKETPLACE & DEALERS */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 font-extrabold text-xs text-white">
                Dealer Stores & Verification Management
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Business Name</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Verification</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {businesses.map((biz) => (
                      <tr key={biz.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <img src={biz.logo} alt={biz.name} className="w-6 h-6 rounded-md object-cover" />
                          {biz.name}
                        </td>
                        <td className="p-3">{biz.location.city}</td>
                        <td className="p-3 uppercase font-bold text-amber-400">{biz.planId}</td>
                        <td className="p-3 font-bold text-amber-400">★ {biz.rating}</td>
                        <td className="p-3">
                          {biz.isVerified ? (
                            <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Verified
                            </span>
                          ) : (
                            <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              triggerHighRiskAction(
                                'Toggle Business Verification',
                                `Change verification status for ${biz.name}`,
                                'VERIFY_BUSINESS',
                                () => verifyBusiness(biz.id)
                              );
                            }}
                            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-slate-200 font-bold"
                          >
                            {biz.isVerified ? 'Revoke Verification' : 'Approve & Verify'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SPONSORSHIPS */}
        {activeTab === 'sponsorships' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-extrabold text-sm text-white mb-2">Campaign & Sponsorship Overview</h3>
              <p className="text-xs text-slate-400">
                Track active sponsor placements, hero spotlight promotions, and budget utilization.
              </p>
            </div>
          </div>
        )}

        {/* TAB 6: SUPPORT & CHAT MODERATION QUEUE */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Controlled Chat Moderation Queue
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Administrators DO NOT have unrestricted access to private customer-dealer chats. Accessing a
                  reported chat requires entering a logged justification reason.
                </p>
              </div>

              <div className="divide-y divide-slate-800">
                {moderationRequests.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No pending chat moderation requests.
                  </div>
                ) : (
                  moderationRequests.map((req) => (
                    <div
                      key={req.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            REPORTED
                          </span>
                          <span className="font-mono text-xs text-slate-300">Conv ID: {req.conversationId}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Reason: "{req.reason}"</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Reported on {new Date(req.timestamp).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedChatForReview(req.conversationId);
                          setShowChatAccessModal(true);
                        }}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all self-start md:self-auto"
                      >
                        Request Justified Access
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reviewed Messages Viewer Box */}
            {selectedChatForReview && chatMessagesToReview.length > 0 && (
              <div className="bg-slate-900 border border-amber-900/60 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-xs text-amber-400 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Moderation Transcript Review (Audited Access)
                  </h4>
                  <button
                    onClick={() => setSelectedChatForReview(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close Review
                  </button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto p-2 bg-slate-950 rounded-xl">
                  {chatMessagesToReview.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 bg-slate-900 rounded-lg text-xs space-y-1 border border-slate-800"
                    >
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-indigo-400">{m.senderName}</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-200">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Justification Modal */}
      {showChatAccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" /> Mandatory Access Justification
            </h3>
            <p className="text-xs text-slate-400">
              State the official investigation reason for reviewing this private conversation. This justification
              will be permanently written to the security audit trail.
            </p>

            <textarea
              value={chatJustificationReason}
              onChange={(e) => setChatJustificationReason(e.target.value)}
              placeholder="e.g. Fraud Investigation #4092 - Dispute review request..."
              rows={3}
              className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowChatAccessModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestChatAccess(selectedChatForReview!)}
                disabled={!chatJustificationReason.trim()}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl"
              >
                Confirm & Log Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High Risk Action Confirmation Modal */}
      {showHighRiskModal && pendingHighRiskAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/60 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-extrabold text-sm text-white">{pendingHighRiskAction.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {pendingHighRiskAction.description}
            </p>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">
                Re-authenticate Admin Passcode:
              </label>
              <input
                type="password"
                value={adminPasswordConfirm}
                onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                placeholder="Type admin passcode to confirm..."
                className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowHighRiskModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHighRisk}
                disabled={!adminPasswordConfirm}
                className="px-5 py-2.5 text-xs font-extrabold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl shadow-lg"
              >
                Confirm High-Risk Operation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
