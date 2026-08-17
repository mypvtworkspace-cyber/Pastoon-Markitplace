export type UserRole =
  | 'user'
  | 'customer'
  | 'seller'
  | 'sponsor'
  | 'staff'
  | 'manager'
  | 'deal_manager'
  | 'payment_manager'
  | 'owner'
  | 'admin'
  | 'super_admin'
  | 'finance_admin'
  | 'security_admin'
  | 'marketing_admin'
  | 'support_admin'
  | 'moderation_admin'
  | 'business_verification_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  location?: {
    country: string;
    city: string;
    area?: string;
  };
  createdAt: string;
}

export type SupportTicketCategory =
  | 'account'
  | 'product'
  | 'service'
  | 'deal'
  | 'order'
  | 'payment'
  | 'refund'
  | 'booking'
  | 'dealer'
  | 'business'
  | 'sponsorship'
  | 'technical'
  | 'security'
  | 'other';

export type SupportTicketStatus =
  | 'open'
  | 'ai_handling'
  | 'waiting_customer'
  | 'assigned'
  | 'in_progress'
  | 'escalated'
  | 'resolved'
  | 'closed';

export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'ai' | 'staff' | 'manager' | 'owner';
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: SupportTicketCategory;
  subject: string;
  description: string;
  attachments?: string[];
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedManagerId?: string;
  assignedManagerName?: string;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  aiHandled: boolean;
  messages: SupportMessage[];
  auditHistory: string[];
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  category: SupportTicketCategory;
  content: string;
  tags: string[];
  isPublished: boolean;
  lastUpdated: string;
  viewsCount: number;
}

export interface ManagerInvitation {
  id: string;
  email: string;
  role: UserRole;
  scope: string[];
  department?: string;
  invitationToken: string;
  invitedBy: string;
  invitedByName: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  lastLoginAt?: string;
}

export interface AppUpdate {
  id: string;
  version: string;
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'fix' | 'security' | 'announcement';
  releaseDate: string;
  importance: 'normal' | 'important' | 'critical';
  platform: 'all' | 'web' | 'android' | 'ios';
  changelog: string[];
  status: 'draft' | 'published';
  isCriticalUpdate?: boolean;
  publishedBy?: string;
}

export interface AppVersionInfo {
  currentVersion: string;
  minimumSupportedVersion: string;
  recommendedVersion: string;
  releaseNotesUrl?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  attachmentUrl?: string;
  referencedDealId?: string;
  referencedProductId?: string;
  referencedOrderId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  dealerOwnerId: string;
  lastMessageText: string;
  lastMessageTimestamp: string;
  unreadCountCustomer: number;
  unreadCountDealer: number;
  isBlocked?: boolean;
  blockedBy?: string;
  createdAt: string;
}

export interface ChatModerationRequest {
  id: string;
  conversationId: string;
  reportedByUserId: string;
  reason: string;
  status: 'pending_review' | 'approved_access' | 'rejected';
  reviewedByAdminId?: string;
  accessJustification?: string;
  timestamp: string;
}

export interface BusinessPlan {
  id: 'free' | 'professional' | 'business_pro';
  name: string;
  priceMonthly: number; // in base currency
  maxListings: number;
  maxDeals: number;
  commissionDiscountPercent: number; // e.g. 0% for free, 0.5% off for pro
  features: string[];
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  logo: string;
  coverImage: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  planId: 'free' | 'professional' | 'business_pro';
  location: {
    country: string;
    state: string;
    city: string;
    area: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
    whatsapp?: string;
  };
  openingHours: string; // e.g. "9:00 AM - 10:00 PM"
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  verificationDocUrl?: string;
  followersCount: number;
  featured: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // lucide icon name
  description: string;
  subcategories: Subcategory[];
  isDisabled?: boolean;
  displayOrder: number;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
}

export type ItemType = 'product' | 'service';

export interface ProductServiceItem {
  id: string;
  businessId: string;
  sellerName?: string;
  submittedByUserId?: string;
  contentOrigin?: ContentOrigin; // 'business' | 'organic_user'
  status?: 'published' | 'under_review' | 'rejected';
  title: string;
  description: string;
  type: ItemType;
  price: number; // original base price
  categoryId: string;
  subcategoryId: string;
  images: string[];
  inStock?: boolean;
  stockQuantity?: number;
  serviceDurationMinutes?: number; // for services
  availableDays?: string[]; // e.g. ["Mon", "Tue", "Wed"]
  timeSlots?: string[]; // e.g. ["10:00 AM", "02:00 PM", "05:00 PM"]
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Deal {
  id: string;
  businessId: string;
  sellerName?: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  dealType: 'physical_product' | 'digital_service';
  contentOrigin?: ContentOrigin; // 'business' | 'organic_user'
  isFlashDeal: boolean;
  isVerified?: boolean; // verified deals get 2% commission, unverified get 6%
  commissionRate?: number; // calculated server side (0.02 or 0.06)
  status?: DealStatus;
  qualityScore?: number; // 0 to 100
  submittedByUserId?: string;
  startDate: string;
  endDate: string; // Expiry ISO date string
  totalQuantity: number;
  remainingQuantity: number;
  maxPerCustomer: number;
  images: string[];
  termsAndConditions: string;
  redemptionMethod: 'online_code' | 'in_store_voucher' | 'service_booking';
  redemptionCode?: string;
  categoryId: string;
  subcategoryId: string;
  isSponsored?: boolean;
  viewsCount: number;
  clicksCount: number;
  purchasesCount: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  dealId?: string;
  productId?: string;
  serviceId?: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'deal' | 'product' | 'service';
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'refunded' | 'disputed';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  businessId: string;
  businessName: string;
  items: OrderItem[];
  subtotal: number;
  platformCommissionRate: number; // e.g., 0.02 (2%)
  platformCommissionAmount: number; // e.g., 200
  taxesAmount: number;
  sellerGrossSettlement: number; // subtotal - platformCommissionAmount
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'credit_card' | 'easypaisa_jazzcash' | 'bank_transfer' | 'digital_wallet' | 'cash_on_delivery';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  redemptionVoucherCode?: string;
  isRedeemed?: boolean;
  bookingDate?: string;
  bookingTimeSlot?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  orderId: string;
  serviceId: string;
  serviceTitle: string;
  businessId: string;
  businessName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  status: 'confirmed' | 'completed' | 'rescheduled' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export type SponsorshipProductType = 'homepage_banner' | 'category_sponsor' | 'sponsored_deal' | 'sponsored_business' | 'search_promotion';

export interface Campaign {
  id: string;
  sponsorId: string;
  sponsorName: string;
  campaignName: string;
  type: SponsorshipProductType;
  budget: number;
  spentAmount: number;
  targetCategoryId?: string;
  targetCity?: string;
  bannerImage?: string;
  title: string;
  tagline: string;
  landingUrl?: string;
  targetBusinessId?: string;
  targetDealId?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending_approval' | 'paused' | 'completed';
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId?: string;
  businessId: string;
  businessName?: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  itemType?: 'deal' | 'product' | 'service' | 'business';
  dealId?: string;
  dealTitle?: string;
  productId?: string;
  productTitle?: string;
  serviceId?: string;
  serviceTitle?: string;
  sellerReply?: string;
  sellerReplyDate?: string;
  sellerRepliedBy?: string;
  status: 'published' | 'pending_moderation' | 'flagged' | 'hidden' | 'rejected';
  moderationReason?: string;
  isFeatured?: boolean;
  helpfulCount?: number;
  helpfulUserIds?: string[];
  reportedBy?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewRatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
  total: number;
  average: number;
  verifiedCount: number;
  recommendationPercentage: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order_update' | 'flash_deal' | 'campaign' | 'booking' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export type ContentOrigin = 'business' | 'organic_user';

export type DealStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'approved'
  | 'published'
  | 'expired'
  | 'rejected'
  | 'removed';

export type AdvertisementStatus =
  | 'draft'
  | 'submitted'
  | 'payment_pending'
  | 'payment_submitted'
  | 'payment_verified'
  | 'under_review'
  | 'approved'
  | 'published'
  | 'paused'
  | 'rejected'
  | 'expired'
  | 'removed';

export interface Advertisement {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  title: string;
  category: string;
  categoryId: string;
  description: string;
  images: string[];
  promotionalBadge?: string;
  discountDetails?: string;
  startDate: string;
  endDate: string;
  targetLocation: string;
  targetCategory?: string;
  contactMethod: string;
  externalDestination?: string;
  campaignBudget: number;
  spentAmount: number;
  impressions: number;
  clicks: number;
  conversions: number;
  qualityScore: number; // 0 to 100
  status: AdvertisementStatus;
  paymentStatus: 'pending' | 'submitted' | 'verified' | 'failed';
  paymentReference?: string;
  createdAt: string;
  updatedAt?: string;
}

export type BusinessRegistrationStatus =
  | 'draft'
  | 'submitted'
  | 'payment_pending'
  | 'payment_submitted'
  | 'payment_verified'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'expired';

export interface BusinessRegistration {
  id: string;
  ownerId: string;
  ownerName: string;
  businessName: string;
  category: string;
  categoryId: string;
  phone: string;
  email: string;
  whatsapp?: string;
  location: {
    country: string;
    state: string;
    city: string;
    area: string;
    address: string;
  };
  openingHours: string;
  description: string;
  verificationDocUrl?: string;
  baseRegistrationFee: number;
  platformRegistrationChargeRate: number; // 0.03 (3%)
  platformRegistrationChargeAmount: number;
  legalTaxRate: number; // e.g. 0.0 or 0.05
  legalTaxAmount: number;
  totalAmountPayable: number;
  paymentMethod: string;
  paymentStatus: 'payment_pending' | 'payment_submitted' | 'payment_verified' | 'failed';
  paymentProofRef?: string;
  status: BusinessRegistrationStatus;
  adminReviewNotes?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export type RequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'expired';

export type UserRequestType =
  | 'deal_application'
  | 'service_request'
  | 'offer_inquiry'
  | 'custom_quote'
  | 'appointment_booking';

export interface UserRequest {
  id: string;
  requestNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  sellerOrBusinessId: string;
  sellerOrBusinessName: string;
  targetType: 'deal' | 'service' | 'product' | 'custom_offer';
  targetId: string;
  targetTitle: string;
  requestType: UserRequestType;
  message: string;
  proposedBudget?: number;
  requestedDate?: string;
  requestedTimeSlot?: string;
  status: RequestStatus;
  sellerResponseNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportReasonCategory =
  | 'fake_product'
  | 'misleading_price'
  | 'scam'
  | 'duplicate_listing'
  | 'spam'
  | 'inappropriate'
  | 'broken_offer';

export type ReportRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface CommunityReport {
  id: string;
  reportedByUserId: string;
  reportedByUserName: string;
  targetType: 'deal' | 'service' | 'advertisement' | 'business' | 'product';
  targetId: string;
  targetTitle: string;
  businessId?: string;
  reasonCategory: ReportReasonCategory;
  description: string;
  evidenceUrls?: string[];
  riskLevel: ReportRiskLevel;
  status: 'pending_review' | 'investigating' | 'resolved_removed' | 'dismissed';
  adminNotes?: string;
  reviewedByAdminId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SystemConfig {
  defaultCommissionRate: number; // e.g. 0.02 for 2%
  verifiedCommissionRate: number; // 2%
  standardCommissionRate: number; // 6%
  platformRegistrationFeeRate: number; // 0.03 (3%)
  baseBusinessRegistrationFee: number; // e.g. 10000
  legalTaxRate: number; // e.g. 0.00
  currencySymbol: string; // e.g. "Rs." or "$"
  currencyCode: string; // e.g. "PKR" or "USD"
  minPayoutThreshold: number;
  maintenanceMode: boolean;
  allowedCountries: string[];
}
