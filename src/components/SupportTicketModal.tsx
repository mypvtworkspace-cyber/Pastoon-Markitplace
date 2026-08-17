import React, { useState, useEffect } from 'react';
import { X, Ticket, MessageSquare, ShieldCheck, Clock, UserCheck, AlertCircle, Send, CheckCircle2, Filter, Search, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { SupportTicket, SupportMessage, SupportTicketStatus, SupportTicketPriority } from '../types';

export const SupportTicketModal: React.FC = () => {
  const { currentUser, isSupportTicketModalOpen, setIsSupportTicketModalOpen, showToast } = useApp();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const isStaffOrAbove = ['staff', 'manager', 'deal_manager', 'payment_manager', 'owner', 'super_admin', 'admin'].includes(currentUser.role);

  useEffect(() => {
    if (isSupportTicketModalOpen) {
      loadTickets();
    }
  }, [isSupportTicketModalOpen, filterStatus]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (!isStaffOrAbove) {
        params.userId = currentUser.id;
      }
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const res = await api.getSupportTickets(params);
      if (res.success && res.data) {
        setTickets(res.data);
        if (res.data.length > 0 && !selectedTicket) {
          setSelectedTicket(res.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupportTicketModalOpen) return null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      const res = await api.sendSupportMessage(selectedTicket.id, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role === 'customer' ? 'user' : currentUser.role,
        message: replyText,
      });

      if (res.success && res.data) {
        setReplyText('');
        showToast('Reply sent successfully!');
        // Refresh ticket
        const updatedRes = await api.getSupportTicketById(selectedTicket.id);
        if (updatedRes.success && updatedRes.data) {
          setSelectedTicket(updatedRes.data);
        }
        loadTickets();
      }
    } catch (err) {
      showToast('Failed to send reply');
    }
  };

  const handleUpdateStatus = async (status: SupportTicketStatus) => {
    if (!selectedTicket) return;

    try {
      const res = await api.updateTicketStatus(selectedTicket.id, {
        status,
        actorId: currentUser.id,
        actorRole: currentUser.role,
        assignedStaffId: currentUser.role === 'staff' ? currentUser.id : undefined,
        assignedStaffName: currentUser.role === 'staff' ? currentUser.name : undefined,
      });

      if (res.success && res.data) {
        showToast(`Ticket #${selectedTicket.ticketNumber} updated to ${status.toUpperCase()}`);
        setSelectedTicket(res.data);
        loadTickets();
      }
    } catch (err) {
      showToast('Failed to update ticket status');
    }
  };

  const filteredTickets = (tickets || []).filter(
    (t) =>
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-lg">Support Ticket Center</h3>
                {isStaffOrAbove && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {currentUser.role.toUpperCase()} PORTAL
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Escalations, Staff Responses & Audit History</p>
            </div>
          </div>
          <button
            onClick={() => setIsSupportTicketModalOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Ticket List Sidebar */}
          <div className="md:col-span-5 lg:col-span-4 border-r border-slate-800 flex flex-col bg-slate-950/60 overflow-hidden">
            <div className="p-3 border-b border-slate-800 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search ticket # or subject..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-1 overflow-x-auto text-[11px] no-scrollbar">
                {['all', 'open', 'in_progress', 'resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                      filterStatus === st
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No support tickets found.
                </div>
              ) : (
                filteredTickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full p-3.5 text-left transition flex flex-col space-y-1.5 ${
                      selectedTicket?.id === t.id ? 'bg-amber-500/10 border-l-4 border-amber-500' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400 font-mono">{t.ticketNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                        t.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
                        t.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-white line-clamp-1">{t.subject}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{t.userName}</span>
                      <span className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Ticket Details & Chat Panel */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col bg-slate-900 overflow-hidden">
            {selectedTicket ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Ticket Summary Header */}
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-mono font-bold text-amber-400">{selectedTicket.ticketNumber}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-medium">
                        Category: {selectedTicket.category.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        selectedTicket.priority === 'high' || selectedTicket.priority === 'urgent'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        Priority: {selectedTicket.priority.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-white">{selectedTicket.subject}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submitted by: <strong className="text-slate-200">{selectedTicket.userName}</strong> ({selectedTicket.userEmail})
                    </p>
                  </div>

                  {/* Action Buttons for Staff/Managers */}
                  {isStaffOrAbove && (
                    <div className="flex items-center space-x-2">
                      {selectedTicket.status !== 'in_progress' && (
                        <button
                          onClick={() => handleUpdateStatus('in_progress')}
                          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-lg transition"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {selectedTicket.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus('resolved')}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-lg transition"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Ticket Message History */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.senderRole === 'user' ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1 text-[11px] text-slate-400">
                        <span className="font-bold text-slate-200">{m.senderName}</span>
                        <span className="uppercase text-[9px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-400">
                          {m.senderRole}
                        </span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          m.senderRole === 'user'
                            ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                            : m.senderRole === 'ai'
                            ? 'bg-amber-950/40 border border-amber-500/30 text-amber-200 rounded-tr-none'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  ))}

                  {/* Audit History Log Block */}
                  {selectedTicket.auditHistory && selectedTicket.auditHistory.length > 0 && (
                    <div className="mt-6 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px]">
                      <p className="font-bold text-slate-400 mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Ticket Audit Trail:
                      </p>
                      <ul className="space-y-1 text-slate-500 font-mono">
                        {selectedTicket.auditHistory.map((log, idx) => (
                          <li key={idx}>• {log}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a reply to customer or staff..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 disabled:opacity-50 transition flex items-center gap-1.5 text-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Reply
                  </button>
                </form>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Ticket className="w-12 h-12 mb-3 text-slate-700" />
                <p className="text-sm">Select a support ticket to view discussion and staff resolution details.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
