import {
  Business,
  Category,
  Deal,
  Order,
  ProductServiceItem,
  Campaign,
  Review,
  SystemConfig,
  User,
  Booking,
  Conversation,
  ChatMessage,
  ChatModerationRequest,
  AuditLog,
  SupportTicket,
  SupportMessage,
  KnowledgeBaseArticle,
  ManagerInvitation,
  AppUpdate,
} from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<{ success: boolean; data?: T; message?: string; total?: number; conversation?: Conversation }> {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${url}:`, error);
    return { success: false, message: 'Network or server error' };
  }
}

export const api = {
  // Config
  getSystemConfig: () => fetchJson<SystemConfig>('/api/v1/system/config'),
  updateSystemConfig: (data: Partial<SystemConfig>) =>
    fetchJson<SystemConfig>('/api/v1/system/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Categories
  getCategories: () => fetchJson<Category[]>('/api/v1/categories'),
  createCategory: (data: any) =>
    fetchJson<Category>('/api/v1/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Businesses
  getBusinesses: (params?: { category?: string; city?: string; search?: string; verified?: boolean; featured?: boolean }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<Business[]>(`/api/v1/businesses?${query}`);
  },
  getBusinessById: (id: string) => fetchJson<Business & { deals: Deal[]; productsAndServices: ProductServiceItem[]; reviews: Review[] }>(`/api/v1/businesses/${id}`),
  createBusiness: (data: Partial<Business>) =>
    fetchJson<Business>('/api/v1/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyBusiness: (id: string, isVerified: boolean) =>
    fetchJson<Business>(`/api/v1/businesses/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ isVerified }),
    }),

  // Deals
  getDeals: (params?: { category?: string; isFlash?: boolean; isSponsored?: boolean; city?: string; search?: string; dealType?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<Deal[]>(`/api/v1/deals?${query}`);
  },
  createDeal: (data: any) =>
    fetchJson<Deal>('/api/v1/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  trackDealClick: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/v1/deals/${id}/track-click`, {
      method: 'POST',
    }),

  // Products & Services
  getProductsAndServices: (params?: { type?: string; businessId?: string; category?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<ProductServiceItem[]>(`/api/v1/products-services?${query}`);
  },
  createProductOrService: (data: any) =>
    fetchJson<ProductServiceItem>('/api/v1/products-services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Orders
  getOrders: (params?: { customerId?: string; businessId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<Order[]>(`/api/v1/orders?${query}`);
  },
  createOrder: (data: any) =>
    fetchJson<Order>('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateOrderStatus: (id: string, status: string) =>
    fetchJson<Order>(`/api/v1/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Bookings
  getBookings: () => fetchJson<Booking[]>('/api/v1/bookings'),

  // Campaigns & Sponsors
  getCampaigns: (params?: { sponsorId?: string; type?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<Campaign[]>(`/api/v1/campaigns?${query}`);
  },
  createCampaign: (data: any) =>
    fetchJson<Campaign>('/api/v1/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  trackCampaignAction: (id: string, action: 'impression' | 'click') =>
    fetchJson<{ success: boolean }>(`/api/v1/campaigns/${id}/track`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  // Reviews & Rating System
  getReviews: (params?: {
    businessId?: string;
    dealId?: string;
    productId?: string;
    serviceId?: string;
    customerId?: string;
    status?: string;
    minRating?: number;
    onlyVerified?: boolean;
    itemType?: string;
    sortBy?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<Review[]>(`/api/v1/reviews${qStr}`);
  },
  getReviewStats: (params?: { businessId?: string; dealId?: string; productId?: string; serviceId?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.append(key, String(val));
      });
    }
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<any>(`/api/v1/reviews/stats${qStr}`);
  },
  createReview: (data: Partial<Review>) =>
    fetchJson<Review>('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  replyToReview: (id: string, data: { sellerReply: string; sellerRepliedBy?: string; actorId?: string }) =>
    fetchJson<Review>(`/api/v1/reviews/${id}/reply`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  voteHelpfulReview: (id: string, userId?: string) =>
    fetchJson<{ success: boolean; helpfulCount: number; isHelpfulByUser: boolean }>(`/api/v1/reviews/${id}/helpful`, {
      method: 'PUT',
      body: JSON.stringify({ userId }),
    }),
  reportReview: (id: string, data: { reportedByUserId?: string; reason: string }) =>
    fetchJson<{ message: string }>(`/api/v1/reviews/${id}/report`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  moderateReview: (id: string, data: { status: string; moderationReason?: string; isFeatured?: boolean; adminId?: string }) =>
    fetchJson<Review>(`/api/v1/admin/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteReview: (id: string, data?: { adminId?: string; reason?: string }) =>
    fetchJson<{ message: string }>(`/api/v1/admin/reviews/${id}`, {
      method: 'DELETE',
      body: JSON.stringify(data || {}),
    }),

  // Platform Analytics
  getPlatformAnalytics: () => fetchJson<any>('/api/v1/analytics/platform'),

  // Direct Verified Dealer & Client Communication
  getConversations: (userId: string) => fetchJson<Conversation[]>(`/api/v1/chat/conversations?userId=${userId}`),
  startChat: (data: { customerId: string; customerName: string; customerAvatar?: string; businessId: string; referencedDealId?: string }) =>
    fetchJson<Conversation>('/api/v1/chat/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getChatMessages: (conversationId: string, userId: string, adminModerationJustification?: string) => {
    let url = `/api/v1/chat/messages/${conversationId}?userId=${userId}`;
    if (adminModerationJustification) {
      url += `&adminModerationJustification=${encodeURIComponent(adminModerationJustification)}`;
    }
    return fetchJson<ChatMessage[]>(url);
  },
  sendChatMessage: (data: Partial<ChatMessage>) =>
    fetchJson<ChatMessage>('/api/v1/chat/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  reportChat: (conversationId: string, reportedByUserId: string, reason: string) =>
    fetchJson<{ message: string }>('/api/v1/chat/report', {
      method: 'POST',
      body: JSON.stringify({ conversationId, reportedByUserId, reason }),
    }),
  toggleBlockChat: (conversationId: string, userId: string) =>
    fetchJson<{ isBlocked: boolean }>('/api/v1/chat/block', {
      method: 'POST',
      body: JSON.stringify({ conversationId, userId }),
    }),

  // Admin Audit & Security
  getAuditLogs: () => fetchJson<AuditLog[]>('/api/v1/admin/audit-logs'),
  createAuditLog: (data: { actorId: string; actorRole: string; action: string; details: string }) =>
    fetchJson<{ message: string }>('/api/v1/admin/audit-log', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getChatModerationRequests: () => fetchJson<ChatModerationRequest[]>('/api/v1/admin/chat/moderation-requests'),
  approveChatModerationAccess: (requestId: string, adminId: string, justification: string) =>
    fetchJson<ChatModerationRequest>('/api/v1/admin/chat/approve-access', {
      method: 'POST',
      body: JSON.stringify({ requestId, adminId, justification }),
    }),

  // Phase 3: Zero-Budget AI Customer Support
  queryAISupport: (prompt: string, userContext?: any) =>
    fetchJson<{ provider: string; reply: string; shouldEscalate: boolean }>('/api/v1/ai/support', {
      method: 'POST',
      body: JSON.stringify({ prompt, userContext }),
    }),

  // Phase 3: Support Tickets
  getSupportTickets: (params?: { userId?: string; status?: string; assignedStaffId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<SupportTicket[]>(`/api/v1/support/tickets?${query}`);
  },
  createSupportTicket: (data: any) =>
    fetchJson<SupportTicket>('/api/v1/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSupportTicketById: (id: string) => fetchJson<SupportTicket>(`/api/v1/support/tickets/${id}`),
  sendSupportMessage: (ticketId: string, data: any) =>
    fetchJson<SupportMessage>(`/api/v1/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTicketStatus: (ticketId: string, data: any) =>
    fetchJson<SupportTicket>(`/api/v1/support/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Phase 3: Knowledge Base
  getKnowledgeBase: () => fetchJson<KnowledgeBaseArticle[]>('/api/v1/knowledge-base'),
  createKnowledgeBaseArticle: (data: any) =>
    fetchJson<KnowledgeBaseArticle>('/api/v1/knowledge-base', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateKnowledgeBaseArticle: (id: string, data: any) =>
    fetchJson<KnowledgeBaseArticle>(`/api/v1/knowledge-base/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteKnowledgeBaseArticle: (id: string) =>
    fetchJson<{ message: string }>(`/api/v1/knowledge-base/${id}`, {
      method: 'DELETE',
    }),

  // Phase 3: Manager Invitations & Owner Control
  getManagerInvitations: () => fetchJson<ManagerInvitation[]>('/api/v1/managers/invitations'),
  createManagerInvitation: (data: any) =>
    fetchJson<ManagerInvitation>('/api/v1/managers/invitation', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  acceptManagerInvitation: (data: any) =>
    fetchJson<User>('/api/v1/managers/accept-invitation', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  revokeManagerInvitation: (id: string, actorId: string) =>
    fetchJson<ManagerInvitation>(`/api/v1/managers/invitation/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'revoked', actorId }),
    }),

  // Phase 3: App Updates Center
  getAppUpdates: () => fetchJson<AppUpdate[]>('/api/v1/app-updates'),
  publishAppUpdate: (data: any) =>
    fetchJson<AppUpdate>('/api/v1/app-updates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
