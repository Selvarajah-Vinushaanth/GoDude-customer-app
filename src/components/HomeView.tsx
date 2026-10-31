import React, { useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  ChevronDown,
  Clock,
  Compass,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Star,
  User,
  Wallet,
} from 'lucide-react';
import {
  ActiveServiceView,
  ActivityBooking,
  MainTab,
  PromotionalOffer,
  Restaurant,
  SriLankaLocation,
} from '../types/godude';
import { FoodIllustration, GoDudeBrandLogo } from './VisualAssets';

interface HomeViewProps {
  currentLocation: SriLankaLocation;
  locations: SriLankaLocation[];
  onSelectLocation: (locId: string) => void;
  restaurants: Restaurant[];
  activeBookings: ActivityBooking[];
  totalBalanceLKR: number;
  currentMonthSavedLKR: number;
  offers: PromotionalOffer[];
  bookmarkedIds: string[];
  onToggleBookmark: (restaurantId: string) => void;
  onOpenService: (
    service: ActiveServiceView,
    options?: {
      foodQuery?: string;
      restaurantId?: string;
      pickDropMode?: 'p2p' | 'flexible';
      isParcel?: boolean;
    }
  ) => void;
  onNavigateTab: (tab: MainTab) => void;
  onApplyOfferCode: (offer: PromotionalOffer) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentLocation,
  locations,
  onSelectLocation,
  restaurants,
  activeBookings,
  totalBalanceLKR,
  currentMonthSavedLKR,
  offers,
  bookmarkedIds,
  onToggleBookmark,
  onOpenService,
  onNavigateTab,
  onApplyOfferCode,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) {
      onOpenService('foods');
      return;
    }
    const lower = q.toLowerCase();
    if (
      lower.includes('ride') ||
      lower.includes('tuk') ||
      lower.includes('car') ||
      lower.includes('bike') ||
      lower.includes('drop')
    ) {
      onOpenService('pickdrop', { pickDropMode: 'p2p', isParcel: false });
    } else if (lower.includes('parcel') || lower.includes('package') || lower.includes('courier')) {
      onOpenService('pickdrop', { pickDropMode: 'p2p', isParcel: true });
    } else if (lower.includes('save') || lower.includes('saving') || lower.includes('donate')) {
      onOpenService('savings');
    } else {
      onOpenService('foods', { foodQuery: q });
    }
  };

  const quickFoodSearches = [
    'Chicken Kottu',
    'Cheese Kottu',
    'Biriyani',
    'Fried Rice',
    'Lamprais',
    'Burgers',
    'Isso Wade',
  ];

  const trendingRestaurants = [...restaurants].sort((a, b) => b.rating - a.rating);
  const monthlyTargetLKR = 5000;
  const monthlyProgressPct = Math.min(100, Math.round((currentMonthSavedLKR / monthlyTargetLKR) * 100));

  return (
    <div className="relative min-h-full pb-28">
      {/* ISSUE 1 FIX: FIXED STICKY TOP HEADER WITH MODERN GLASS EFFECT */}
      <header className="sticky top-0 z-30 glass-header px-4 pt-3.5 pb-3.5 rounded-b-[24px] shadow-lg transition-all">
        {/* Top Row: Logo, Location Indicator, Wallet, Profile */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <GoDudeBrandLogo size="md" />
            <span className="text-[10px] text-sky-200/80 font-medium px-2 py-0.5 rounded-full bg-white/10 hidden sm:inline-block">
              Sri Lanka
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Wallet Pill */}
            <button
              type="button"
              onClick={() => onOpenService('savings')}
              className="px-2.5 py-1 rounded-full glass-pill flex items-center gap-1.5 hover:bg-white/20 transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-mono-num font-bold text-amber-300">
                LKR {totalBalanceLKR.toLocaleString()}
              </span>
            </button>

            {/* Profile Avatar */}
            <button
              type="button"
              onClick={() => onNavigateTab('profile')}
              aria-label="Open Customer Profile"
              className="w-8 h-8 rounded-full bg-slate-800/90 border border-sky-400/40 flex items-center justify-center text-sky-200 hover:bg-slate-700 transition-colors shrink-0"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Deliver-to Location Selector Row */}
        <div className="flex items-center justify-between mb-2.5">
          <button
            type="button"
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="inline-flex items-center gap-1.5 text-left py-0.5 pr-2 rounded-lg hover:bg-white/10 transition-colors max-w-[280px]"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-[11px] text-slate-300">Deliver to</span>
            <ChevronDown className="w-3 h-3 text-slate-300" />
            <span className="text-xs font-bold text-white truncate">
              {currentLocation.name}
            </span>
          </button>
          <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
            ● GPS Active
          </span>
        </div>

        {/* Location Dropdown Modal/Drawer */}
        {showLocationPicker && (
          <div className="mb-2.5 bg-slate-900/95 border border-sky-500/40 rounded-2xl p-2.5 shadow-2xl space-y-1 backdrop-blur-xl">
            <div className="text-[11px] font-semibold text-sky-300 px-2 py-0.5 flex items-center justify-between">
              <span>Select Sri Lanka Location</span>
              <button
                type="button"
                onClick={() => setShowLocationPicker(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    onSelectLocation(loc.id);
                    setShowLocationPicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    loc.id === currentLocation.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-medium truncate">{loc.name}</div>
                    <div className="text-[10px] opacity-75 truncate">{loc.address}</div>
                  </div>
                  <span className="text-[10px] opacity-90 shrink-0 font-medium">{loc.city}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar Input (Fixed at Top with Header) */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for food, rides, packages..."
            aria-label="Search for food, rides, packages"
            className="w-full h-10 pl-9 pr-20 rounded-full bg-white text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>
      </header>

      {/* Main Scrollable Content Body */}
      <div className="px-4 pt-3.5 space-y-5">
        {/* 2x2 Service Cards Grid with Enhanced Modern Glassmorphism & Spacing */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Food Delivery (Green Palette) */}
          <button
            type="button"
            onClick={() => onOpenService('foods')}
            className="group relative overflow-hidden rounded-2xl p-3.5 text-left bg-gradient-to-br from-[#16a34a] via-[#22c55e] to-[#84cc16] text-white shadow-md hover:shadow-lg transition-all min-h-[120px] flex flex-col justify-between border border-white/20"
          >
            <div className="z-10">
              <div className="font-display font-extrabold text-base leading-tight text-slate-950">
                Food
                <br />
                Delivery
              </div>
            </div>
            <div className="z-10 mt-5 flex items-center gap-1 text-xs font-extrabold text-slate-950">
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            {/* Burger & Rider SVG (Anchored Top-Right to prevent text overlap) */}
            <svg
              viewBox="0 0 90 70"
              className="w-16 h-12 absolute right-1.5 top-2 pointer-events-none opacity-90 drop-shadow-sm"
              aria-hidden="true"
            >
              <ellipse cx="26" cy="52" rx="16" ry="6" fill="#92400e" />
              <rect x="11" y="45" width="30" height="5" rx="2" fill="#15803d" />
              <rect x="12" y="41" width="28" height="5" rx="2" fill="#facc15" />
              <path d="M11 42 Q26 24 41 42 Z" fill="#d97706" />
              <circle cx="54" cy="56" r="7" fill="#0f172a" />
              <circle cx="78" cy="56" r="7" fill="#0f172a" />
              <path d="M52 54 L62 38 L75 38 L80 54 Z" fill="#15803d" />
              <rect x="46" y="26" width="14" height="12" rx="2" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
            </svg>
          </button>

          {/* Card 2: Pick & Drop (Blue Palette) */}
          <button
            type="button"
            onClick={() => onOpenService('pickdrop', { pickDropMode: 'p2p', isParcel: true })}
            className="group relative overflow-hidden rounded-2xl p-3.5 text-left bg-gradient-to-br from-[#0284c7] via-[#2563eb] to-[#1d4ed8] text-white shadow-md hover:shadow-lg transition-all min-h-[120px] flex flex-col justify-between border border-white/20"
          >
            <div className="z-10">
              <div className="font-display font-extrabold text-base leading-tight">
                Pick &
                <br />
                Drop
              </div>
            </div>
            <div className="z-10 mt-5 text-xs font-semibold text-sky-100 flex items-center gap-1">
              <span>Courier & Parcels</span>
            </div>
            {/* Courier Box SVG */}
            <svg
              viewBox="0 0 90 70"
              className="w-16 h-12 absolute right-1.5 top-2 pointer-events-none opacity-90 drop-shadow-sm"
              aria-hidden="true"
            >
              <circle cx="65" cy="24" r="9" fill="#fed7aa" />
              <path d="M55 20 Q65 10 75 20 Z" fill="#0284c7" />
              <path d="M50 62 L54 35 L76 35 L80 62 Z" fill="#38bdf8" />
              <rect x="24" y="38" width="22" height="22" rx="3" fill="#f59e0b" />
              <rect x="40" y="44" width="24" height="18" rx="3" fill="#d97706" />
              <line x1="35" y1="38" x2="35" y2="60" stroke="#fef3c7" strokeWidth="2" />
            </svg>
          </button>

          {/* Card 3: Ride Booking (Navy Blue Palette) */}
          <button
            type="button"
            onClick={() => onOpenService('pickdrop', { pickDropMode: 'p2p', isParcel: false })}
            className="group relative overflow-hidden rounded-2xl p-3.5 text-left bg-gradient-to-br from-[#091931] via-[#0f294a] to-[#1e3a8a] text-white shadow-md hover:shadow-lg transition-all min-h-[120px] flex flex-col justify-between border border-sky-400/20"
          >
            <div className="z-10">
              <div className="font-display font-extrabold text-base leading-tight">
                Ride
                <br />
                Booking
              </div>
            </div>
            <div className="z-10 mt-5 text-xs font-semibold text-sky-300 flex items-center gap-1">
              <span>Book a Ride</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            {/* Car SVG */}
            <svg
              viewBox="0 0 95 70"
              className="w-16 h-12 absolute right-1.5 top-2 pointer-events-none opacity-90 drop-shadow-sm"
              aria-hidden="true"
            >
              <path d="M18 46 L28 32 L62 32 L74 44 L80 46 L80 56 L16 56 Z" fill="#0284c7" />
              <path d="M30 35 L45 35 L45 43 L25 43 Z" fill="#bae6fd" />
              <path d="M48 35 L60 35 L66 43 L48 43 Z" fill="#bae6fd" />
              <circle cx="28" cy="56" r="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="66" cy="56" r="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            </svg>
          </button>

          {/* Card 4: Savings & Deals (Orange Palette) */}
          <button
            type="button"
            onClick={() => onOpenService('savings')}
            className="group relative overflow-hidden rounded-2xl p-3.5 text-left bg-gradient-to-br from-[#ea580c] via-[#f97316] to-[#fb923c] text-white shadow-md hover:shadow-lg transition-all min-h-[120px] flex flex-col justify-between border border-white/20"
          >
            <div className="z-10">
              <div className="font-display font-extrabold text-base leading-tight">
                Savings &
                <br />
                Deals
              </div>
            </div>
            <div className="z-10 mt-5 text-xs font-semibold text-amber-100">
              Save 10% Every Order
            </div>
            {/* Wallet & % SVG */}
            <svg
              viewBox="0 0 90 70"
              className="w-16 h-12 absolute right-1.5 top-2 pointer-events-none opacity-90 drop-shadow-sm"
              aria-hidden="true"
            >
              <rect x="34" y="22" width="32" height="16" rx="3" fill="#22c55e" transform="rotate(-10 34 22)" />
              <rect x="30" y="30" width="44" height="30" rx="6" fill="#78350f" />
              <rect x="58" y="40" width="18" height="10" rx="3" fill="#92400e" />
              <circle cx="64" cy="45" r="2.5" fill="#facc15" />
              <circle cx="26" cy="48" r="10" fill="#facc15" />
              <text x="22" y="52" fontSize="11" fontWeight="bold" fill="#78350f">
                %
              </text>
            </svg>
          </button>
        </div>

        {/* Quick Food Search Chips (Horizontal Scroll without scrollbars) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">
              Search Sri Lankan Dishes
            </span>
            <button
              type="button"
              onClick={() => onOpenService('foods')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              All Menus
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {quickFoodSearches.map((dish) => (
              <button
                key={dish}
                type="button"
                onClick={() => onOpenService('foods', { foodQuery: dish })}
                className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 hover:border-green-600 hover:bg-green-50 text-xs font-semibold text-slate-800 whitespace-nowrap shrink-0 transition-all shadow-xs"
              >
                {dish}
              </button>
            ))}
          </div>
        </div>

        {/* Promotional Carousel Banner */}
        <div className="relative">
          {offers.slice(0, 3).map((offer, idx) => {
            if (idx !== activeBannerIdx) return null;
            return (
              <div
                key={offer.id}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-950 via-slate-900 to-amber-950 text-white p-4 shadow-lg flex items-center justify-between gap-3 border border-white/10"
              >
                <div className="z-10 max-w-[62%] space-y-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {offer.businessName}
                  </div>
                  <h3 className="font-display font-extrabold text-base leading-snug">
                    {offer.title}
                  </h3>
                  <p className="text-[11px] text-stone-300 line-clamp-2">{offer.description}</p>
                  <div className="pt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyOfferCode(offer);
                        onOpenService('foods', { foodQuery: 'Chicken Kottu' });
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs transition-colors"
                    >
                      Claim {offer.discountLabel}
                    </button>
                  </div>
                </div>
                <div className="w-24 h-22 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-inner">
                  <FoodIllustration
                    type={idx === 0 ? 'kottu' : idx === 1 ? 'biriyani' : 'cheese_kottu'}
                  />
                </div>
              </div>
            );
          })}
          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Show banner ${idx + 1}`}
                onClick={() => setActiveBannerIdx(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  activeBannerIdx === idx ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Simultaneous Active Bookings Status Bar */}
        {activeBookings.length > 0 && (
          <div className="glass-card rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600 animate-pulse" />
                <h2 className="text-xs font-extrabold text-slate-900">
                  Active Live Bookings ({activeBookings.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('activity')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Track Live →
              </button>
            </div>
            <div className="space-y-2">
              {activeBookings.slice(0, 2).map((booking) => (
                <button
                  key={booking.id}
                  type="button"
                  onClick={() => onNavigateTab('activity')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50/90 hover:bg-blue-50/80 border border-slate-200/80 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {booking.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {booking.id} · {booking.status} · +LKR {booking.savingsEarnedLKR} Saved
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-mono-num font-extrabold text-blue-700">
                      ETA {booking.etaMins}m
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Map View →</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending Near You Kitchens */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display font-extrabold text-base text-slate-900">
                Trending Near You
              </h2>
              <p className="text-xs text-slate-500">
                Top-rated Sri Lankan restaurants in {currentLocation.city}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenService('foods')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              See All ({restaurants.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trendingRestaurants.slice(0, 4).map((rest) => {
              const isBookmarked = bookmarkedIds.includes(rest.id);
              return (
                <div
                  key={rest.id}
                  className="glass-card rounded-2xl p-3 hover:shadow-md transition-shadow flex items-center gap-3"
                >
                  <button
                    type="button"
                    onClick={() => onOpenService('foods', { restaurantId: rest.id })}
                    className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative"
                  >
                    <FoodIllustration type={rest.illustrationType} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenService('foods', { restaurantId: rest.id })}
                        className="text-left font-bold text-sm text-slate-900 hover:text-blue-600 truncate"
                      >
                        {rest.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleBookmark(rest.id)}
                        aria-label={`Bookmark ${rest.name}`}
                        className="p-1 text-slate-400 hover:text-blue-600 shrink-0"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            isBookmarked ? 'fill-blue-600 text-blue-600' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="font-bold text-slate-900">{rest.rating.toFixed(1)}</span>
                      <span>·</span>
                      <span>{rest.reviewCount} ratings</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                      <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{rest.deliveryTimeMins} mins</span>
                      <span>·</span>
                      <span>LKR {rest.deliveryFeeLKR} fee</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orange Savings & Deals Card matching Reference Design */}
        <div className="rounded-3xl bg-gradient-to-br from-[#ea580c] via-[#f97316] to-[#fb923c] p-4 text-white shadow-lg space-y-3 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-extrabold text-base">Savings & Deals</h2>
              <p className="text-xs text-orange-100">
                10% Automatic Savings Credited on Every Order
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Left White Stat Box */}
            <div className="bg-white/95 text-slate-900 rounded-2xl p-3 shadow-xs">
              <div className="text-xs font-bold text-slate-800">Total Saved</div>
              <div className="text-[10px] text-slate-500">Wallet Balance</div>
              <div className="font-mono-num font-extrabold text-sm text-orange-600 mt-0.5">
                LKR {totalBalanceLKR.toLocaleString()}
              </div>
              <div className="flex items-end gap-1.5 h-6 mt-1.5">
                <div className="w-2 bg-orange-300 rounded-t h-2.5" />
                <div className="w-2 bg-orange-400 rounded-t h-3.5" />
                <div className="w-2 bg-orange-500 rounded-t h-4.5" />
                <div className="w-2 bg-sky-500 rounded-t h-3.5" />
                <div className="w-2 bg-blue-600 rounded-t h-6" />
              </div>
            </div>

            {/* Right Navy Progress Box */}
            <div className="bg-[#0f243c]/90 text-white rounded-2xl p-3 flex flex-col justify-between shadow-xs">
              <div>
                <div className="text-xs font-bold">Saved This Month</div>
                <div className="text-[10px] text-sky-200/80">
                  +LKR {currentMonthSavedLKR.toLocaleString()}
                </div>
              </div>
              <div className="mt-1.5">
                <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-yellow-300 rounded-full"
                    style={{ width: `${monthlyProgressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono-num text-slate-300 mt-1">
                  <span>0</span>
                  <span>{monthlyProgressPct}% Goal</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            <button
              type="button"
              onClick={() => onNavigateTab('offers')}
              className="py-2 px-3 rounded-full border border-white/80 text-white hover:bg-white/15 text-xs font-bold text-center transition-colors whitespace-nowrap"
            >
              Active Coupons
            </button>
            <button
              type="button"
              onClick={() => onOpenService('savings')}
              className="py-2 px-3 rounded-full bg-white text-slate-900 hover:bg-orange-50 text-xs font-extrabold text-center transition-colors whitespace-nowrap shadow-xs"
            >
              Withdraw or Donate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
