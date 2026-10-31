import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  Minus,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import {
  ActivityBooking,
  CartItem,
  CustomerProfile,
  FoodCustomizationOption,
  FoodItem,
  PromotionalOffer,
  Restaurant,
  SriLankaLocation,
} from '../types/godude';
import {
  calculateCartTotals,
  calculateCustomizedFoodUnitPrice,
  RestaurantSortOption,
  searchRestaurantsByFood,
} from '../utils/calculations';
import { FoodIllustration } from './VisualAssets';

interface FoodsViewProps {
  initialQuery?: string;
  initialRestaurantId?: string;
  restaurants: Restaurant[];
  foodItems: FoodItem[];
  cart: CartItem[];
  appliedOffer: PromotionalOffer | null;
  offers: PromotionalOffer[];
  currentLocation: SriLankaLocation;
  profile: CustomerProfile;
  onAddToCart: (item: CartItem) => void;
  onUpdateCartQuantity: (cartItemId: string, delta: number) => void;
  onClearCart: () => void;
  onApplyOffer: (offer: PromotionalOffer | null) => void;
  onCompleteFoodOrder: (booking: ActivityBooking, savingsCreditLKR: number, eligibleBaseLKR: number) => void;
  onBackHome: () => void;
  onGoToActivity: () => void;
}

export const FoodsView: React.FC<FoodsViewProps> = ({
  initialQuery = '',
  initialRestaurantId,
  restaurants,
  foodItems,
  cart,
  appliedOffer,
  offers,
  currentLocation,
  profile,
  onAddToCart,
  onUpdateCartQuantity,
  onClearCart,
  onApplyOffer,
  onCompleteFoodOrder,
  onBackHome,
  onGoToActivity,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<RestaurantSortOption>('rating');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(
    initialRestaurantId || null
  );
  const [customizingFood, setCustomizingFood] = useState<FoodItem | null>(null);
  const [portion, setPortion] = useState<'Regular' | 'Large'>('Regular');
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium Spicy' | 'Sri Lankan Fiery'>(
    'Medium Spicy'
  );
  const [selectedAddons, setSelectedAddons] = useState<FoodCustomizationOption[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(currentLocation.address);
  const [contactPhone, setContactPhone] = useState(profile.phone);
  const [paymentMethod, setPaymentMethod] = useState<
    'Visa •••• 4242' | 'LankaPay QR' | 'Genie Wallet' | 'Cash on Delivery'
  >('Visa •••• 4242');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrderReceipt, setConfirmedOrderReceipt] = useState<ActivityBooking | null>(null);

  const matchedResults = useMemo(
    () => searchRestaurantsByFood(searchQuery, restaurants, foodItems, sortBy, 'All'),
    [searchQuery, restaurants, foodItems, sortBy]
  );

  const activeRestaurant = useMemo(
    () => restaurants.find((r) => r.id === selectedRestaurantId) || null,
    [restaurants, selectedRestaurantId]
  );

  const activeRestaurantMenu = useMemo(
    () => foodItems.filter((f) => f.restaurantId === selectedRestaurantId),
    [foodItems, selectedRestaurantId]
  );

  const cartRestaurant = useMemo(() => {
    if (cart.length === 0) return activeRestaurant;
    return restaurants.find((r) => r.id === cart[0].restaurantId) || activeRestaurant;
  }, [cart, restaurants, activeRestaurant]);

  const deliveryFeeLKR = cartRestaurant ? cartRestaurant.deliveryFeeLKR : 150;

  const cartTotals = useMemo(
    () => calculateCartTotals(cart, deliveryFeeLKR, appliedOffer),
    [cart, deliveryFeeLKR, appliedOffer]
  );

  const totalCartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  const openCustomizeModal = (food: FoodItem) => {
    setCustomizingFood(food);
    setPortion('Regular');
    setSpiceLevel(food.isSpicy ? 'Sri Lankan Fiery' : 'Medium Spicy');
    setSelectedAddons([]);
    setSpecialInstructions('');
  };

  const handleConfirmAddToCart = () => {
    if (!customizingFood) return;
    const rest = restaurants.find((r) => r.id === customizingFood.restaurantId);
    const unitTotalLKR = calculateCustomizedFoodUnitPrice(
      customizingFood,
      portion,
      selectedAddons.map((a) => a.priceLKR)
    );

    const newItem: CartItem = {
      cartItemId: `${customizingFood.id}-${portion}-${spiceLevel}-${selectedAddons
        .map((a) => a.id)
        .join(',')}`,
      foodItem: customizingFood,
      restaurantId: customizingFood.restaurantId,
      restaurantName: rest?.name || 'GO DUDE Partner Kitchen',
      quantity: 1,
      portion,
      spiceLevel,
      selectedAddons,
      specialInstructions: specialInstructions.trim(),
      unitTotalLKR,
    };

    onAddToCart(newItem);
    setCustomizingFood(null);
  };

  const handlePlaceOrderAndPay = () => {
    if (cart.length === 0 || !deliveryAddress.trim()) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const orderNum = Math.floor(1000 + Math.random() * 8999);
      const newOrder: ActivityBooking = {
        id: `ORD-GD-${orderNum}`,
        serviceType: 'Food Delivery',
        title: `${cart[0].restaurantName}`,
        subtitle: cart.map((c) => `${c.quantity}x ${c.foodItem.name} (${c.portion})`).join(', '),
        createdAt: 'Just now',
        status: 'Preparing',
        paymentMethod,
        paymentStatus: 'Paid (Verified)',
        pickupAddress: cartRestaurant?.address || 'Colombo Partner Kitchen',
        destinationAddress: deliveryAddress,
        subtotalLKR: cartTotals.foodSubtotalLKR,
        deliveryOrServiceFeeLKR: cartTotals.deliveryFeeLKR,
        discountLKR: cartTotals.discountLKR,
        totalPaidLKR: cartTotals.finalPayableLKR,
        savingsEarnedLKR: cartTotals.savingsAllocationLKR,
        etaMins: cartRestaurant?.deliveryTimeMins || 24,
        distanceKm: cartRestaurant?.distanceKm || 1.9,
        driverOrRider: {
          name: 'Kasun Rajapaksha',
          phone: '+94 77 812 4490',
          vehicleName: 'Honda Dio Food Express',
          plateNumber: 'WP BKT-6621',
          rating: 4.95,
        },
        itemsSummary: cart.map(
          (c) =>
            `${c.quantity}x ${c.foodItem.name} (${c.portion}, ${c.spiceLevel}) — LKR ${(
              c.unitTotalLKR * c.quantity
            ).toLocaleString()}`
        ),
        progressStep: 2,
      };

      setIsProcessingPayment(false);
      setShowCheckoutModal(false);
      setConfirmedOrderReceipt(newOrder);
      onCompleteFoodOrder(
        newOrder,
        cartTotals.savingsAllocationLKR,
        cartTotals.eligibleForSavingsLKR
      );
    }, 900);
  };

  const popularDishes = [
    'Chicken Kottu',
    'Cheese Kottu',
    'Biriyani',
    'Fried Rice',
    'Lamprais',
    'Hoppers',
    'Burgers',
    'Isso Wade',
  ];

  return (
    <div className="relative min-h-full pb-36">
      {/* ISSUE 1 FIX: FIXED STICKY TOP GREEN HEADER WITH FROSTED GLASS */}
      <header className="sticky top-0 z-30 bg-[#0e3a1f]/90 backdrop-blur-md border-b border-emerald-500/30 text-white pt-3.5 pb-3 px-4 rounded-b-[24px] shadow-lg transition-all">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <button
            type="button"
            onClick={() => {
              if (selectedRestaurantId) {
                setSelectedRestaurantId(null);
              } else {
                onBackHome();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{selectedRestaurantId ? 'All Restaurants' : 'Home'}</span>
          </button>

          <div className="text-right">
            <span className="font-display font-extrabold text-base tracking-tight text-yellow-300">
              GO DUDE Foods
            </span>
            <div className="text-[10px] text-emerald-100 font-medium">
              Fresh · +10% Auto Savings
            </div>
          </div>
        </div>

        {/* Dish Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-emerald-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (selectedRestaurantId) setSelectedRestaurantId(null);
            }}
            placeholder="Search dish e.g. Chicken Kottu, Cheese Kottu, Biriyani..."
            aria-label="Search food item by name"
            className="w-full h-10 pl-9 pr-9 rounded-full bg-white text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear food search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Dish Filter Chips (No scrollbars) */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-2.5 pt-0.5 pb-0.5">
          {popularDishes.map((dish) => {
            const active = searchQuery.toLowerCase() === dish.toLowerCase();
            return (
              <button
                key={dish}
                type="button"
                onClick={() => {
                  setSearchQuery(active ? '' : dish);
                  setSelectedRestaurantId(null);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 transition-all ${
                  active
                    ? 'bg-yellow-400 text-slate-950 shadow-sm'
                    : 'bg-emerald-950/60 text-emerald-100 hover:bg-emerald-950/90 border border-emerald-500/20'
                }`}
              >
                {dish}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Body: Restaurant List OR Selected Restaurant Menu */}
      {!activeRestaurant ? (
        <div className="px-4 pt-3.5 space-y-4">
          {/* Sort Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="text-xs font-bold text-slate-800">
              {searchQuery ? (
                <span>
                  Dishes matching <strong className="text-emerald-700 font-extrabold">“{searchQuery}”</strong> ({matchedResults.length})
                </span>
              ) : (
                <span>All Kitchens ({matchedResults.length})</span>
              )}
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
              {(
                [
                  { id: 'rating', label: 'Top Rated ★' },
                  { id: 'deliveryTime', label: 'Fastest' },
                  { id: 'price', label: 'Lowest Price' },
                  { id: 'distance', label: 'Nearest' },
                ] as { id: RestaurantSortOption; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSortBy(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                    sortBy === opt.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Restaurant Results Ranked by Rating (Issue 4 Fix: Full-width clean card layout without wrapping) */}
          {matchedResults.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2.5 shadow-sm">
              <div className="text-sm font-bold text-slate-800">
                No restaurants found for “{searchQuery}”
              </div>
              <p className="text-xs text-slate-500">
                Try searching for Chicken Kottu, Cheese Kottu, Biriyani, Fried Rice, or Lamprais.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('Chicken Kottu')}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
              >
                Search Chicken Kottu
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {matchedResults.map(({ restaurant, matchingItems, lowestMatchingPriceLKR }, index) => {
                const topMatchedItem = matchingItems[0];
                return (
                  <div
                    key={restaurant.id}
                    className="glass-card rounded-3xl p-3.5 space-y-3 shadow-sm hover:shadow-md transition-all border border-slate-200/80"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRestaurantId(restaurant.id)}
                        className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 relative shadow-inner"
                      >
                        <FoodIllustration type={topMatchedItem?.illustrationType || restaurant.illustrationType} />
                        <div className="absolute bottom-1 left-1 right-1 bg-black/80 text-yellow-300 text-[9px] font-mono-num font-bold text-center py-0.5 rounded">
                          From LKR {lowestMatchingPriceLKR.toLocaleString()}
                        </div>
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setSelectedRestaurantId(restaurant.id)}
                              className="text-left font-display font-extrabold text-sm text-slate-900 hover:text-emerald-700 block truncate"
                            >
                              {index + 1}. {restaurant.name}
                            </button>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {restaurant.tagline}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span className="font-mono-num font-bold text-xs text-slate-900">
                              {restaurant.rating.toFixed(1)}
                            </span>
                            <span className="text-[9px] text-slate-500">
                              ({restaurant.reviewCount})
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 mt-1.5">
                          <span className="font-bold text-emerald-700">
                            {restaurant.isOpen ? 'Open Now' : 'Closed'}
                          </span>
                          <span>·</span>
                          <span>{restaurant.deliveryTimeMins} mins</span>
                          <span>·</span>
                          <span>LKR {restaurant.deliveryFeeLKR} fee</span>
                          <span>·</span>
                          <span>{restaurant.distanceKm} km</span>
                        </div>
                      </div>
                    </div>

                    {/* Clean Full-Width Matched Food Item Bar */}
                    {topMatchedItem && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {topMatchedItem.name}
                          </div>
                          <div className="text-[11px] font-mono-num font-semibold text-emerald-700 mt-0.5">
                            LKR {topMatchedItem.priceLKR.toLocaleString()} · +LKR{' '}
                            {Math.round(topMatchedItem.priceLKR * 0.1)} Saved
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openCustomizeModal(topMatchedItem)}
                            className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap shadow-xs"
                          >
                            + Add Item
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRestaurantId(restaurant.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors whitespace-nowrap"
                          >
                            Full Menu
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Restaurant Menu View */
        <div className="px-4 pt-3.5 space-y-4">
          <div className="glass-card rounded-3xl p-4 shadow-sm space-y-2 border border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-extrabold text-lg text-slate-900">
                  {activeRestaurant.name}
                </h2>
                <p className="text-xs text-slate-600">{activeRestaurant.tagline}</p>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{activeRestaurant.address}</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="inline-flex items-center gap-1 font-mono-num font-bold text-sm text-slate-900">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{activeRestaurant.rating.toFixed(1)}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {activeRestaurant.reviewCount} reviews
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600">
              <span>
                Delivery: <strong>{activeRestaurant.deliveryTimeMins} mins</strong> · Fee:{' '}
                <strong>LKR {activeRestaurant.deliveryFeeLKR}</strong> · Distance:{' '}
                <strong>{activeRestaurant.distanceKm} km</strong>
              </span>
              {activeRestaurant.featuredPromo && (
                <span className="font-bold text-emerald-700">
                  ★ {activeRestaurant.featuredPromo}
                </span>
              )}
            </div>
          </div>

          <h3 className="font-display font-bold text-base text-slate-900">
            Menu Dishes ({activeRestaurantMenu.length})
          </h3>

          <div className="space-y-3">
            {activeRestaurantMenu.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-3xl p-3.5 flex items-start gap-3.5 shadow-xs border border-slate-200/80"
              >
                <div className="w-22 h-22 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                  <FoodIllustration type={item.illustrationType} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                    {item.isSpicy && (
                      <span className="text-[10px] font-bold text-red-600 flex items-center gap-0.5 shrink-0 bg-red-50 px-1.5 py-0.5 rounded-full">
                        <Flame className="w-3 h-3" /> Spicy
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {item.category} · {item.prepTimeMins}m prep · {item.calories} kcal
                  </div>

                  <div className="mt-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono-num font-extrabold text-sm text-slate-900">
                        LKR {item.priceLKR.toLocaleString()}
                      </span>
                      <span className="block text-[10px] font-bold text-orange-600">
                        +LKR {Math.round(item.priceLKR * 0.1)} Savings
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCustomizeModal(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Customize</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Sticky Cart Summary Bar (Sitting safely above bottom navigation, Issue 3 fix) */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              type="button"
              onClick={() => setShowCheckoutModal(true)}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white shadow-2xl flex items-center justify-between transition-all border border-emerald-500/30 backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-yellow-400 text-slate-950 font-mono-num font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {totalCartUnits}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">
                    View Cart · {cart[0].restaurantName}
                  </div>
                  <div className="text-[10px] text-emerald-100">
                    Earns +LKR {cartTotals.savingsAllocationLKR} 10% Savings Credit
                  </div>
                </div>
              </div>
              <div className="text-right font-mono-num font-extrabold text-sm text-yellow-300">
                LKR {cartTotals.finalPayableLKR.toLocaleString()} →
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Food Customization Modal */}
      {customizingFood && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-extrabold text-base text-slate-900">
                  {customizingFood.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{customizingFood.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingFood(null)}
                aria-label="Close customization modal"
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Portion Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                1. Choose Portion Size
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(['Regular', 'Large'] as const).map((p) => {
                  const price =
                    customizingFood.priceLKR +
                    (p === 'Large' ? customizingFood.largePriceDeltaLKR : 0);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPortion(p)}
                      className={`p-3 rounded-2xl border text-left transition-colors ${
                        portion === p
                          ? 'border-emerald-600 bg-emerald-50 text-slate-900 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">{p} Portion</div>
                      <div className="text-xs font-mono-num font-semibold text-emerald-700 mt-0.5">
                        LKR {price.toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spice Level */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                2. Spice Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Mild', 'Medium Spicy', 'Sri Lankan Fiery'] as const).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setSpiceLevel(sp)}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-colors ${
                      spiceLevel === sp
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Add-ons */}
            {customizingFood.availableAddons.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  3. Extra Customizations (Optional)
                </label>
                <div className="space-y-2">
                  {customizingFood.availableAddons.map((addon) => {
                    const checked = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => {
                          if (checked) {
                            setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
                          } else {
                            setSelectedAddons([...selectedAddons, addon]);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                          checked
                            ? 'border-emerald-600 bg-emerald-50 font-bold'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>{addon.label}</span>
                        <span className="font-mono-num text-emerald-700 font-bold">
                          +LKR {addon.priceLKR}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kitchen Note */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Special Kitchen Instructions
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g., Extra gravy on the side, less oil..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmAddToCart}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-colors"
            >
              Add to Cart · LKR{' '}
              {calculateCustomizedFoodUnitPrice(
                customizingFood,
                portion,
                selectedAddons.map((a) => a.priceLKR)
              ).toLocaleString()}
            </button>
          </div>
        </div>
      )}

      {/* Cart & Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display font-extrabold text-base text-slate-900">
                  Order Summary & Checkout
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                aria-label="Close checkout"
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Items from {cart[0]?.restaurantName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClearCart();
                    setShowCheckoutModal(false);
                  }}
                  className="text-xs text-red-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {item.foodItem.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.portion} · {item.spiceLevel}
                      {item.selectedAddons.length > 0 &&
                        ` · +${item.selectedAddons.map((a) => a.label).join(', ')}`}
                    </div>
                    <div className="text-xs font-mono-num font-bold text-emerald-700 mt-0.5">
                      LKR {(item.unitTotalLKR * item.quantity).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateCartQuantity(item.cartItemId, -1)}
                      aria-label={`Decrease quantity of ${item.foodItem.name}`}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono-num font-bold text-xs w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateCartQuantity(item.cartItemId, 1)}
                      aria-label={`Increase quantity of ${item.foodItem.name}`}
                      className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Voucher */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Promotional Discount Voucher
              </label>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {offers
                  .filter((o) => o.category === 'Restaurants')
                  .map((off) => {
                    const isApplied = appliedOffer?.id === off.id;
                    return (
                      <button
                        key={off.id}
                        type="button"
                        onClick={() => onApplyOffer(isApplied ? null : off)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                          isApplied
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {off.promoCode} ({off.discountLabel})
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Address & Phone */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Payment Gateway Options */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Online Payment Method (Simulated LKR Gateway)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    'Visa •••• 4242',
                    'LankaPay QR',
                    'Genie Wallet',
                    'Cash on Delivery',
                  ] as const
                ).map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-colors ${
                      paymentMethod === pm
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Food Items Subtotal</span>
                <span className="font-mono-num">
                  LKR {cartTotals.foodSubtotalLKR.toLocaleString()}
                </span>
              </div>
              {cartTotals.discountLKR > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promo Discount ({appliedOffer?.promoCode})</span>
                  <span className="font-mono-num">
                    -LKR {cartTotals.discountLKR.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-mono-num">
                  LKR {cartTotals.deliveryFeeLKR.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Final Payable</span>
                <span className="font-mono-num">
                  LKR {cartTotals.finalPayableLKR.toLocaleString()}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-orange-200/80 bg-orange-50/80 -mx-2 px-2.5 py-2 rounded-xl text-orange-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>+10% Savings Credit:</strong> LKR{' '}
                  <strong className="font-mono-num">{cartTotals.savingsAllocationLKR}</strong> (10%
                  of eligible food amount LKR {cartTotals.eligibleForSavingsLKR}) will be credited
                  to your GO DUDE Savings Wallet.
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handlePlaceOrderAndPay}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isProcessingPayment
                  ? 'Verifying Demo Payment Gateway...'
                  : `Pay LKR ${cartTotals.finalPayableLKR.toLocaleString()} & Confirm Order`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmed Order Digital Receipt Modal */}
      {confirmedOrderReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900">
                    Order Confirmed & Paid!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Payment Verified · Order Sent to Kitchen & Rider
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmedOrderReceipt(null)}
                aria-label="Close receipt"
                className="p-1.5 rounded-full bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID</span>
                <span className="font-mono-num font-bold text-slate-900">
                  {confirmedOrderReceipt.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Restaurant</span>
                <span className="font-bold text-slate-900">{confirmedOrderReceipt.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Rider</span>
                <span className="font-semibold text-slate-800">
                  {confirmedOrderReceipt.driverOrRider?.name} (
                  {confirmedOrderReceipt.driverOrRider?.plateNumber})
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                <span>Total Paid</span>
                <span className="font-mono-num">
                  LKR {confirmedOrderReceipt.totalPaidLKR.toLocaleString()}
                </span>
              </div>
              <div className="bg-orange-100/80 text-orange-900 px-3 py-2 rounded-xl font-semibold flex items-center justify-between">
                <span>+10% Savings Wallet Credit</span>
                <span className="font-mono-num font-extrabold">
                  +LKR {confirmedOrderReceipt.savingsEarnedLKR}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmedOrderReceipt(null)}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continue Ordering
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrderReceipt(null);
                  onGoToActivity();
                }}
                className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Track Live Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
