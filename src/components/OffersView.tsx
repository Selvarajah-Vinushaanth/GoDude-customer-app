import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Info,
  MapPin,
  Megaphone,
  Plus,
  Search,
  Sparkles,
  Store,
  Tag,
  X,
} from 'lucide-react';
import {
  BusinessMembershipPlan,
  PromotionalOffer,
} from '../types/godude';

interface OffersViewProps {
  offers: PromotionalOffer[];
  membershipPlans: BusinessMembershipPlan[];
  appliedOffer: PromotionalOffer | null;
  onClaimOffer: (offer: PromotionalOffer) => void;
  onPublishDemoOffer: (newOffer: PromotionalOffer, selectedPlan: BusinessMembershipPlan) => void;
}

export const OffersView: React.FC<OffersViewProps> = ({
  offers,
  membershipPlans,
  appliedOffer,
  onClaimOffer,
  onPublishDemoOffer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'browse' | 'advertise'>('browse');

  // Business Membership & Ad Submission Form State
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    membershipPlans.find((p) => p.recommended)?.id || membershipPlans[0].id
  );
  const [businessName, setBusinessName] = useState('');
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCategory, setOfferCategory] = useState<
    'Restaurants' | 'Hotels & Stays' | 'Local Businesses'
  >('Restaurants');
  const [offerCity, setOfferCity] = useState<
    'All Sri Lanka' | 'Colombo' | 'Kandy' | 'Galle' | 'Negombo'
  >('Colombo');
  const [discountLabel, setDiscountLabel] = useState('25% OFF');
  const [promoCode, setPromoCode] = useState('COLOMBO25');
  const [offerDescription, setOfferDescription] = useState('');
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [adFormError, setAdFormError] = useState<string | null>(null);
  const [publishedConfirmation, setPublishedConfirmation] = useState<{
    offer: PromotionalOffer;
    plan: BusinessMembershipPlan;
  } | null>(null);

  const categories = ['All', 'Restaurants', 'Hotels & Stays', 'Local Businesses', 'Ride Deals'];
  const cities = ['All', 'Colombo', 'Kandy', 'Galle', 'Negombo'];

  const filteredOffers = offers.filter((off) => {
    if (selectedCategory !== 'All' && off.category !== selectedCategory) return false;
    if (
      selectedCity !== 'All' &&
      off.city !== 'All Sri Lanka' &&
      off.city !== selectedCity
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        off.title.toLowerCase().includes(q) ||
        off.businessName.toLowerCase().includes(q) ||
        off.promoCode.toLowerCase().includes(q) ||
        off.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAdSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setAdFormError(null);

    if (!businessName.trim() || !offerTitle.trim() || !promoCode.trim()) {
      setAdFormError('Please enter your business name, offer headline, and promo code.');
      return;
    }

    const chosenPlan =
      membershipPlans.find((p) => p.id === selectedPlanId) || membershipPlans[0];

    const createdOffer: PromotionalOffer = {
      id: `off-demo-${Date.now()}`,
      title: offerTitle.trim(),
      businessName: businessName.trim(),
      category: offerCategory,
      city: offerCity,
      discountLabel: discountLabel.trim() || '20% OFF',
      promoCode: promoCode.trim().toUpperCase(),
      description:
        offerDescription.trim() ||
        `Sponsored member promotion from ${businessName.trim()} valid in ${offerCity}.`,
      minSpendLKR: 1200,
      maxDiscountLKR: 750,
      validUntil,
      isSponsored: true,
      accentColor: '#2563eb',
    };

    onPublishDemoOffer(createdOffer, chosenPlan);
    setPublishedConfirmation({ offer: createdOffer, plan: chosenPlan });
    setBusinessName('');
    setOfferTitle('');
    setOfferDescription('');
  };

  return (
    <div className="relative min-h-full pb-28">
      {/* ISSUE 1 FIX: FIXED STICKY TOP HEADER WITH FROSTED GLASS */}
      <header className="sticky top-0 z-30 glass-header px-4 pt-3.5 pb-3 text-white rounded-b-[24px] shadow-lg transition-all space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-extrabold text-base tracking-tight">
              Offers & Promotions
            </h1>
            <p className="text-[10px] text-sky-200">
              Vouchers, hotel deals & sponsored partner discounts
            </p>
          </div>
          <Tag className="w-5 h-5 text-sky-300" />
        </div>

        {/* ISSUE 6 FIX: CLEAR TAB LABELS EXPLAINING CUSTOMER DEALS VS MERCHANT ADVERTISING */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950/35 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'browse'
                ? 'bg-white text-blue-950 shadow-xs'
                : 'text-sky-100 hover:bg-white/10'
            }`}
          >
            Customer Deals ({offers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('advertise')}
            className={`py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
              activeTab === 'advertise'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-sky-100 hover:bg-white/10'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Merchant Portal (Advertise)</span>
          </button>
        </div>

        {activeTab === 'browse' && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offers, restaurants, hotels, promo codes..."
              aria-label="Search promotional offers"
              className="w-full h-9 pl-9 pr-4 rounded-full bg-white text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none shadow-xs"
            />
          </div>
        )}
      </header>

      {/* TAB 1: BROWSE CUSTOMER OFFERS */}
      {activeTab === 'browse' ? (
        <div className="px-4 pt-3.5 space-y-4">
          {/* Category & City Filters (Scrollbars suppressed, Issue 2 fix) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 pr-1 shrink-0">
                <MapPin className="w-3 h-3 text-blue-600" /> City:
              </span>
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                    selectedCity === city
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-200/80 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Promotional Cards List (Issue 4 Fix: Roomy cards with no text clipping) */}
          <div className="space-y-3">
            {filteredOffers.map((offer) => {
              const isClaimed = appliedOffer?.id === offer.id;
              return (
                <div
                  key={offer.id}
                  className="glass-card rounded-3xl p-4 space-y-2.5 shadow-sm hover:shadow-md transition-all border border-slate-200/90"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-blue-700 truncate">
                        {offer.businessName} · {offer.category} · {offer.city}
                        {offer.isSponsored ? ' · Sponsored' : ''}
                      </div>
                      <h3 className="font-display font-extrabold text-base text-slate-900 mt-0.5">
                        {offer.title}
                      </h3>
                    </div>
                    <div className="shrink-0 bg-blue-600 text-white font-mono-num font-extrabold text-xs px-2.5 py-1.5 rounded-xl shadow-xs">
                      {offer.discountLabel}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{offer.description}</p>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-slate-500">
                      Code: <strong className="font-mono-num font-bold text-slate-900">{offer.promoCode}</strong>{' '}
                      · Min LKR {offer.minSpendLKR} · Valid {offer.validUntil}
                    </div>

                    <button
                      type="button"
                      onClick={() => onClaimOffer(offer)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors shadow-xs ${
                        isClaimed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {isClaimed ? '✓ Voucher Applied' : 'Apply Voucher'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TAB 2: MERCHANT MEMBERSHIP & ADVERTISING (ISSUE 6 EXPLANATION & PORTAL) */
        <div className="px-4 pt-3.5 space-y-4">
          {/* Issue 6 Educational Clarification Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl p-3.5 text-xs text-blue-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Why is this tab here?</span>
            </div>
            <p className="leading-relaxed text-[11px] text-blue-900/90">
              Per the GO DUDE platform brief, Sri Lankan restaurants, boutique hotels, and local
              businesses can publish sponsored offers to customer feeds through a paid monthly
              membership. As a business owner, you can select a tier and test publishing a sponsored
              coupon to the app!
            </p>
          </div>

          {/* Membership Tiers */}
          <div className="space-y-2.5">
            <h2 className="font-display font-bold text-sm text-slate-900">
              1. Merchant Subscription Tier
            </h2>
            {membershipPlans.map((plan) => {
              const selected = plan.id === selectedPlanId;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all space-y-2 ${
                    selected
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display font-bold text-sm text-slate-900">
                        {plan.name}
                      </span>
                      {plan.recommended && (
                        <span className="ml-2 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          ★ Most Popular
                        </span>
                      )}
                    </div>
                    <div className="font-mono-num font-extrabold text-sm text-blue-700">
                      LKR {plan.monthlyPriceLKR.toLocaleString()}/mo
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {plan.adSlotsPerMonth} Ad Campaigns/mo · Est. Reach: {plan.reachEstimate}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 pt-1">
                    {plan.features.map((f) => (
                      <div key={f} className="truncate">
                        ✓ {f}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Advertisement Submission Form */}
          <form
            onSubmit={handleAdSubmission}
            className="glass-card rounded-2xl p-4 space-y-3 shadow-xs border border-slate-200/90"
          >
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>2. Submit Sponsored Promotion</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hotel / Restaurant / Business Name *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Cinnamon Lakeside Colombo or Kandy Spice Hub"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={offerCategory}
                  onChange={(e) =>
                    setOfferCategory(
                      e.target.value as 'Restaurants' | 'Hotels & Stays' | 'Local Businesses'
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Restaurants">Restaurants</option>
                  <option value="Hotels & Stays">Hotels & Stays</option>
                  <option value="Local Businesses">Local Businesses</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target City
                </label>
                <select
                  value={offerCity}
                  onChange={(e) =>
                    setOfferCity(
                      e.target.value as
                        | 'All Sri Lanka'
                        | 'Colombo'
                        | 'Kandy'
                        | 'Galle'
                        | 'Negombo'
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Negombo">Negombo</option>
                  <option value="All Sri Lanka">All Sri Lanka</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Offer Headline *
              </label>
              <input
                type="text"
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                placeholder="e.g., 30% Off Weekend Seafood Buffet & High Tea"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discount Label
                </label>
                <input
                  type="text"
                  value={discountLabel}
                  onChange={(e) => setDiscountLabel(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Promo Code *
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-mono-num uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Terms
              </label>
              <input
                type="text"
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
                placeholder="Describe discount details and terms..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            {adFormError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {adFormError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Confirm Demo Membership & Publish Offer</span>
            </button>
          </form>
        </div>
      )}

      {/* Confirmation Modal */}
      {publishedConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900">
                    Offer Published to Feed!
                  </h3>
                  <p className="text-xs text-slate-500">
                    {publishedConfirmation.plan.name} Campaign Active
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPublishedConfirmation(null);
                  setActiveTab('browse');
                }}
                aria-label="Close ad confirmation"
                className="p-1.5 rounded-full bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
              <div className="font-bold text-slate-900">{publishedConfirmation.offer.title}</div>
              <div className="text-slate-600">
                Business: <strong>{publishedConfirmation.offer.businessName}</strong> · Code:{' '}
                <strong className="font-mono-num">{publishedConfirmation.offer.promoCode}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPublishedConfirmation(null);
                setActiveTab('browse');
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              View in Customer Offers Feed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
