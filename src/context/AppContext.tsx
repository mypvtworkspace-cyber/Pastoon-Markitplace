import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Category,
  Business,
  Deal,
  ProductServiceItem,
  Order,
  Campaign,
  SystemConfig,
  Review,
  ReviewRatingBreakdown,
} from '../types';
import { api } from '../lib/api';
import {
  initialSystemConfig,
  initialUsers,
  initialCategories,
  initialBusinesses,
  initialDeals,
  initialProductServices,
  initialCampaigns,
  initialOrders,
  initialReviews,
} from '../data/initialData';

export interface CartItem {
  id: string;
  dealId?: string;
  productId?: string;
  serviceId?: string;
  businessId: string;
  businessName: string;
  title: string;
  unitPrice: number;
  originalPrice?: number;
  quantity: number;
  type: 'deal' | 'product' | 'service';
  image?: string;
}

interface AppContextType {
  currentUser: User;
  user: User; // alias for compatibility
  switchUserRole: (role: UserRole) => void;
  usersList: User[];
  systemConfig: SystemConfig;
  updateCommissionRate: (newRate: number) => Promise<void>;
  currency: { symbol: string; code: string; rateMultiplier: number };
  setCurrencyCode: (code: 'PKR' | 'USD' | 'AED') => void;
  formatPrice: (amountInBasePkr: number) => string;
  selectedCity: string;
  setSelectedCity: (city: string) => void;

  // Categories & Market Entities
  categories: Category[];
  refreshCategories: () => Promise<void>;
  businesses: Business[];
  deals: Deal[];
  productsAndServices: ProductServiceItem[];
  campaigns: Campaign[];
  orders: Order[];
  reviews: Review[];

  // Entity Creation & Updates
  createDeal: (dealData: Partial<Deal>) => void;
  createBusiness: (bizData: Partial<Business>) => void;
  createCampaign: (campData: Partial<Campaign>) => void;
  verifyBusiness: (businessId: string) => void;

  // Comprehensive Reviews & Ratings
  addReview: (reviewData: Partial<Review>) => Promise<Review | null>;
  replyToReview: (reviewId: string, replyText: string, replierName?: string) => Promise<boolean>;
  moderateReview: (
    reviewId: string,
    status: 'published' | 'pending_moderation' | 'flagged' | 'hidden' | 'rejected',
    moderationReason?: string,
    isFeatured?: boolean
  ) => Promise<boolean>;
  deleteReview: (reviewId: string, reason?: string) => Promise<boolean>;
  reportReview: (reviewId: string, reason: string) => Promise<boolean>;
  voteHelpfulReview: (reviewId: string) => Promise<boolean>;
  getReviewsForBusiness: (businessId: string) => Review[];
  getReviewsForDeal: (dealId: string) => Review[];
  getReviewsForProduct: (productId: string) => Review[];
  getReviewsForService: (serviceId: string) => Review[];

  // Authentication & Security Guards
  isLoggedIn: boolean;
  loginUser: (email: string, pass: string) => void;
  registerUser: (newUser: User) => void;
  logoutUser: () => void;
  requireAuth: (reason: string, onSuccess: () => void) => boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authReason: string;
  setAuthReason: (reason: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Favorites
  favoriteDealIds: string[];
  favoriteBusinessIds: string[];
  toggleFavoriteDeal: (dealId: string) => void;
  toggleFavoriteBusiness: (bizId: string) => void;

  // Active Modals & Views
  activeView:
    | 'home'
    | 'deals'
    | 'flash_deals'
    | 'businesses'
    | 'services'
    | 'sponsorships'
    | 'my_orders'
    | 'saved_deals'
    | 'business_dashboard'
    | 'sponsor_dashboard'
    | 'admin_dashboard';
  setActiveView: (view: any) => void;
  selectedBusinessId: string | null;
  setSelectedBusinessId: (id: string | null) => void;
  selectedDealModal: Deal | null;
  setSelectedDealModal: (deal: Deal | null) => void;
  selectedBookingService: any | null;
  setSelectedBookingService: (service: any | null) => void;

  // Phase 3 Drawers & Modals
  isAISupportOpen: boolean;
  setIsAISupportOpen: (open: boolean) => void;
  isSupportTicketModalOpen: boolean;
  setIsSupportTicketModalOpen: (open: boolean) => void;
  isAppUpdateCenterOpen: boolean;
  setIsAppUpdateCenterOpen: (open: boolean) => void;
  isManagerInviteModalOpen: boolean;
  setIsManagerInviteModalOpen: (open: boolean) => void;
  unreadUpdatesCount: number;
  markUpdatesAsRead: () => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string | null) => void;

  // Global Refetch
  triggerRefresh: number;
  refreshData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Default active demo session
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authReason, setAuthReason] = useState<string>('Aapki security ke liye Login / Signup zaroori hai.');

  // Core Data Stores
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(initialSystemConfig);
  const [currencyCode, setCurrencyCodeState] = useState<'PKR' | 'USD' | 'AED'>('PKR');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [productsAndServices, setProductsAndServices] = useState<ProductServiceItem[]>(initialProductServices);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favoriteDealIds, setFavoriteDealIds] = useState<string[]>(['deal_burger_combo']);
  const [favoriteBusinessIds, setFavoriteBusinessIds] = useState<string[]>(['biz_tasty_bites']);

  const [activeView, setActiveView] = useState<any>('home');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [selectedDealModal, setSelectedDealModal] = useState<Deal | null>(null);
  const [selectedBookingService, setSelectedBookingService] = useState<any | null>(null);

  // Phase 3 States
  const [isAISupportOpen, setIsAISupportOpen] = useState(false);
  const [isSupportTicketModalOpen, setIsSupportTicketModalOpen] = useState(false);
  const [isAppUpdateCenterOpen, setIsAppUpdateCenterOpen] = useState(false);
  const [isManagerInviteModalOpen, setIsManagerInviteModalOpen] = useState(false);
  const [unreadUpdatesCount, setUnreadUpdatesCount] = useState(1);

  const markUpdatesAsRead = () => setUnreadUpdatesCount(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  const [triggerRefresh, setTriggerRefresh] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const refreshData = () => {
    setTriggerRefresh((prev) => prev + 1);
  };

  // Synchronize with API backend
  useEffect(() => {
    // Config
    api.getSystemConfig().then((res) => {
      if (res.success && res.data) setSystemConfig(res.data);
    });
    // Categories
    api.getCategories().then((res) => {
      if (res.success && res.data && res.data.length > 0) setCategories(res.data);
    });
    // Businesses
    api.getBusinesses().then((res) => {
      if (res.success && res.data && res.data.length > 0) setBusinesses(res.data);
    });
    // Deals
    api.getDeals().then((res) => {
      if (res.success && res.data && res.data.length > 0) setDeals(res.data);
    });
    // Reviews
    api.getReviews().then((res) => {
      if (res.success && res.data && res.data.length > 0) setReviews(res.data);
    });
    // Orders
    api.getOrders().then((res) => {
      if (res.success && res.data && res.data.length > 0) setOrders(res.data);
    });
  }, [triggerRefresh]);

  const refreshCategories = async () => {
    const res = await api.getCategories();
    if (res.success && res.data && res.data.length > 0) {
      setCategories(res.data);
    }
  };

  // Auth Operations
  const loginUser = (email: string, pass: string) => {
    const matched = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: 'customer' as UserRole,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(matched);
    setIsLoggedIn(true);
    showToast(`Welcome back, ${matched.name}!`);
  };

  const registerUser = (newUser: User) => {
    setUsersList((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    showToast(`Account created successfully! Welcome to DealHub, ${newUser.name}.`);
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    showToast('Logged out securely.');
  };

  const requireAuth = (reason: string, onSuccess: () => void): boolean => {
    if (isLoggedIn) {
      onSuccess();
      return true;
    } else {
      setAuthReason(reason || 'Aapki Security aur Safety ke liye Login / Signup hona zaroori hai.');
      setIsAuthModalOpen(true);
      return false;
    }
  };

  const switchUserRole = (role: UserRole) => {
    const matchedUser = (usersList || []).find((u) => u.role === role) || {
      id: `usr_${role}_demo`,
      name: `Demo ${role.toUpperCase().replace('_', ' ')}`,
      email: `${role}@dealhub.com`,
      role: role,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(matchedUser);

    if (role === 'seller') setActiveView('business_dashboard');
    else if (role === 'sponsor') setActiveView('sponsor_dashboard');
    else if (
      role === 'owner' ||
      role === 'manager' ||
      role === 'staff' ||
      role === 'deal_manager' ||
      role === 'payment_manager' ||
      role === 'admin' ||
      role === 'super_admin'
    )
      setActiveView('admin_dashboard');
    else setActiveView('home');

    showToast(`Switched portal view: ${matchedUser.name} (${role.toUpperCase()})`);
  };

  // Commission Setting
  const updateCommissionRate = async (newRate: number) => {
    const res = await api.updateSystemConfig({ defaultCommissionRate: newRate });
    if (res.success && res.data) {
      setSystemConfig(res.data);
      showToast(`Platform Commission updated to ${(newRate * 100).toFixed(1)}%`);
    } else {
      setSystemConfig((prev) => ({ ...prev, defaultCommissionRate: newRate }));
      showToast(`Platform Commission set to ${(newRate * 100).toFixed(1)}%`);
    }
  };

  // Currency Converter
  const getCurrencyDetails = () => {
    if (currencyCode === 'USD') return { symbol: '$', code: 'USD', rateMultiplier: 0.0036 };
    if (currencyCode === 'AED') return { symbol: 'AED', code: 'AED', rateMultiplier: 0.013 };
    return { symbol: 'Rs.', code: 'PKR', rateMultiplier: 1.0 };
  };

  const setCurrencyCode = (code: 'PKR' | 'USD' | 'AED') => {
    setCurrencyCodeState(code);
    showToast(`Currency changed to ${code}`);
  };

  const formatPrice = (amountInBasePkr: number) => {
    const { symbol, rateMultiplier } = getCurrencyDetails();
    const converted = amountInBasePkr * rateMultiplier;
    if (currencyCode === 'PKR') {
      return `${symbol} ${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol} ${converted.toFixed(2)}`;
  };

  // Cart Management
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i));
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
    showToast(`Added "${item.title}" to cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
  };

  const clearCart = () => setCart([]);

  // Favorites
  const toggleFavoriteDeal = (dealId: string) => {
    setFavoriteDealIds((prev) => (prev.includes(dealId) ? prev.filter((id) => id !== dealId) : [...prev, dealId]));
  };

  const toggleFavoriteBusiness = (bizId: string) => {
    setFavoriteBusinessIds((prev) => (prev.includes(bizId) ? prev.filter((id) => id !== bizId) : [...prev, bizId]));
  };

  // Entity Creation Handlers
  const createDeal = (dealData: Partial<Deal>) => {
    const newDeal: Deal = {
      id: `deal_${Date.now()}`,
      businessId: dealData.businessId || businesses[0]?.id || 'biz_tasty_bites',
      title: dealData.title || 'New Marketplace Deal',
      description: dealData.description || 'Exclusive deal listed on DealHub Universal Marketplace.',
      originalPrice: dealData.originalPrice || 1000,
      discountedPrice: dealData.discountedPrice || 750,
      discountPercentage: dealData.originalPrice && dealData.discountedPrice
        ? Math.round(((dealData.originalPrice - dealData.discountedPrice) / dealData.originalPrice) * 100)
        : 25,
      dealType: dealData.dealType || 'physical_product',
      isFlashDeal: !!dealData.isFlashDeal,
      startDate: new Date().toISOString(),
      endDate: dealData.endDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      totalQuantity: dealData.totalQuantity || 50,
      remainingQuantity: dealData.totalQuantity || 50,
      maxPerCustomer: 5,
      images: dealData.images || ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'],
      categoryId: dealData.categoryId || categories[0]?.id || 'cat_restaurants',
      subcategoryId: dealData.subcategoryId || '',
      termsAndConditions: dealData.termsAndConditions || 'Present QR voucher at store checkout.',
      redemptionMethod: dealData.redemptionMethod || 'in_store_voucher',
      isSponsored: false,
      viewsCount: 0,
      clicksCount: 0,
      purchasesCount: 0,
      createdAt: new Date().toISOString(),
    };

    setDeals((prev) => [newDeal, ...prev]);
    showToast(`Deal "${newDeal.title}" created & published!`);
  };

  const createBusiness = (bizData: Partial<Business>) => {
    const newBiz: Business = {
      id: `biz_${Date.now()}`,
      ownerId: currentUser.id,
      name: bizData.name || 'New Verified Business',
      description: bizData.description || 'Welcome to our verified store on DealHub.',
      categoryId: bizData.categoryId || categories[0]?.id || 'cat_restaurants',
      subcategoryId: '',
      logo: bizData.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150',
      coverImage: bizData.coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      location: bizData.location || { country: 'Pakistan', state: 'Sindh', city: 'Karachi', area: 'Clifton', address: 'Main Blvd' },
      contact: { phone: '+92 300 1234567', email: 'dealer@dealhub.com' },
      openingHours: '10:00 AM - 10:00 PM',
      isVerified: true,
      followersCount: 0,
      featured: false,
      planId: 'business_pro',
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    setBusinesses((prev) => [newBiz, ...prev]);
    showToast(`Store "${newBiz.name}" registered successfully!`);
  };

  const createCampaign = (campData: Partial<Campaign>) => {
    const newCamp: Campaign = {
      id: `camp_${Date.now()}`,
      sponsorId: currentUser.id,
      sponsorName: currentUser.name,
      campaignName: campData.campaignName || campData.title || 'Brand Awareness Promotion',
      type: campData.type || 'homepage_banner',
      title: campData.title || 'Brand Awareness Promotion',
      tagline: campData.tagline || 'Limited time specials powered by DealHub partners',
      targetDealId: campData.targetDealId,
      targetBusinessId: campData.targetBusinessId,
      bannerImage: campData.bannerImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
      landingUrl: '#',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      budget: campData.budget || 50000,
      spentAmount: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    showToast(`Sponsorship Campaign "${newCamp.title}" activated!`);
  };

  const verifyBusiness = (businessId: string) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, isVerified: !b.isVerified } : b))
    );
    showToast(`Dealer verification status updated.`);
  };

  // ----------------------------------------------------
  // REVIEWS & RATINGS STATE ACTIONS
  // ----------------------------------------------------
  const addReview = async (reviewData: Partial<Review>): Promise<Review | null> => {
    try {
      const res = await api.createReview(reviewData);
      if (res.success && res.data) {
        const created = res.data;
        setReviews((prev) => [created, ...prev]);

        // Update local business rating & reviewCount
        setBusinesses((prev) =>
          prev.map((b) => {
            if (b.id === created.businessId) {
              const allBizRevs = [created, ...reviews.filter((r) => r.businessId === b.id && r.status === 'published')];
              const avg = Number((allBizRevs.reduce((acc, r) => acc + r.rating, 0) / allBizRevs.length).toFixed(1));
              return { ...b, rating: avg, reviewCount: allBizRevs.length };
            }
            return b;
          })
        );

        showToast('Review submitted and verified successfully!');
        return created;
      }
    } catch (e) {
      console.error('Failed to post review to API, updating local state:', e);
    }

    // Local Fallback
    const localReview: Review = {
      id: `rev_${Date.now()}`,
      orderId: reviewData.orderId,
      businessId: reviewData.businessId || 'biz_tasty_bites',
      businessName: reviewData.businessName || 'DealHub Store',
      customerId: reviewData.customerId || currentUser.id,
      customerName: reviewData.customerName || currentUser.name,
      customerAvatar: reviewData.customerAvatar || currentUser.avatar,
      rating: reviewData.rating || 5,
      title: reviewData.title,
      comment: reviewData.comment || 'Verified purchase review.',
      isVerifiedPurchase: reviewData.isVerifiedPurchase !== undefined ? reviewData.isVerifiedPurchase : true,
      itemType: reviewData.itemType || 'deal',
      dealId: reviewData.dealId,
      dealTitle: reviewData.dealTitle,
      productId: reviewData.productId,
      productTitle: reviewData.productTitle,
      serviceId: reviewData.serviceId,
      serviceTitle: reviewData.serviceTitle,
      status: 'published',
      helpfulCount: 0,
      helpfulUserIds: [],
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [localReview, ...prev]);

    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id === localReview.businessId) {
          const allBizRevs = [localReview, ...reviews.filter((r) => r.businessId === b.id && r.status === 'published')];
          const avg = Number((allBizRevs.reduce((acc, r) => acc + r.rating, 0) / allBizRevs.length).toFixed(1));
          return { ...b, rating: avg, reviewCount: allBizRevs.length };
        }
        return b;
      })
    );

    showToast('Review posted successfully!');
    return localReview;
  };

  const replyToReview = async (reviewId: string, replyText: string, replierName?: string): Promise<boolean> => {
    try {
      await api.replyToReview(reviewId, {
        sellerReply: replyText,
        sellerRepliedBy: replierName || currentUser.name,
        actorId: currentUser.id,
      });
    } catch (e) {
      console.warn('API reply failed, saving locally:', e);
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              sellerReply: replyText,
              sellerReplyDate: new Date().toISOString(),
              sellerRepliedBy: replierName || currentUser.name,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    showToast('Store response published to review.');
    return true;
  };

  const moderateReview = async (
    reviewId: string,
    status: 'published' | 'pending_moderation' | 'flagged' | 'hidden' | 'rejected',
    moderationReason?: string,
    isFeatured?: boolean
  ): Promise<boolean> => {
    try {
      await api.moderateReview(reviewId, {
        status,
        moderationReason,
        isFeatured,
        adminId: currentUser.id,
      });
    } catch (e) {
      console.warn('API moderation update failed, applying locally:', e);
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status,
              moderationReason: moderationReason !== undefined ? moderationReason : r.moderationReason,
              isFeatured: isFeatured !== undefined ? isFeatured : r.isFeatured,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    showToast(`Review status updated to: ${status.replace('_', ' ').toUpperCase()}`);
    return true;
  };

  const deleteReview = async (reviewId: string, reason?: string): Promise<boolean> => {
    try {
      await api.deleteReview(reviewId, { adminId: currentUser.id, reason });
    } catch (e) {
      console.warn('API delete review failed, applying locally:', e);
    }

    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    showToast('Review deleted permanently by administrator.');
    return true;
  };

  const reportReview = async (reviewId: string, reason: string): Promise<boolean> => {
    try {
      await api.reportReview(reviewId, { reportedByUserId: currentUser.id, reason });
    } catch (e) {
      console.warn('API report review failed, applying locally:', e);
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status: 'flagged',
              moderationReason: reason,
              reportedBy: [...(r.reportedBy || []), currentUser.id],
            }
          : r
      )
    );

    showToast('Review reported to administration for safety moderation.');
    return true;
  };

  const voteHelpfulReview = async (reviewId: string): Promise<boolean> => {
    try {
      await api.voteHelpfulReview(reviewId, currentUser.id);
    } catch (e) {
      console.warn('API vote helpful failed, applying locally:', e);
    }

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const userList = r.helpfulUserIds || [];
          const isVoted = userList.includes(currentUser.id);
          const updatedList = isVoted
            ? userList.filter((u) => u !== currentUser.id)
            : [...userList, currentUser.id];
          return {
            ...r,
            helpfulUserIds: updatedList,
            helpfulCount: isVoted ? Math.max(0, (r.helpfulCount || 1) - 1) : (r.helpfulCount || 0) + 1,
          };
        }
        return r;
      })
    );

    return true;
  };

  const getReviewsForBusiness = (businessId: string) => {
    return reviews.filter((r) => r.businessId === businessId && (r.status === 'published' || !r.status));
  };

  const getReviewsForDeal = (dealId: string) => {
    return reviews.filter((r) => r.dealId === dealId && (r.status === 'published' || !r.status));
  };

  const getReviewsForProduct = (productId: string) => {
    return reviews.filter((r) => r.productId === productId && (r.status === 'published' || !r.status));
  };

  const getReviewsForService = (serviceId: string) => {
    return reviews.filter((r) => r.serviceId === serviceId && (r.status === 'published' || !r.status));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        user: currentUser,
        switchUserRole,
        usersList,
        systemConfig,
        updateCommissionRate,
        currency: getCurrencyDetails(),
        setCurrencyCode,
        formatPrice,
        selectedCity,
        setSelectedCity,

        categories,
        refreshCategories,
        businesses,
        deals,
        productsAndServices,
        campaigns,
        orders,
        reviews,

        createDeal,
        createBusiness,
        createCampaign,
        verifyBusiness,

        addReview,
        replyToReview,
        moderateReview,
        deleteReview,
        reportReview,
        voteHelpfulReview,
        getReviewsForBusiness,
        getReviewsForDeal,
        getReviewsForProduct,
        getReviewsForService,

        isLoggedIn,
        loginUser,
        registerUser,
        logoutUser,
        requireAuth,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authReason,
        setAuthReason,

        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,

        favoriteDealIds,
        favoriteBusinessIds,
        toggleFavoriteDeal,
        toggleFavoriteBusiness,

        activeView,
        setActiveView,
        selectedBusinessId,
        setSelectedBusinessId,
        selectedDealModal,
        setSelectedDealModal,
        selectedBookingService,
        setSelectedBookingService,

        isAISupportOpen,
        setIsAISupportOpen,
        isSupportTicketModalOpen,
        setIsSupportTicketModalOpen,
        isAppUpdateCenterOpen,
        setIsAppUpdateCenterOpen,
        isManagerInviteModalOpen,
        setIsManagerInviteModalOpen,
        unreadUpdatesCount,
        markUpdatesAsRead,

        searchQuery,
        setSearchQuery,
        selectedCategorySlug,
        setSelectedCategorySlug,

        triggerRefresh,
        refreshData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
