import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  MapPin,
  Tag,
  Store,
  User as UserIcon,
  Flame,
  ChevronDown,
  Layers,
  Heart,
  Globe,
  Settings,
  Megaphone,
  BarChart2,
  FileText,
  Percent,
  MessageSquare,
  Bot,
  Headphones,
  Ticket,
  Sparkles,
  Crown,
  UserPlus,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC<{
  onOpenOrders: () => void;
  onOpenPolicies: () => void;
  onOpenChat: () => void;
  onOpenLocationTracker?: () => void;
}> = ({ onOpenOrders, onOpenPolicies, onOpenChat, onOpenLocationTracker }) => {
  const {
    currentUser,
    switchUserRole,
    currency,
    setCurrencyCode,
    selectedCity,
    setSelectedCity,
    categories,
    cart,
    setIsCartOpen,
    favoriteDealIds,
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    selectedCategorySlug,
    setSelectedCategorySlug,
    systemConfig,
    setIsAISupportOpen,
    setIsSupportTicketModalOpen,
    setIsAppUpdateCenterOpen,
    setIsManagerInviteModalOpen,
    unreadUpdatesCount,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cities = ['All', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Dubai', 'New York'];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Dual-Language Security Advisory Alert */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-700 text-white text-xs py-1.5 px-4 shadow-inner border-b border-amber-400/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] font-semibold">
          <div className="flex items-center gap-2 text-amber-100">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="font-bold">🔒 Security Advisory (اردو / English):</span>
            <span className="text-white">Aapki security ke liye Login / Signup zaroori hai deals aur chat access karne ke liye.</span>
            <span className="hidden lg:inline text-amber-200/90">• Login or sign up is strictly required for verified purchases & direct dealer chats.</span>
          </div>
          <span className="text-[10px] bg-black/30 border border-white/20 text-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold shrink-0">
            Verified Protection
          </span>
        </div>
      </div>

      {/* Top Banner Ticker */}
      <div className="bg-slate-950/80 text-xs py-1 px-4 text-center font-medium flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center justify-center gap-2 mx-auto">
          <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
          <span>Universal Marketplace: Discover Top Businesses, Flash Deals & Services in {selectedCity === 'All' ? 'Your City' : selectedCity}!</span>
          <span className="hidden sm:inline-block bg-white/10 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
            Transparent {(systemConfig.defaultCommissionRate * 100).toFixed(1)}% Platform Fee
          </span>
        </div>

        {/* What's New App Update Badge */}
        <button
          onClick={() => setIsAppUpdateCenterOpen(true)}
          className="hidden md:flex items-center gap-1 bg-black/30 hover:bg-black/50 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-300 border border-amber-400/30 transition shrink-0"
        >
          <Sparkles className="w-3 h-3 text-amber-300" /> What's New
          {unreadUpdatesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <div
          onClick={() => {
            setActiveView('home');
            setSelectedCategorySlug(null);
            setSearchQuery('');
          }}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
            DH
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              DealHub
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Universal Marketplace</div>
          </div>
        </div>

        {/* Location Selector & GPS Tracker */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs">
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium pr-1"
          >
            {cities.map((city) => (
              <option key={city} value={city} className="bg-slate-900 text-white">
                {city === 'All' ? '📍 All Cities' : city}
              </option>
            ))}
          </select>

          {onOpenLocationTracker && (
            <button
              onClick={onOpenLocationTracker}
              className="p-1 hover:bg-slate-700 rounded text-indigo-400 hover:text-indigo-300 transition-colors"
              title="Track Real-Time GPS Location & Nearby Deals"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search deals, products, home services, restaurants, electronics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setActiveView('deals');
                }
              }}
              className="w-full bg-slate-800/90 text-slate-100 text-xs sm:text-sm pl-9 pr-20 py-2 rounded-xl border border-slate-700/80 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 transition-all"
            />
            <button
              onClick={() => setActiveView('deals')}
              className="absolute right-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1 rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Admin Control Panel Button */}
          <button
            onClick={() => {
              switchUserRole('super_admin');
            }}
            className={`p-2 rounded-xl transition-all relative flex items-center gap-1 font-bold text-xs ${
              currentUser.role.includes('admin')
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 border border-slate-700'
            }`}
            title="Open Admin Security Control Panel"
          >
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span className="hidden xl:inline">Admin Panel</span>
          </button>

          {/* Customer Support Button */}
          <button
            onClick={() => setIsAISupportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md shadow-amber-500/10"
            title="Customer Support Assistant"
          >
            <Headphones className="w-4 h-4" />
            <span className="hidden sm:inline">Customer Support</span>
          </button>

          {/* Support Tickets Icon */}
          <button
            onClick={() => setIsSupportTicketModalOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors relative"
            title="Support Tickets"
          >
            <Ticket className="w-5 h-5 text-amber-400" />
          </button>

          {/* Chat with Dealer Link */}
          <button
            onClick={onOpenChat}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors relative"
            title="Dealer Chat Messages"
          >
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
              Chat
            </span>
          </button>

          {/* Orders Link */}
          <button
            onClick={onOpenOrders}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors relative"
            title="My Orders & Redemptions"
          >
            <FileText className="w-5 h-5" />
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors relative"
            title="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* 5-Tier Mobile & Web Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline capitalize">{currentUser.role.replace('_', ' ')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs max-h-[80vh] overflow-y-auto">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <div className="font-bold text-slate-200">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400">{currentUser.email}</div>
                  <div className="mt-1 inline-block bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-amber-500/30">
                    Role: {currentUser.role.toUpperCase().replace('_', ' ')}
                  </div>
                </div>

                <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">Switch 5-Tier Mobile Role:</div>

                <button
                  onClick={() => {
                    switchUserRole('super_admin');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 ${
                    currentUser.role === 'super_admin' ? 'text-rose-400 font-bold bg-slate-800/80' : 'text-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Super Admin Control Plane
                </button>

                <button
                  onClick={() => {
                    switchUserRole('customer');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 ${
                    currentUser.role === 'customer' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-300'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" /> Level 1: Customer / User
                </button>

                <button
                  onClick={() => {
                    switchUserRole('staff');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 ${
                    currentUser.role === 'staff' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-300'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 text-blue-400" /> Level 2: Support Staff
                </button>

                <button
                  onClick={() => {
                    switchUserRole('manager');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 ${
                    currentUser.role === 'manager' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-300'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-amber-400" /> Level 3: Operations Manager
                </button>

                <button
                  onClick={() => {
                    switchUserRole('deal_manager');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 ${
                    currentUser.role === 'deal_manager' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-300'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-indigo-400" /> Level 4: Deal Manager
                </button>

                <button
                  onClick={() => {
                    switchUserRole('payment_manager');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 ${
                    currentUser.role === 'payment_manager' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-300'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5 text-emerald-400" /> Level 4: Payment Manager
                </button>

                <button
                  onClick={() => {
                    switchUserRole('owner');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 ${
                    currentUser.role === 'owner' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-300'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Level 5: Platform Owner
                </button>

                <div className="border-t border-slate-800 my-1 pt-1">
                  <button
                    onClick={() => {
                      switchUserRole('seller');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 ${
                      currentUser.role === 'seller' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-300'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5 text-purple-400" /> Seller / Dealer Portal
                  </button>

                  <button
                    onClick={() => {
                      setIsManagerInviteModalOpen(true);
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 text-amber-400 font-semibold"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Invite New Manager...
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub Navigation Categories Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/60 py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveView('home');
                setSelectedCategorySlug(null);
              }}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeView === 'home' && !selectedCategorySlug ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> All Categories
            </button>

            <button
              onClick={() => {
                setActiveView('flash_deals');
              }}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeView === 'flash_deals' ? 'bg-rose-600 text-white animate-pulse' : 'text-rose-400 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Flash Deals
            </button>

            <button
              onClick={() => {
                setActiveView('businesses');
              }}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeView === 'businesses' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Businesses Directory
            </button>

            <button
              onClick={() => {
                setActiveView('services');
              }}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeView === 'services' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5" /> Services & Bookings
            </button>

            <button
              onClick={() => {
                setActiveView('saved_deals');
              }}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeView === 'saved_deals' ? 'bg-rose-600 text-white' : 'text-rose-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> Saved Deals
              {(favoriteDealIds || []).length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {(favoriteDealIds || []).length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-slate-400 font-medium text-[11px]">
            <span className="cursor-pointer hover:text-slate-200" onClick={() => setIsAppUpdateCenterOpen(true)}>
              App Updates
            </span>
            <span>•</span>
            <span className="cursor-pointer hover:text-slate-200" onClick={onOpenPolicies}>
              2% Fee Policy
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

