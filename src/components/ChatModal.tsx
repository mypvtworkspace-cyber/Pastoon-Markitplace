import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  Paperclip,
  Search,
  ShieldAlert,
  Lock,
  MoreVertical,
  CheckCheck,
  Tag,
  ShoppingBag,
  Clock,
  UserCheck,
  AlertCircle,
  Flag,
  Ban,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Conversation, ChatMessage, Deal, ProductServiceItem } from '../types';
import { api } from '../lib/api';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBusinessId?: string;
  initialDealId?: string;
  initialProductId?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  targetBusinessId,
  initialDealId,
  initialProductId,
}) => {
  const { user, deals, productsAndServices, formatPrice } = useApp();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations list
  useEffect(() => {
    if (!isOpen || !user) return;

    async function loadConversations() {
      setLoading(true);
      if (targetBusinessId) {
        // Start or retrieve conversation with target business
        const startRes = await api.startChat({
          customerId: user.id,
          customerName: user.name,
          customerAvatar: user.avatar,
          businessId: targetBusinessId,
          referencedDealId: initialDealId,
        });

        if (startRes.success && startRes.data) {
          setActiveConv(startRes.data);
        }
      }

      const res = await api.getConversations(user.id);
      if (res.success && res.data) {
        const convList = Array.isArray(res.data) ? res.data : [];
        setConversations(convList);
        if (!targetBusinessId && convList.length > 0 && !activeConv) {
          setActiveConv(convList[0]);
        }
      }
      setLoading(false);
    }

    loadConversations();
  }, [isOpen, targetBusinessId, user]);

  // Load messages for active conversation with real-time polling
  useEffect(() => {
    if (!activeConv || !user) return;

    async function fetchMessages() {
      const res = await api.getChatMessages(activeConv.id, user.id);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // 3s real-time poll fallback
    return () => clearInterval(interval);
  }, [activeConv, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessageText.trim() && !attachmentUrl) || !activeConv || !user) return;

    const res = await api.sendChatMessage({
      conversationId: activeConv.id,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text: newMessageText,
      attachmentUrl: attachmentUrl || undefined,
      referencedDealId: initialDealId || undefined,
      referencedProductId: initialProductId || undefined,
    });

    if (res.success && res.data) {
      setMessages((prev) => [...prev, res.data!]);
      setNewMessageText('');
      setAttachmentUrl('');
      setShowAttachmentInput(false);

      // Refresh conversations list summary
      const updatedConvs = await api.getConversations(user.id);
      if (updatedConvs.data) setConversations(updatedConvs.data);
    }
  };

  const handleReport = async () => {
    if (!activeConv || !user || !reportReason) return;
    await api.reportChat(activeConv.id, user.id, reportReason);
    setShowReportModal(false);
    setReportReason('');
    alert('Conversation reported to moderators. Thank you for keeping DealHub safe.');
  };

  const handleToggleBlock = async () => {
    if (!activeConv || !user) return;
    const res = await api.toggleBlockChat(activeConv.id, user.id);
    if (res.success) {
      const isNowBlocked = (res as any).isBlocked ?? !activeConv.isBlocked;
      setActiveConv((prev) => prev ? { ...prev, isBlocked: isNowBlocked } : null);
    }
  };

  const filteredMessages = (messages || []).filter((m) =>
    m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const referencedDeal: Deal | undefined = initialDealId
    ? (deals || []).find((d) => d.id === initialDealId)
    : undefined;

  const referencedProduct: ProductServiceItem | undefined = initialProductId
    ? (productsAndServices || []).find((p) => p.id === initialProductId)
    : undefined;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Conversation List */}
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/40">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Direct Dealer Inquiries</h3>
            </div>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-black border border-emerald-300/30 uppercase tracking-wider">
              Verified Direct
            </span>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading && (conversations || []).length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading chats...</div>
            ) : (conversations || []).length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
                <p>No active conversations yet.</p>
                <p className="text-[10px] text-slate-400">Click "Chat with Dealer" on any business store to start.</p>
              </div>
            ) : (
              (conversations || []).map((conv) => {
                const isActive = activeConv?.id === conv.id;
                const isDealerView = user?.id === conv.dealerOwnerId;
                const partnerName = isDealerView ? conv.customerName : conv.businessName;
                const partnerLogo = isDealerView ? conv.customerAvatar : conv.businessLogo;
                const unread = isDealerView ? conv.unreadCountDealer : conv.unreadCountCustomer;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={partnerLogo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={partnerName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                          {partnerName}
                        </h4>
                        <span className={`text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {conv.lastMessageText}
                      </p>
                    </div>

                    {unread > 0 && !isActive && (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Main View */}
        {activeConv ? (
          <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <img
                  src={
                    user?.id === activeConv.dealerOwnerId
                      ? activeConv.customerAvatar
                      : activeConv.businessLogo
                  }
                  alt={activeConv.businessName}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-200 dark:border-indigo-900"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                      {user?.id === activeConv.dealerOwnerId
                        ? activeConv.customerName
                        : activeConv.businessName}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Lock className="w-3 h-3 text-emerald-500" /> Private Direct Channel • Verified Dealer
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                {/* Search in chat */}
                <div className="relative hidden sm:block">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
                  />
                </div>

                <button
                  onClick={() => setShowReportModal(true)}
                  title="Report Conversation"
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-amber-500 transition-all"
                >
                  <Flag className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleBlock}
                  title={activeConv.isBlocked ? 'Unblock Dealer' : 'Block Dealer'}
                  className={`p-2 rounded-xl transition-all ${
                    activeConv.isBlocked
                      ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Optional Item Header Banner */}
            {(referencedDeal || referencedProduct) && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-b border-indigo-100 dark:border-indigo-900/50 p-2.5 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-extrabold uppercase tracking-wider block">
                      Referenced Listing
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {referencedDeal?.title || referencedProduct?.title}
                    </span>
                  </div>
                </div>
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {formatPrice(referencedDeal?.discountedPrice || referencedProduct?.price || 0)}
                </div>
              </div>
            )}

            {/* Messages Scroll View */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/10">
              {(filteredMessages || []).length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                  <ShieldAlert className="w-8 h-8 mx-auto text-indigo-400 stroke-1" />
                  <p>No messages yet. Send a inquiry to discuss custom deals or orders!</p>
                  <p className="text-[10px] text-slate-400">
                    Always keep communications inside DealHub to protect your vouchers & purchases.
                  </p>
                </div>
              ) : (
                (filteredMessages || []).map((msg) => {
                  const isMe = msg.senderId === user?.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {msg.senderAvatar && (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-1"
                        />
                      )}
                      <div>
                        <div
                          className={`p-3 rounded-2xl text-xs space-y-1.5 shadow-xs ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-bl-none'
                          }`}
                        >
                          <div className="flex justify-between items-baseline gap-2">
                            <span className={`font-bold text-[10px] ${isMe ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`}>
                              {msg.senderName}
                            </span>
                            <span className={`text-[9px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                          {msg.attachmentUrl && (
                            <div className="pt-1">
                              <img
                                src={msg.attachmentUrl}
                                alt="Attachment"
                                className="max-w-xs rounded-xl border border-white/20 max-h-48 object-cover"
                              />
                            </div>
                          )}
                        </div>

                        <div className={`text-[9px] text-slate-400 mt-1 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {isMe && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Blocked Alert */}
            {activeConv.isBlocked && (
              <div className="bg-rose-50 dark:bg-rose-950/60 p-3 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
                <span className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4" /> This conversation is currently blocked.
                </span>
                <button
                  onClick={handleToggleBlock}
                  className="font-bold underline hover:text-rose-900 dark:hover:text-rose-100"
                >
                  Unblock Chat
                </button>
              </div>
            )}

            {/* Input Bar */}
            {!activeConv.isBlocked && (
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                {showAttachmentInput && (
                  <div className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
                    <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="url"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="Paste image attachment URL..."
                      className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 border-none focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAttachmentInput(false)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    title="Attach Image URL"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="Type message to dealer..."
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={!newMessageText.trim() && !attachmentUrl}
                    className="bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 disabled:opacity-40 text-white p-2.5 sm:px-5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-700 mb-3" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Select a Conversation</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Choose an existing chat from the left panel or click "Chat with Dealer" on any business store page.
            </p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-500" /> Report Chat to Moderation
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please specify the reason for reporting this chat. An administrator with Moderation authorization will review the conversation logs under strict privacy audit rules.
            </p>

            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="e.g. Fraud attempt, harassment, off-platform payment request..."
              rows={3}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim()}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl shadow-md"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
