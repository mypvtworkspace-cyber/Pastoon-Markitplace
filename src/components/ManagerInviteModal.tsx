import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield, Copy, Check, Lock, Key, Mail, Clock, RefreshCw, Sparkles, UserCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { ManagerInvitation, UserRole } from '../types';

export const ManagerInviteModal: React.FC = () => {
  const { currentUser, isManagerInviteModalOpen, setIsManagerInviteModalOpen, showToast } = useApp();
  const [invitations, setInvitations] = useState<ManagerInvitation[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'test_accept'>('create');

  // Form State
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [department, setDepartment] = useState('Operations');
  const [scopes, setScopes] = useState<string[]>(['support_management', 'dealer_approvals']);
  const [creating, setCreating] = useState(false);
  const [lastCreatedInvite, setLastCreatedInvite] = useState<ManagerInvitation | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Accept Tester State
  const [testToken, setTestToken] = useState('');
  const [testName, setTestName] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [accepting, setAccepting] = useState(false);

  const availableScopes = [
    { id: 'support_management', label: 'Support & AI Tickets' },
    { id: 'dealer_approvals', label: 'Dealer Verification & Approvals' },
    { id: 'content_moderation', label: 'Chat & Deals Moderation' },
    { id: 'refund_processing', label: 'Payment Review & Refunds' },
    { id: 'sponsorship_management', label: 'Sponsorships & Banners' },
  ];

  useEffect(() => {
    if (isManagerInviteModalOpen) {
      loadInvitations();
    }
  }, [isManagerInviteModalOpen]);

  const loadInvitations = async () => {
    try {
      const res = await api.getManagerInvitations();
      if (res.success && res.data) {
        setInvitations(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isManagerInviteModalOpen) return null;

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setCreating(true);
    try {
      const res = await api.createManagerInvitation({
        email,
        role,
        department,
        scope: scopes,
        invitedBy: currentUser.id,
        invitedByName: currentUser.name,
      });

      if (res.success && res.data) {
        showToast(`Manager Invitation token generated for ${email}!`);
        setLastCreatedInvite(res.data);
        setEmail('');
        loadInvitations();
      }
    } catch (err) {
      showToast('Failed to generate manager invitation');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(true);
    showToast('Invitation token link copied to clipboard!');
    setTimeout(() => setCopiedToken(false), 3000);
  };

  const handleAcceptTester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testToken.trim() || !testPassword.trim()) return;

    setAccepting(true);
    try {
      const res = await api.acceptManagerInvitation({
        invitationToken: testToken,
        name: testName,
        password: testPassword,
      });

      if (res.success && res.data) {
        showToast(`Success! User account created with role: ${res.data.role.toUpperCase()}`);
        setTestToken('');
        setTestName('');
        setTestPassword('');
        setActiveTab('list');
        loadInvitations();
      } else {
        showToast(res.message || 'Failed to accept invitation token');
      }
    } catch (err) {
      showToast('Error validating invitation token');
    } finally {
      setAccepting(false);
    }
  };

  const toggleScope = (scopeId: string) => {
    setScopes((prev) => (prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Owner Role Control & Manager Invitations</h3>
              <p className="text-xs text-slate-400">Secure 5-Tier Role Provisioning with Token Generation</p>
            </div>
          </div>
          <button
            onClick={() => setIsManagerInviteModalOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'create'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Invite New Manager / Staff
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'list'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Active Tokens & Pending Invites ({invitations.length})
          </button>
          <button
            onClick={() => setActiveTab('test_accept')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'test_accept'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🧪 Token Acceptance Simulator
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          
          {activeTab === 'create' && (
            <form onSubmit={handleCreateInvite} className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-bold">Zero Permanent Shared Passwords</p>
                  <p className="text-slate-300">
                    The Owner generates a unique, single-use token link. Invited candidates set their OWN private password upon activation. The Owner never sees candidate passwords.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Candidate Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager.candidate@company.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role Tier</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="staff">Level 2: STAFF (Support & Basic Moderation)</option>
                    <option value="manager">Level 3: MANAGER (General Operations)</option>
                    <option value="deal_manager">Level 4: DEAL MANAGER (Deal Approvals)</option>
                    <option value="payment_manager">Level 4: PAYMENT MANAGER (Refunds & Payouts)</option>
                    <option value="owner">Level 5: OWNER (Platform Control)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Customer Success, Fraud Review, Merchant Operations"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Permission Scope Matrix</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableScopes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleScope(s.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                        scopes.includes(s.id)
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{s.label}</span>
                      {scopes.includes(s.id) && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
              >
                {creating ? 'Generating Token...' : 'Generate Manager Invitation Token'}
              </button>

              {lastCreatedInvite && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Invitation Token Generated!
                    </span>
                    <span className="font-mono text-[11px] text-amber-400">{lastCreatedInvite.invitationToken}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mb-3">
                    Share this copyable invitation link with <strong>{lastCreatedInvite.email}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(lastCreatedInvite.invitationToken)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    {copiedToken ? 'Copied to Clipboard!' : 'Copy Invitation Link'}
                  </button>
                </div>
              )}
            </form>
          )}

          {activeTab === 'list' && (
            <div className="space-y-3">
              {invitations.length === 0 ? (
                <p className="text-center text-slate-500 text-xs py-8">No manager invitations generated yet.</p>
              ) : (
                invitations.map((inv) => (
                  <div key={inv.id} className="p-3.5 bg-slate-800/80 border border-slate-700/70 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{inv.email}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {inv.role.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'pending' ? 'bg-blue-500/20 text-blue-400' :
                          inv.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Token: <span className="font-mono text-amber-400 font-bold">{inv.invitationToken}</span> • Dept: {inv.department}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyLink(inv.invitationToken)}
                        className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg text-[11px] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy Link
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'test_accept' && (
            <form onSubmit={handleAcceptTester} className="space-y-4">
              <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-xs text-blue-300">
                <p className="font-bold">Manager Token Acceptance Simulator</p>
                <p className="text-slate-300 mt-0.5">
                  Paste a generated invitation token (e.g. <strong>INV-DEALHUB-889021</strong>) to test setting candidate credentials and activating staff permissions.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Invitation Token</label>
                <input
                  type="text"
                  value={testToken}
                  onChange={(e) => setTestToken(e.target.value)}
                  placeholder="e.g. INV-DEALHUB-889021"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Candidate Name</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g., Hamza Operations Manager"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Private Password</label>
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={accepting}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
              >
                {accepting ? 'Activating Account...' : 'Activate Manager Account & Private Credentials'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
