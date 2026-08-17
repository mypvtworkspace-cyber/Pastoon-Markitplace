import React, { useState, useEffect, useRef } from 'react';
import { Bot, Headphones, Send, X, Ticket, HelpCircle, ShieldAlert, Sparkles, RefreshCw, MessageSquare, ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { SupportTicketCategory } from '../types';

interface AIMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  shouldEscalate?: boolean;
  timestamp: string;
  provider?: string;
}

export const AISupportDrawer: React.FC = () => {
  const { currentUser, isAISupportOpen, setIsAISupportOpen, setIsSupportTicketModalOpen, showToast } = useApp();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init_1',
      sender: 'ai',
      text: `Hello ${currentUser.name}! Welcome to **DealHub Customer Support**. How can I help you today?

You can ask me about:
• How to redeem deal voucher QR codes
• 2% Platform Commission & Seller Payouts
• Service Booking cancellation policy
• Business verification & trust badges`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEscalationForm, setShowEscalationForm] = useState(false);

  // Ticket Escalation Form state
  const [ticketCategory, setTicketCategory] = useState<SupportTicketCategory>('order');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isAISupportOpen) return null;

  const handleSend = async (queryText?: string) => {
    const promptText = queryText || input.trim();
    if (!promptText || loading) return;

    const userMsg: AIMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.queryAISupport(promptText, {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
      });

      if (res.success && res.data) {
        const aiMsg: AIMessage = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: res.data.reply,
          shouldEscalate: res.data.shouldEscalate,
          provider: res.data.provider,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (res.data.shouldEscalate && !showEscalationForm) {
          setTicketSubject(`Escalated Support: ${promptText.substring(0, 40)}...`);
          setTicketDescription(promptText);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_err_${Date.now()}`,
            sender: 'ai',
            text: 'I am experiencing a temporary connection issue. Would you like to create an official Human Support Ticket for direct staff assistance?',
            shouldEscalate: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    setCreatingTicket(true);
    try {
      const res = await api.createSupportTicket({
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        category: ticketCategory,
        subject: ticketSubject,
        description: ticketDescription,
        priority: ticketCategory === 'refund' || ticketCategory === 'security' ? 'high' : 'medium',
      });

      if (res.success && res.data) {
        showToast(`Support Ticket #${res.data.ticketNumber} created successfully!`);
        setShowEscalationForm(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `sys_${Date.now()}`,
            sender: 'system',
            text: `✅ **Human Support Ticket Created (#${res.data.ticketNumber})**. Assigned to DealHub Support Team. You will receive live status updates.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      showToast('Failed to create support ticket');
    } finally {
      setCreatingTicket(false);
    }
  };

  const quickQuestions = [
    'How do I redeem a deal voucher?',
    'What is the 2% commission policy?',
    'How do I cancel a service booking?',
    'How do I get my business verified?',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">DealHub Customer Support</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  24/7 Support
                </span>
              </div>
              <p className="text-xs text-slate-400">24/7 Universal Marketplace & Knowledge Base</p>
            </div>
          </div>
          <button
            onClick={() => setIsAISupportOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tabs & Escalation Navigation */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Free AI Provider Abstraction
          </span>
          <button
            onClick={() => {
              setIsAISupportOpen(false);
              setIsSupportTicketModalOpen(true);
            }}
            className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
          >
            <Ticket className="w-3.5 h-3.5" /> View My Support Tickets
          </button>
        </div>

        {/* Chat Messages / Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : msg.sender === 'system' ? 'items-center' : 'items-start'
              }`}
            >
              {msg.sender === 'system' ? (
                <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-2 rounded-lg max-w-sm text-center">
                  {msg.text}
                </div>
              ) : (
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                  
                  {msg.provider && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Engine: {msg.provider === 'free_gemini' ? 'Gemini 3.6 Flash' : 'Knowledge Base Fallback'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}

                  {msg.shouldEscalate && !showEscalationForm && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
                      <p className="font-semibold flex items-center gap-1 mb-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-400" /> Need direct human assistance?
                      </p>
                      <p className="text-[11px] text-slate-300 mb-2">
                        Financial refunds, payout changes, or complex account disputes require human staff verification.
                      </p>
                      <button
                        onClick={() => setShowEscalationForm(true)}
                        className="w-full py-1.5 px-3 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 transition flex items-center justify-center gap-1.5 text-xs shadow-sm"
                      >
                        <Ticket className="w-3.5 h-3.5" /> Convert to Human Support Ticket
                      </button>
                    </div>
                  )}
                </div>
              )}
              <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 w-fit animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>DealHub AI is searching Knowledge Base...</span>
            </div>
          )}

          {/* Quick FAQ Prompts */}
          {!loading && messages.length <= 3 && !showEscalationForm && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Suggested Questions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Escalation Form Modal inside Drawer */}
        {showEscalationForm && (
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-400" /> Create Human Support Ticket
              </h4>
              <button
                onClick={() => setShowEscalationForm(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as SupportTicketCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="order">Order & Voucher Issue</option>
                  <option value="refund">Refund Request</option>
                  <option value="payment">Payment & Commission</option>
                  <option value="booking">Service Booking Slot</option>
                  <option value="business">Business Verification</option>
                  <option value="deal">Deal Details</option>
                  <option value="security">Security & Account</option>
                  <option value="other">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Brief summary of issue..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Explanation</label>
                <textarea
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  rows={3}
                  placeholder="Provide order numbers, date, or specific questions for staff..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={creatingTicket}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                {creatingTicket ? 'Submitting Ticket...' : 'Submit to Staff / Manager'}
              </button>
            </form>
          </div>
        )}

        {/* Input Footer */}
        {!showEscalationForm && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask DealHub AI anything..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
