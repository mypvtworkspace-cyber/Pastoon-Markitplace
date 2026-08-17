import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { DealCard } from './components/DealCard';
import { BusinessCard } from './components/BusinessCard';
import { CartDrawer } from './components/CartDrawer';
import { DealDetailModal } from './components/DealDetailModal';
import { ChatModal } from './components/ChatModal';
import { AdminPanel } from './components/AdminPanel';
import { AISupportDrawer } from './components/AISupportDrawer';
import { SupportTicketModal } from './components/SupportTicketModal';
import { ManagerInviteModal } from './components/ManagerInviteModal';
import { AppUpdateCenter } from './components/AppUpdateCenter';
import { SellerPerformanceDashboard } from './components/SellerPerformanceDashboard';
import { CSVBatchDealModal } from './components/CSVBatchDealModal';
import { MarketplaceFilterSidebar, FilterState } from './components/MarketplaceFilterSidebar';
import { ReviewModal } from './components/ReviewModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { LocationTrackerModal } from './components/LocationTrackerModal';
import { AuthModal } from './components/AuthModal';
import { BusinessRegistrationModal } from './components/BusinessRegistrationModal';
import { CreateAdvertisementModal } from './components/CreateAdvertisementModal';
import { CreateDealModal } from './components/CreateDealModal';
import { UserRequestModal } from './components/UserRequestModal';
import { ReportModal } from './components/ReportModal';
import { SponsoredAdsBanner } from './components/SponsoredAdsBanner';
import { Deal, Business, Category, Order, Advertisement, BusinessRegistration, UserRequest, CommunityReport } from './types';
import { api } from './lib/api';
import {
  Flame,
  Store,
  Tag,
  Percent,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  MapPin,
  X,
  MessageSquare,
  Plus,
  FileSpreadsheet,
  BarChart3,
  Megaphone,
  ShoppingBag,
  DollarSign,
  Briefcase,
  Gift,
  Heart,
  SlidersHorizontal,
  Building2,
  Send,
  ShieldAlert,
} from 'lucide-react';

function AppContent() {
  const {
    currentUser,
    isLoggedIn,
    requireAuth,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authReason,
    deals,
    businesses,
    categories,
    productsAndServices,
    campaigns,
    orders,
    favoriteDealIds,
    activeView,
    setActiveView,
    selectedCategorySlug,
    setSelectedCategorySlug,
    searchQuery,
    selectedCity,
    formatPrice,
    isCartOpen,
    setIsCartOpen,
    systemConfig,
    createDeal,
    createBusiness,
    createCampaign,
  } = useApp();

  // Active Modals & Selection State
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedBusinessStore, setSelectedBusinessStore] = useState<Business | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [targetChatBusinessId, setTargetChatBusinessId] = useState<string | undefined>(undefined);
  const [targetChatDealId, setTargetChatDealId] = useState<string | undefined>(undefined);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showCSVBatchModal, setShowCSVBatchModal] = useState(false);

  // DealHub Marketplace New Modals
  const [showBusinessRegModal, setShowBusinessRegModal] = useState(false);
  const [showCreateAdModal, setShowCreateAdModal] = useState(false);
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTargetDeal, setRequestTargetDeal] = useState<Deal | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetDeal, setReportTargetDeal] = useState<Deal | null>(null);
  const [reportTargetAd, setReportTargetAd] = useState<Advertisement | null>(null);

  // Review System Modal State
  const [reviewBusiness, setReviewBusiness] = useState<Business | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Refined Marketplace Filter & Sort State
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    minDiscount: 0,
    minRating: 0,
    dealType: 'all',
    onlyVerified: false,
    sortBy: 'newest',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const resetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minDiscount: 0,
      minRating: 0,
      dealType: 'all',
      onlyVerified: false,
      sortBy: 'newest',
    });
  };

  // New Listing Form Modal for Sellers
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealPrice, setNewDealPrice] = useState('1000');
  const [newDealDiscounted, setNewDealDiscounted] = useState('700');
  const [newDealCategory, setNewDealCategory] = useState(categories[0]?.id || 'cat_restaurants');
  const [newDealType, setNewDealType] = useState<'physical_product' | 'service_booking'>('physical_product');

  // Trigger Chat with Dealer (Protected with Auth Middleware Guard)
  const handleChatWithDealer = (businessId: string, dealId?: string) => {
    requireAuth('start a direct conversation with this verified dealer', () => {
      setTargetChatBusinessId(businessId);
      setTargetChatDealId(dealId);
      setShowChatModal(true);
    });
  };

  // Filter & Sort Deals based on sidebar filters, saved wishlist, search, city, and view
  const filteredDeals = (deals || [])
    .filter((deal) => {
      if (activeView === 'saved_deals') {
        if (!(favoriteDealIds || []).includes(deal.id)) return false;
      }
      if (activeView === 'flash_deals' && !deal.isFlashDeal) return false;
      if (selectedCategorySlug && (categories || []).find((c) => c.slug === selectedCategorySlug)?.id !== deal.categoryId) {
        return false;
      }
      if (searchQuery && !deal.title.toLowerCase().includes(searchQuery.toLowerCase()) && !deal.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCity !== 'All') {
        const biz = (businesses || []).find((b) => b.id === deal.businessId);
        if (biz && biz.location?.city?.toLowerCase() !== selectedCity.toLowerCase()) return false;
      }

      // Sidebar Refined Filter Rules
      if (filters.minPrice !== '' && deal.discountedPrice < Number(filters.minPrice)) return false;
      if (filters.maxPrice !== '' && deal.discountedPrice > Number(filters.maxPrice)) return false;
      if (filters.minDiscount > 0 && deal.discountPercentage < filters.minDiscount) return false;
      if (filters.dealType !== 'all' && deal.dealType !== filters.dealType) return false;

      const biz = (businesses || []).find((b) => b.id === deal.businessId);
      if (filters.onlyVerified && (!biz || !biz.isVerified)) return false;
      if (filters.minRating > 0 && (!biz || (biz.rating || 0) < filters.minRating)) return false;

      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.discountedPrice - b.discountedPrice;
      if (filters.sortBy === 'price_desc') return b.discountedPrice - a.discountedPrice;
      if (filters.sortBy === 'discount_desc') return b.discountPercentage - a.discountPercentage;
      if (filters.sortBy === 'rating_desc') {
        const rA = (businesses || []).find((b) => b.id === a.businessId)?.rating || 0;
        const rB = (businesses || []).find((b) => b.id === b.businessId)?.rating || 0;
        return rB - rA;
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const filteredBusinesses = (businesses || []).filter((biz) => {
    if (selectedCategorySlug && (categories || []).find((c) => c.slug === selectedCategorySlug)?.id !== biz.categoryId) {
      return false;
    }
    if (searchQuery && !biz.name.toLowerCase().includes(searchQuery.toLowerCase()) && !biz.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCity !== 'All' && biz.location?.city?.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (filters.onlyVerified && !biz.isVerified) return false;
    if (filters.minRating > 0 && biz.rating < filters.minRating) return false;
    return true;
  });

  // Handle New Deal Submission for Sellers
  const handleCreateNewDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealTitle.trim()) return;

    createDeal({
      businessId: businesses[0]?.id || 'biz_gourmet_1',
      title: newDealTitle,
      description: 'Exclusive deal listed on DealHub Universal Marketplace with transparent 2% platform fee.',
      originalPrice: parseFloat(newDealPrice) || 1000,
      discountedPrice: parseFloat(newDealDiscounted) || 700,
      dealType: newDealType,
      isFlashDeal: true,
      endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      totalQuantity: 50,
      categoryId: newDealCategory,
      subcategoryId: '',
    });

    setShowNewDealModal(false);
    setNewDealTitle('');
    alert('New Deal created successfully and published to marketplace!');
  };

  // Render Admin Control Plane if Admin role active
  if (currentUser.role.includes('admin')) {
    return <AdminPanel onClose={() => setActiveView('home')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Universal Navigation Header */}
      <Header
        onOpenOrders={() => setShowOrdersModal(true)}
        onOpenPolicies={() => setShowPolicyModal(true)}
        onOpenChat={() => {
          setTargetChatBusinessId(undefined);
          setTargetChatDealId(undefined);
          setShowChatModal(true);
        }}
        onOpenLocationTracker={() => setShowLocationModal(true)}
      />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-8">
        {/* SELLER / DEALER DASHBOARD VIEW */}
        {currentUser.role === 'seller' ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Seller & Store Dashboard
                </span>
                <h1 className="text-xl sm:text-2xl font-black mt-2">Manage Store, Products & Deal Vouchers</h1>
                <p className="text-xs text-slate-300 max-w-xl mt-1">
                  Enjoy DealHub’s flat 2.0% platform commission with instant direct customer direct messages.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowCSVBatchModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-xs px-4 py-3 rounded-2xl shadow-md flex items-center gap-2 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Batch CSV Upload
                </button>

                <button
                  onClick={() => setShowNewDealModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" /> Create New Deal
                </button>
              </div>
            </div>

            {/* Seller KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
                <div className="text-xs text-slate-400 font-bold uppercase">Store GMV Sales</div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {formatPrice((orders || []).reduce((sum, o) => sum + (o?.subtotal || 0), 0))}
                </div>
                <div className="text-[10px] text-emerald-500 font-bold">2.0% platform commission auto-settled</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
                <div className="text-xs text-slate-400 font-bold uppercase">Active Listings</div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{(deals || []).length} Deals</div>
                <div className="text-[10px] text-indigo-500 font-bold">In physical products & booking vouchers</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
                <div className="text-xs text-slate-400 font-bold uppercase">Customer Enquiries</div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">1 Active Chat</div>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Open Verified Dealer Concierge Chat →
                </button>
              </div>
            </div>

            {/* Deal Performance Dashboard */}
            <SellerPerformanceDashboard deals={deals} />

            {/* Active Store Deals List */}
            <div className="space-y-4">
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Your Published Store Deals
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {deals.map((d) => (
                  <DealCard
                    key={d.id}
                    deal={d}
                    business={(businesses || []).find((b) => b.id === d.businessId)}
                    onOpenDetail={(deal) => setSelectedDeal(deal)}
                    onChatWithDealer={handleChatWithDealer}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : currentUser.role === 'sponsor' ? (
          /* SPONSOR DASHBOARD VIEW */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border border-purple-800/60 text-white p-6 rounded-3xl shadow-xl flex justify-between items-center">
              <div>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  Sponsorship & Campaign Portal
                </span>
                <h1 className="text-xl sm:text-2xl font-black mt-2">Promote Deals & Homepage Banner Campaigns</h1>
                <p className="text-xs text-slate-300 max-w-xl mt-1">
                  Reach thousands of eager discount shoppers across major cities in Pakistan and beyond.
                </p>
              </div>
            </div>

            {/* Active Campaigns */}
            <div className="space-y-4">
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Active Ad Campaigns
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
                    <img src={camp.bannerImage} alt={camp.campaignName} className="w-full h-32 object-cover rounded-xl" />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{camp.campaignName}</h3>
                      <p className="text-xs text-slate-500">{camp.title} - {camp.tagline}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                      <div>
                        <div className="text-[10px] text-slate-400">Budget</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{formatPrice(camp.budget)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Impressions</div>
                        <div className="font-bold text-indigo-500">{camp.impressions}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Clicks</div>
                        <div className="font-bold text-emerald-500">{camp.clicks}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* CUSTOMER MARKETPLACE VIEW */
          <div className="space-y-6">
            {/* Sponsored Banner Carousel */}
            <HeroBanner />

            {/* Quick Actions Hub for Businesses, Ads & Community Submissions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    DealHub Marketplace Quick Action Hub
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Register verified businesses (3% fee), launch sponsored ads, or post community recommendations
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowBusinessRegModal(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Register Business (3% Fee)</span>
                  </button>

                  <button
                    onClick={() => setShowCreateAdModal(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Create Sponsored Ad</span>
                  </button>

                  <button
                    onClick={() => setShowCreateDealModal(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post Deal / Offer</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Active Sponsored Advertisements with Anti-Fraud Protection */}
            <SponsoredAdsBanner
              systemConfig={systemConfig}
              onRequestAdCreation={() => setShowCreateAdModal(true)}
            />

            {/* Category Pills Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-black text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" /> Category Marketplace
                </h2>
                {selectedCategorySlug && (
                  <button
                    onClick={() => setSelectedCategorySlug(null)}
                    className="text-xs text-rose-500 hover:underline font-bold"
                  >
                    Clear Category Filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.map((cat) => {
                  const isSelected = selectedCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategorySlug(isSelected ? null : cat.slug)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-24 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md scale-[1.02]'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 text-slate-800 dark:text-slate-200 shadow-xs'
                      }`}
                    >
                      <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        Category
                      </span>
                      <h3 className="font-extrabold text-xs sm:text-sm line-clamp-1">{cat.name}</h3>
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        Explore →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content Layout with Refined Filter Sidebar */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Refined Search Filter Sidebar */}
              <div className="w-full lg:w-72 shrink-0">
                <div className="lg:hidden mb-2">
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="w-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold text-xs py-2.5 px-4 rounded-2xl flex items-center justify-between shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-400" /> Filter & Sort Marketplace
                    </span>
                    <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                      {showMobileFilters ? 'Hide' : 'Show'}
                    </span>
                  </button>
                </div>

                <MarketplaceFilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  onReset={resetFilters}
                  isOpenMobile={showMobileFilters}
                  onCloseMobile={() => setShowMobileFilters(false)}
                />
              </div>

              {/* Main Deals & Stores Grid Column */}
              <div className="flex-1 w-full space-y-8">
                {/* Saved Deals Banner / View Header */}
                {activeView === 'saved_deals' && (
                  <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white p-5 rounded-3xl shadow-lg flex justify-between items-center">
                    <div>
                      <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                        Wishlist & Bookmarks
                      </span>
                      <h2 className="text-xl font-black mt-1 flex items-center gap-2">
                        <Heart className="w-5 h-5 fill-white text-white" /> Your Saved Deals & Vouchers
                      </h2>
                      <p className="text-xs text-rose-100 mt-0.5">
                        Keep track of your favorite limited-time discount offers
                      </p>
                    </div>
                    <span className="text-2xl font-black bg-white/20 px-4 py-2 rounded-2xl">
                      {(favoriteDealIds || []).length}
                    </span>
                  </div>
                )}

                {/* Featured Deals Grid */}
                {activeView !== 'businesses' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-black text-slate-900 dark:text-slate-100 text-base sm:text-lg flex items-center gap-2">
                          <Flame className="w-5 h-5 text-rose-500" />
                          {activeView === 'saved_deals'
                            ? 'Saved Marketplace Deals'
                            : activeView === 'flash_deals'
                            ? '🔥 Hot Flash Deals & Limited Stocks'
                            : 'Hot Deals, Vouchers & Physical Products'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Transparent 2.0% platform commission auto-applied at checkout
                        </p>
                      </div>

                      <span className="text-xs font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {filteredDeals.length} Deals Available
                      </span>
                    </div>

                    {filteredDeals.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center space-y-2 text-slate-400">
                        <Tag className="w-10 h-10 mx-auto stroke-1 text-slate-300" />
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                          {activeView === 'saved_deals'
                            ? 'No saved deals found in your wishlist.'
                            : 'No matching deals found with current filters.'}
                        </p>
                        <p className="text-xs">
                          {activeView === 'saved_deals'
                            ? 'Click the heart icon on any deal card to save it for later.'
                            : 'Try adjusting your price range, discount percentage, or reset sidebar filters.'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredDeals.map((deal) => (
                          <DealCard
                            key={deal.id}
                            deal={deal}
                            business={(businesses || []).find((b) => b.id === deal.businessId)}
                            onOpenDetail={(d) => setSelectedDeal(d)}
                            onChatWithDealer={handleChatWithDealer}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Businesses & Stores Directory Section */}
                {(activeView === 'home' || activeView === 'businesses') && (
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-black text-slate-900 dark:text-slate-100 text-base sm:text-lg flex items-center gap-2">
                          <Store className="w-5 h-5 text-indigo-500" /> Verified Dealers & Partner Stores
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Chat directly with store owners before placing custom orders
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredBusinesses.map((biz) => (
                        <BusinessCard
                          key={biz.id}
                          business={biz}
                          onSelect={(b) => setSelectedBusinessStore(b)}
                          onChatWithDealer={(b) => handleChatWithDealer(b.id)}
                          onOpenReviews={(b) => {
                            setReviewBusiness(b);
                            setShowReviewModal(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Slide-Overs */}

      {/* 1. Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          business={(businesses || []).find((b) => b.id === selectedDeal.businessId)}
          onClose={() => setSelectedDeal(null)}
          onChatWithDealer={handleChatWithDealer}
        />
      )}

      {/* 2. Direct Verified Dealer Concierge Messaging Chat Modal */}
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        targetBusinessId={targetChatBusinessId}
        initialDealId={targetChatDealId}
      />

      {/* 3. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onSuccessOrder={() => {
          setShowOrdersModal(true);
        }}
      />

      {/* 4. Customer Real-Time Order Tracking Modal */}
      <OrderTrackingModal
        orders={orders || []}
        isOpen={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
      />

      {/* Real-Time GPS Location Tracker Modal */}
      <LocationTrackerModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />

      {/* DealHub Business Registration Modal (3% Platform Charge) */}
      <BusinessRegistrationModal
        isOpen={showBusinessRegModal}
        onClose={() => setShowBusinessRegModal(false)}
        systemConfig={systemConfig}
      />

      {/* DealHub Sponsored Advertisement Creator Modal */}
      <CreateAdvertisementModal
        isOpen={showCreateAdModal}
        onClose={() => setShowCreateAdModal(false)}
        currentUser={currentUser}
        businesses={businesses || []}
        systemConfig={systemConfig}
      />

      {/* DealHub Universal Deal Submission Modal (Business & Organic) */}
      <CreateDealModal
        isOpen={showCreateDealModal}
        onClose={() => setShowCreateDealModal(false)}
        currentUser={currentUser}
        businesses={businesses || []}
        systemConfig={systemConfig}
      />

      {/* DealHub User Request / Application Modal */}
      <UserRequestModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setRequestTargetDeal(null);
        }}
        targetDeal={requestTargetDeal || undefined}
        systemConfig={systemConfig}
      />

      {/* DealHub Anti-Fraud & Scam Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportTargetDeal(null);
          setReportTargetAd(null);
        }}
        targetDeal={reportTargetDeal || undefined}
        targetAd={reportTargetAd || undefined}
      />

      {/* 5. New Deal Creator Modal for Sellers */}
      {showNewDealModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateNewDeal} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" /> Create New Deal Voucher
              </h3>
              <button type="button" onClick={() => setShowNewDealModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Deal Title</label>
                <input
                  type="text"
                  required
                  value={newDealTitle}
                  onChange={(e) => setNewDealTitle(e.target.value)}
                  placeholder="e.g. 40% Off Birthday Cake Voucher"
                  className="w-full mt-1 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Original Price (PKR)</label>
                  <input
                    type="number"
                    value={newDealPrice}
                    onChange={(e) => setNewDealPrice(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Discounted Price (PKR)</label>
                  <input
                    type="number"
                    value={newDealDiscounted}
                    onChange={(e) => setNewDealDiscounted(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={newDealCategory}
                  onChange={(e) => setNewDealCategory(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowNewDealModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md"
              >
                Publish Deal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Commercial Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Commercial Policy & 2% Fee Standard
              </h3>
              <button onClick={() => setShowPolicyModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>Transparent 2.0% Platform Commission:</strong> DealHub automatically charges a transparent flat 2.0% platform fee on all voucher & deal redemptions.
              </p>
              <p>
                <strong>No Email Verification Required:</strong> Registration & logins operate immediately without mandatory email verification steps.
              </p>
              <p>
                <strong>Direct Dealer Communication:</strong> Authenticated customers can initiate private direct communications with verified dealers for custom inquiries, deal terms, or booking appointments.
              </p>
              <p>
                <strong>Admin Controlled Moderation:</strong> Administrators do not have unrestricted access to private customer-dealer chats. Sensitive chat access requires an audited justification reason.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="px-5 py-2.5 text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Phase 3 Drawers & Modals */}
      {showReviewModal && reviewBusiness && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setReviewBusiness(null);
          }}
          business={reviewBusiness}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason={authReason}
      />
      <AISupportDrawer />
      <SupportTicketModal />
      <ManagerInviteModal />
      <AppUpdateCenter />
      <CSVBatchDealModal
        isOpen={showCSVBatchModal}
        onClose={() => setShowCSVBatchModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
