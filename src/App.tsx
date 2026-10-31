import React, { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  Compass,
  Home,
  Navigation,
  ShoppingBag,
  Sparkles,
  Tag,
  User,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import {
  ActiveServiceView,
  ActivityBooking,
  BankAccount,
  BookingStatus,
  CartItem,
  CharityOrganization,
  CustomerProfile,
  MainTab,
  PromotionalOffer,
  SavingsTransaction,
} from './types/godude';
import {
  BUSINESS_MEMBERSHIP_PLANS,
  CHARITY_ORGANIZATIONS,
  FOOD_ITEMS,
  INITIAL_ACTIVITIES,
  INITIAL_CUSTOMER_PROFILE,
  INITIAL_OFFERS,
  INITIAL_SAVINGS_LEDGER,
  RESTAURANTS,
  SRI_LANKA_LOCATIONS,
  VEHICLE_OPTIONS,
} from './data/sriLankaData';
import { summarizeSavingsLedger } from './utils/calculations';
import { HomeView } from './components/HomeView';
import { FoodsView } from './components/FoodsView';
import { PickDropView } from './components/PickDropView';
import { SavingsView } from './components/SavingsView';
import { ActivityView } from './components/ActivityView';
import { OffersView } from './components/OffersView';
import { ProfileView } from './components/ProfileView';
import { GoDudeBrandLogo } from './components/VisualAssets';

const STORAGE_KEYS = {
  CART: 'godude_sl_cart_v1',
  BOOKINGS: 'godude_sl_bookings_v1',
  SAVINGS: 'godude_sl_savings_v1',
  OFFERS: 'godude_sl_offers_v1',
  PROFILE: 'godude_sl_profile_v1',
  BOOKMARKS: 'godude_sl_bookmarks_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [activeService, setActiveService] = useState<ActiveServiceView>('none');

  // Contextual navigation params for Foods & PickDrop
  const [foodSearchSeed, setFoodSearchSeed] = useState<string>('');
  const [foodRestaurantSeed, setFoodRestaurantSeed] = useState<string | undefined>(undefined);
  const [pickDropModeSeed, setPickDropModeSeed] = useState<'p2p' | 'flexible'>('p2p');
  const [pickDropParcelSeed, setPickDropParcelSeed] = useState<boolean>(false);

  // Persistent Prototype State
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.CART, [])
  );
  const [bookings, setBookings] = useState<ActivityBooking[]>(() =>
    loadFromStorage(STORAGE_KEYS.BOOKINGS, INITIAL_ACTIVITIES)
  );
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>(() =>
    loadFromStorage(STORAGE_KEYS.SAVINGS, INITIAL_SAVINGS_LEDGER)
  );
  const [offers, setOffers] = useState<PromotionalOffer[]>(() =>
    loadFromStorage(STORAGE_KEYS.OFFERS, INITIAL_OFFERS)
  );
  const [profile, setProfile] = useState<CustomerProfile>(() =>
    loadFromStorage(STORAGE_KEYS.PROFILE, INITIAL_CUSTOMER_PROFILE)
  );
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEYS.BOOKMARKS, ['rest-pilawoos', 'rest-upalis'])
  );

  const [appliedOffer, setAppliedOffer] = useState<PromotionalOffer | null>(INITIAL_OFFERS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savingsTransactions));
    } catch {
      // ignore
    }
  }, [savingsTransactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
    } catch {
      // ignore
    }
  }, [offers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedIds));
    } catch {
      // ignore
    }
  }, [bookmarkedIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  const currentLocation = useMemo(
    () =>
      SRI_LANKA_LOCATIONS.find((l) => l.id === profile.selectedLocationId) ||
      SRI_LANKA_LOCATIONS[0],
    [profile.selectedLocationId]
  );

  const savingsSummary = useMemo(
    () => summarizeSavingsLedger(savingsTransactions, '2026-10'),
    [savingsTransactions]
  );

  const activeBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.status !== 'Delivered' && b.status !== 'Completed' && b.status !== 'Cancelled'
      ),
    [bookings]
  );

  const handleOpenService = (
    service: ActiveServiceView,
    options?: {
      foodQuery?: string;
      restaurantId?: string;
      pickDropMode?: 'p2p' | 'flexible';
      isParcel?: boolean;
    }
  ) => {
    setActiveTab('home');
    if (service === 'foods') {
      setFoodSearchSeed(options?.foodQuery || '');
      setFoodRestaurantSeed(options?.restaurantId);
    } else if (service === 'pickdrop') {
      setPickDropModeSeed(options?.pickDropMode || 'p2p');
      setPickDropParcelSeed(Boolean(options?.isParcel));
    }
    setActiveService(service);
  };

  const handleNavigateMainTab = (tab: MainTab) => {
    setActiveService('none');
    setActiveTab(tab);
  };

  const handleAddToCart = (newItem: CartItem) => {
    setCart((prev) => {
      // If item from a different restaurant, replace or append cleanly
      const existingIdx = prev.findIndex((i) => i.cartItemId === newItem.cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + newItem.quantity,
        };
        return updated;
      }
      return [...prev, newItem];
    });
    showToast(`Added ${newItem.foodItem.name} (${newItem.portion}) to cart`);
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCompleteFoodOrder = (
    newOrder: ActivityBooking,
    savingsCreditLKR: number,
    eligibleBaseLKR: number
  ) => {
    setBookings((prev) => [newOrder, ...prev]);
    setCart([]);

    if (savingsCreditLKR > 0) {
      const creditTx: SavingsTransaction = {
        id: `SAV-${Math.floor(1000 + Math.random() * 8999)}`,
        type: 'credit_order',
        title: `10% Savings · ${newOrder.title}`,
        referenceId: newOrder.id,
        date: '2026-10-21',
        eligibleBaseAmountLKR: eligibleBaseLKR,
        amountLKR: savingsCreditLKR,
        status: 'Completed',
      };
      setSavingsTransactions((prev) => [creditTx, ...prev]);
    }
    showToast(
      `Order ${newOrder.id} confirmed! +LKR ${savingsCreditLKR} credited to your 10% Savings Wallet.`
    );
  };

  const handleCompleteRideBooking = (
    newBooking: ActivityBooking,
    savingsCreditLKR: number,
    eligibleBaseLKR: number
  ) => {
    setBookings((prev) => [newBooking, ...prev]);

    if (savingsCreditLKR > 0) {
      const creditTx: SavingsTransaction = {
        id: `SAV-${Math.floor(1000 + Math.random() * 8999)}`,
        type: 'credit_ride',
        title: `10% Savings · ${newBooking.serviceType}`,
        referenceId: newBooking.id,
        date: '2026-10-21',
        eligibleBaseAmountLKR: eligibleBaseLKR,
        amountLKR: savingsCreditLKR,
        status: 'Completed',
      };
      setSavingsTransactions((prev) => [creditTx, ...prev]);
    }
    showToast(
      `${newBooking.serviceType} ${newBooking.id} booked! +LKR ${savingsCreditLKR} added to Savings.`
    );
  };

  const handleWithdrawToBank = (amountLKR: number, bankAccount: BankAccount) => {
    const withdrawTx: SavingsTransaction = {
      id: `SAV-${Math.floor(1000 + Math.random() * 8999)}`,
      type: 'withdrawal_bank',
      title: `Monthly Bank Transfer · ${bankAccount.bankName}`,
      referenceId: `WDR-GD-${Math.floor(100 + Math.random() * 899)}`,
      date: '2026-10-21',
      amountLKR: -Math.abs(amountLKR),
      status: 'Completed',
      recipientDetails: `${bankAccount.bankName} (${bankAccount.accountNumberMasked})`,
    };
    setSavingsTransactions((prev) => [withdrawTx, ...prev]);
    setProfile((prev) => ({
      ...prev,
      lastWithdrawalMonth: '2026-10',
    }));
    showToast(`Transferred LKR ${amountLKR.toLocaleString()} to ${bankAccount.bankName}`);
  };

  const handleDonateToCharity = (amountLKR: number, charity: CharityOrganization) => {
    const donateTx: SavingsTransaction = {
      id: `SAV-${Math.floor(1000 + Math.random() * 8999)}`,
      type: 'donation_charity',
      title: `Social Cause Donation · ${charity.name}`,
      referenceId: `DON-GD-${Math.floor(100 + Math.random() * 899)}`,
      date: '2026-10-21',
      amountLKR: -Math.abs(amountLKR),
      status: 'Completed',
      recipientDetails: `${charity.name} (${charity.registrationNo})`,
    };
    setSavingsTransactions((prev) => [donateTx, ...prev]);
    showToast(`Donated LKR ${amountLKR.toLocaleString()} to ${charity.name}!`);
  };

  const handleAdvanceBookingStatus = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        const nextStep = Math.min(5, b.progressStep + 1);
        const statusMap: Record<number, BookingStatus> = {
          1: 'Confirmed',
          2: 'Preparing',
          3: 'Rider Assigned',
          4: 'On the Way',
          5: b.serviceType === 'Food Delivery' ? 'Delivered' : 'Completed',
        };
        const nextStatus = statusMap[nextStep] || 'Completed';
        return {
          ...b,
          progressStep: nextStep,
          status: nextStatus,
          etaMins: nextStep === 5 ? 0 : Math.max(2, b.etaMins - 4),
        };
      })
    );
    showToast(`Updated live status for booking ${bookingId}`);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'Cancelled',
              paymentStatus: 'Refunded',
              etaMins: 0,
            }
          : b
      )
    );
    showToast(`Booking ${bookingId} cancelled & marked for full refund.`);
  };

  const handleResetDemoData = () => {
    Object.values(STORAGE_KEYS).forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
    setCart([]);
    setBookings(INITIAL_ACTIVITIES);
    setSavingsTransactions(INITIAL_SAVINGS_LEDGER);
    setOffers(INITIAL_OFFERS);
    setProfile(INITIAL_CUSTOMER_PROFILE);
    setBookmarkedIds(['rest-pilawoos', 'rest-upalis']);
    setAppliedOffer(INITIAL_OFFERS[0]);
    showToast('All GO DUDE Customer App demo data reset to initial state.');
  };

  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#e8eef5] text-slate-900 flex flex-col">
      {/* Top Bar Contract (3 zones separated by gap-8 on desktop) */}
      <header className="hidden lg:flex items-center justify-between gap-8 px-8 py-3.5 bg-[#071529] text-white border-b border-slate-800">
        {/* Zone 1: Single brand wordmark */}
        <button
          type="button"
          onClick={() => {
            setActiveService('none');
            setActiveTab('home');
          }}
          className="text-xl font-display font-extrabold tracking-tight text-sky-400 whitespace-nowrap shrink-0"
        >
          GO dUDe
        </button>

        {/* Zone 2: 4–5 concise single-line nav links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => {
              setActiveService('none');
              setActiveTab('home');
            }}
            className="hover:text-white hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleOpenService('foods', { foodQuery: 'Chicken Kottu' })}
            className="hover:text-white hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Foods
          </button>
          <button
            type="button"
            onClick={() => handleOpenService('pickdrop', { pickDropMode: 'p2p' })}
            className="hover:text-white hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Pick & Drop
          </button>
          <button
            type="button"
            onClick={() => handleOpenService('savings')}
            className="hover:text-white hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Savings Wallet
          </button>
          <button
            type="button"
            onClick={() => handleNavigateMainTab('activity')}
            className="hover:text-white hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Activity ({activeBookings.length})
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => handleOpenService('foods', { foodQuery: 'Chicken Kottu' })}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            Order Chicken Kottu
          </button>
        </div>
      </header>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-sky-400/30 text-xs font-semibold flex items-center justify-between gap-2">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-sky-300 hover:text-white text-[11px] font-bold shrink-0"
          >
            OK
          </button>
        </div>
      )}

      {/* Responsive Workspace Container: Full-width Mobile on <lg, Dual-Phone Companion Showcase on Desktop >=lg */}
      <main className="flex-1 w-full max-w-7xl mx-auto lg:py-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* PRIMARY INTERACTIVE MOBILE APP SCREEN (Left / Center Column) */}
        <div className="lg:col-span-7 xl:col-span-7 w-full max-w-md lg:max-w-none mx-auto bg-[#f4f7fb] lg:rounded-[38px] lg:border-[8px] lg:border-[#0f172a] lg:shadow-2xl overflow-hidden h-[100dvh] lg:h-[840px] max-h-[100dvh] lg:max-h-[840px] flex flex-col relative shadow-xl">
          {/* Scrollable View Body: Smooth internal scroll container under sticky headers */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {activeService === 'foods' ? (
              <FoodsView
                initialQuery={foodSearchSeed}
                initialRestaurantId={foodRestaurantSeed}
                restaurants={RESTAURANTS}
                foodItems={FOOD_ITEMS}
                cart={cart}
                appliedOffer={appliedOffer}
                offers={offers}
                currentLocation={currentLocation}
                profile={profile}
                onAddToCart={handleAddToCart}
                onUpdateCartQuantity={handleUpdateCartQuantity}
                onClearCart={() => setCart([])}
                onApplyOffer={setAppliedOffer}
                onCompleteFoodOrder={handleCompleteFoodOrder}
                onBackHome={() => setActiveService('none')}
                onGoToActivity={() => handleNavigateMainTab('activity')}
              />
            ) : activeService === 'pickdrop' ? (
              <PickDropView
                initialMode={pickDropModeSeed}
                initialIsParcel={pickDropParcelSeed}
                locations={SRI_LANKA_LOCATIONS}
                currentLocation={currentLocation}
                vehicles={VEHICLE_OPTIONS}
                onCompleteRideBooking={handleCompleteRideBooking}
                onBackHome={() => setActiveService('none')}
                onGoToActivity={() => handleNavigateMainTab('activity')}
              />
            ) : activeService === 'savings' ? (
              <SavingsView
                transactions={savingsTransactions}
                charities={CHARITY_ORGANIZATIONS}
                profile={profile}
                onWithdrawToBank={handleWithdrawToBank}
                onDonateToCharity={handleDonateToCharity}
                onBackHome={() => setActiveService('none')}
              />
            ) : activeTab === 'home' ? (
              <HomeView
                currentLocation={currentLocation}
                locations={SRI_LANKA_LOCATIONS}
                onSelectLocation={(locId) =>
                  setProfile((prev) => ({ ...prev, selectedLocationId: locId }))
                }
                restaurants={RESTAURANTS}
                activeBookings={activeBookings}
                totalBalanceLKR={savingsSummary.totalBalanceLKR}
                currentMonthSavedLKR={savingsSummary.currentMonthSavedLKR}
                offers={offers}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={(rId) =>
                  setBookmarkedIds((prev) =>
                    prev.includes(rId) ? prev.filter((x) => x !== rId) : [...prev, rId]
                  )
                }
                onOpenService={handleOpenService}
                onNavigateTab={handleNavigateMainTab}
                onApplyOfferCode={(off) => {
                  setAppliedOffer(off);
                  showToast(`Promo voucher ${off.promoCode} (${off.discountLabel}) applied!`);
                }}
              />
            ) : activeTab === 'activity' ? (
              <ActivityView
                bookings={bookings}
                currentLocation={currentLocation}
                onAdvanceBookingStatus={handleAdvanceBookingStatus}
                onCancelBooking={handleCancelBooking}
                onBookNewService={(srv) => handleOpenService(srv)}
              />
            ) : activeTab === 'offers' ? (
              <OffersView
                offers={offers}
                membershipPlans={BUSINESS_MEMBERSHIP_PLANS}
                appliedOffer={appliedOffer}
                onClaimOffer={(off) => {
                  setAppliedOffer(off);
                  showToast(`Applied ${off.promoCode} (${off.discountLabel}) to your checkout!`);
                }}
                onPublishDemoOffer={(newOffer, plan) => {
                  setOffers((prev) => [newOffer, ...prev]);
                  showToast(
                    `Published demo offer "${newOffer.title}" under ${plan.name} plan.`
                  );
                }}
              />
            ) : (
              <ProfileView
                profile={profile}
                bookings={bookings}
                transactions={savingsTransactions}
                onUpdateProfile={setProfile}
                onResetDemoData={handleResetDemoData}
              />
            )}
          </div>

          {/* Bottom Navigation Bar (4 Main Tabs: Home, Activity, Offers, Profile) */}
          <nav
            aria-label="Customer App Bottom Navigation"
            className="shrink-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 grid grid-cols-4 items-center shadow-lg w-full"
          >
            {(
              [
                { id: 'home', label: 'Home', icon: Home },
                {
                  id: 'activity',
                  label: `Activity (${activeBookings.length})`,
                  icon: ClipboardList,
                },
                { id: 'offers', label: 'Offers', icon: Tag },
                { id: 'profile', label: 'Profile', icon: User },
              ] as const
            ).map((tab) => {
              const isSelected = activeService === 'none' && activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleNavigateMainTab(tab.id)}
                  className={`min-h-[46px] flex flex-col items-center justify-center rounded-xl transition-colors ${
                    isSelected
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                  <tab.icon
                    className={`w-5 h-5 ${isSelected ? 'stroke-[2.5px] text-blue-600' : ''}`}
                  />
                  <span className="text-[11px] mt-0.5 whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* DESKTOP COMPANION CONTROL DECK & LIVE SECOND SCREEN (Right Column on >=lg) */}
        <aside className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col gap-5 sticky top-6">
          {/* Quick Service Launcher Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-base text-slate-900">
                  GO DUDE Sri Lanka · Quick Service Deck
                </h2>
                <p className="text-xs text-slate-500">
                  Switch between the 3 core services & 4 bottom navigation tabs
                </p>
              </div>
              <Compass className="w-5 h-5 text-blue-600" />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenService('foods', { foodQuery: 'Chicken Kottu' })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeService === 'foods'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4 text-emerald-600 mb-1.5" />
                <div className="text-xs font-bold">Foods</div>
                <div className="text-[10px] text-slate-500">Green & Yellow</div>
              </button>

              <button
                type="button"
                onClick={() => handleOpenService('pickdrop', { pickDropMode: 'p2p' })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeService === 'pickdrop'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <Navigation className="w-4 h-4 text-blue-600 mb-1.5" />
                <div className="text-xs font-bold">Pick & Drop</div>
                <div className="text-[10px] text-slate-500">P2P & Flexible</div>
              </button>

              <button
                type="button"
                onClick={() => handleOpenService('savings')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeService === 'savings'
                    ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <Wallet className="w-4 h-4 text-orange-600 mb-1.5" />
                <div className="text-xs font-bold">10% Savings</div>
                <div className="text-[10px] text-slate-500">Bank & Charity</div>
              </button>
            </div>

            {/* Active Cart & Voucher Status */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-900">
                    Shopping Cart ({totalCartItems} items)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Active Voucher: {appliedOffer ? appliedOffer.promoCode : 'None'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenService('foods')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Open Cart
              </button>
            </div>
          </div>

          {/* Live Companion Savings & Multi-Booking Overview Card */}
          <div className="bg-gradient-to-br from-[#071529] via-[#0c2342] to-[#1e3a8a] text-white rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <GoDudeBrandLogo size="sm" />
              <span className="text-xs font-mono-num text-sky-300">
                Account {profile.accountId}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 border border-white/15 rounded-2xl p-3">
                <div className="text-[11px] text-sky-200">10% Savings Balance</div>
                <div className="font-mono-num font-extrabold text-lg text-amber-300 mt-0.5">
                  LKR {savingsSummary.totalBalanceLKR.toLocaleString()}
                </div>
                <div className="text-[10px] text-sky-200/80 mt-0.5">
                  +LKR {savingsSummary.currentMonthSavedLKR.toLocaleString()} this month
                </div>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-2xl p-3">
                <div className="text-[11px] text-sky-200">Social Donations</div>
                <div className="font-mono-num font-extrabold text-lg text-emerald-300 mt-0.5">
                  LKR {savingsSummary.totalDonatedLKR.toLocaleString()}
                </div>
                <div className="text-[10px] text-sky-200/80 mt-0.5">
                  {CHARITY_ORGANIZATIONS.length} Verified SL Charities
                </div>
              </div>
            </div>

            {/* Active Multi-Booking Live Feed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sky-200">
                  Simultaneous Active Bookings ({activeBookings.length})
                </span>
                <button
                  type="button"
                  onClick={() => handleNavigateMainTab('activity')}
                  className="text-sky-300 hover:underline font-semibold"
                >
                  Manage All →
                </button>
              </div>
              {activeBookings.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl bg-slate-900/75 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <div className="font-bold text-white truncate">{b.title}</div>
                    <div className="text-[11px] text-sky-200/80">
                      {b.id} · {b.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdvanceBookingStatus(b.id)}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 text-[11px] font-semibold shrink-0"
                  >
                    Step +1
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-sky-200">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Local Storage Persistence Active
              </span>
              <button
                type="button"
                onClick={handleResetDemoData}
                className="text-rose-300 hover:text-rose-200 underline font-semibold"
              >
                Reset Demo State
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
