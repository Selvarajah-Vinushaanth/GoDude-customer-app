import {
  CartItem,
  FoodItem,
  PromotionalOffer,
  Restaurant,
  SavingsTransaction,
  SriLankaLocation,
  VehicleOption,
} from '../types/godude';

export type RestaurantSortOption = 'rating' | 'deliveryTime' | 'distance' | 'price';

export interface MatchedRestaurantResult {
  restaurant: Restaurant;
  matchingItems: FoodItem[];
  lowestMatchingPriceLKR: number;
}

/**
 * Searches food items by query across all restaurants and returns matching restaurants
 * ranked by customer rating (highest first) by default, or by the selected sort option.
 */
export function searchRestaurantsByFood(
  query: string,
  restaurants: Restaurant[],
  foodItems: FoodItem[],
  sortBy: RestaurantSortOption = 'rating',
  cityFilter: string = 'All'
): MatchedRestaurantResult[] {
  const normalizedQuery = query.trim().toLowerCase();

  const results: MatchedRestaurantResult[] = [];

  for (const restaurant of restaurants) {
    if (cityFilter !== 'All' && restaurant.city !== cityFilter) {
      continue;
    }

    const restaurantMenu = foodItems.filter((item) => item.restaurantId === restaurant.id);

    const matchingItems = normalizedQuery
      ? restaurantMenu.filter(
          (item) =>
            item.name.toLowerCase().includes(normalizedQuery) ||
            item.category.toLowerCase().includes(normalizedQuery) ||
            item.description.toLowerCase().includes(normalizedQuery) ||
            restaurant.name.toLowerCase().includes(normalizedQuery) ||
            restaurant.cuisineTags.some((t) => t.toLowerCase().includes(normalizedQuery))
        )
      : restaurantMenu;

    if (matchingItems.length > 0) {
      const lowestMatchingPriceLKR = Math.min(...matchingItems.map((i) => i.priceLKR));
      results.push({
        restaurant,
        matchingItems,
        lowestMatchingPriceLKR,
      });
    }
  }

  return results.sort((a, b) => {
    if (sortBy === 'rating') {
      if (b.restaurant.rating !== a.restaurant.rating) {
        return b.restaurant.rating - a.restaurant.rating;
      }
      return b.restaurant.reviewCount - a.restaurant.reviewCount;
    }
    if (sortBy === 'deliveryTime') {
      return a.restaurant.deliveryTimeMins - b.restaurant.deliveryTimeMins;
    }
    if (sortBy === 'distance') {
      return a.restaurant.distanceKm - b.restaurant.distanceKm;
    }
    if (sortBy === 'price') {
      return a.lowestMatchingPriceLKR - b.lowestMatchingPriceLKR;
    }
    return 0;
  });
}

/**
 * Calculates unit price for a customized food item.
 */
export function calculateCustomizedFoodUnitPrice(
  foodItem: FoodItem,
  portion: 'Regular' | 'Large',
  addonPricesLKR: number[]
): number {
  const base = foodItem.priceLKR + (portion === 'Large' ? foodItem.largePriceDeltaLKR : 0);
  const addonsTotal = addonPricesLKR.reduce((sum, p) => sum + p, 0);
  return Math.round(base + addonsTotal);
}

/**
 * Calculates the 10% automatic savings allocation from an eligible net amount.
 * Per platform rules: 10% of the eligible transaction amount (excluding delivery/platform fees and refunded amounts)
 * is credited to the customer's savings balance.
 * Example: LKR 1,000 eligible payment -> LKR 100 to savings, LKR 900 net settlement.
 */
export function calculateSavingsAllocation(eligibleAmountLKR: number): {
  eligibleAmountLKR: number;
  savingsCreditLKR: number;
  remainingSettlementLKR: number;
} {
  const cleanEligible = Math.max(0, Math.round(eligibleAmountLKR));
  const savingsCreditLKR = Math.round(cleanEligible * 0.1);
  const remainingSettlementLKR = cleanEligible - savingsCreditLKR;

  return {
    eligibleAmountLKR: cleanEligible,
    savingsCreditLKR,
    remainingSettlementLKR,
  };
}

/**
 * Calculates food cart checkout totals including promo discount, delivery fee, and 10% savings credit.
 */
export function calculateCartTotals(
  cartItems: CartItem[],
  deliveryFeeLKR: number,
  appliedOffer?: PromotionalOffer | null
): {
  foodSubtotalLKR: number;
  discountLKR: number;
  deliveryFeeLKR: number;
  finalPayableLKR: number;
  eligibleForSavingsLKR: number;
  savingsAllocationLKR: number;
  netMerchantSettlementLKR: number;
} {
  const foodSubtotalLKR = cartItems.reduce(
    (sum, item) => sum + item.unitTotalLKR * item.quantity,
    0
  );

  if (foodSubtotalLKR === 0) {
    return {
      foodSubtotalLKR: 0,
      discountLKR: 0,
      deliveryFeeLKR: 0,
      finalPayableLKR: 0,
      eligibleForSavingsLKR: 0,
      savingsAllocationLKR: 0,
      netMerchantSettlementLKR: 0,
    };
  }

  let discountLKR = 0;
  if (appliedOffer && foodSubtotalLKR >= appliedOffer.minSpendLKR) {
    // Parse percentage if present or use maxDiscountLKR
    const percentMatch = appliedOffer.discountLabel.match(/(\d+)%/);
    if (percentMatch) {
      const pct = Number(percentMatch[1]) / 100;
      discountLKR = Math.min(Math.round(foodSubtotalLKR * pct), appliedOffer.maxDiscountLKR);
    } else {
      discountLKR = Math.min(appliedOffer.maxDiscountLKR, foodSubtotalLKR);
    }
  }

  const netFoodAmountLKR = Math.max(0, foodSubtotalLKR - discountLKR);
  const finalPayableLKR = netFoodAmountLKR + deliveryFeeLKR;
  const allocation = calculateSavingsAllocation(netFoodAmountLKR);

  return {
    foodSubtotalLKR,
    discountLKR,
    deliveryFeeLKR,
    finalPayableLKR,
    eligibleForSavingsLKR: allocation.eligibleAmountLKR,
    savingsAllocationLKR: allocation.savingsCreditLKR,
    netMerchantSettlementLKR: allocation.remainingSettlementLKR,
  };
}

/**
 * Calculates realistic road distance and travel duration between two Sri Lankan locations.
 */
export function calculateRouteMetrics(
  origin: SriLankaLocation,
  destination: SriLankaLocation
): {
  distanceKm: number;
  estimatedMinutes: number;
} {
  if (origin.id === destination.id) {
    return { distanceKm: 1.5, estimatedMinutes: 6 };
  }

  const R = 6371; // Earth radius km
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;

  // Urban road winding factor 1.32x, minimum 1.8 km
  const distanceKm = Math.max(1.8, Number((straightDistance * 1.32).toFixed(1)));
  // Average urban speed ~24 km/h + 4 mins traffic buffer
  const estimatedMinutes = Math.max(5, Math.round((distanceKm / 24) * 60 + 4));

  return { distanceKm, estimatedMinutes };
}

/**
 * Calculates point-to-point ride or parcel fare based on vehicle pricing rules and distance.
 */
export function calculatePointToPointFare(
  vehicle: VehicleOption,
  distanceKm: number,
  isParcelDelivery: boolean = false
): {
  baseFareLKR: number;
  distanceChargeLKR: number;
  parcelHandlingFeeLKR: number;
  totalFareLKR: number;
  savingsAllocationLKR: number;
} {
  const baseFareLKR = vehicle.baseFareLKR;
  const billableKm = Math.max(0, distanceKm - 1); // First 1km included in base fare
  const distanceChargeLKR = Math.round(billableKm * vehicle.perKmRateLKR);
  const parcelHandlingFeeLKR = isParcelDelivery ? 80 : 0;

  const totalFareLKR = baseFareLKR + distanceChargeLKR + parcelHandlingFeeLKR;
  // Eligible base for savings excludes optional parcel handling fee
  const eligibleBase = baseFareLKR + distanceChargeLKR;
  const { savingsCreditLKR } = calculateSavingsAllocation(eligibleBase);

  return {
    baseFareLKR,
    distanceChargeLKR,
    parcelHandlingFeeLKR,
    totalFareLKR,
    savingsAllocationLKR: savingsCreditLKR,
  };
}

/**
 * Calculates running fare for Mode Two: Flexible Distance-Based Ride.
 */
export function calculateFlexibleRideRunningFare(
  vehicle: VehicleOption,
  travelledKm: number,
  elapsedSeconds: number
): {
  baseFareLKR: number;
  distanceFareLKR: number;
  timeChargeLKR: number;
  runningTotalLKR: number;
  estimatedSavingsLKR: number;
} {
  const baseFareLKR = vehicle.baseFareLKR;
  const distanceFareLKR = Math.round(Math.max(0, travelledKm) * vehicle.perKmRateLKR);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const timeChargeLKR = elapsedMinutes * vehicle.perMinWaitLKR;
  const runningTotalLKR = baseFareLKR + distanceFareLKR + timeChargeLKR;
  const { savingsCreditLKR } = calculateSavingsAllocation(runningTotalLKR);

  return {
    baseFareLKR,
    distanceFareLKR,
    timeChargeLKR,
    runningTotalLKR,
    estimatedSavingsLKR: savingsCreditLKR,
  };
}

/**
 * Summarizes the customer's savings ledger into balance, monthly total, withdrawals, and donations.
 */
export function summarizeSavingsLedger(
  transactions: SavingsTransaction[],
  currentYearMonth: string = '2026-10'
): {
  totalBalanceLKR: number;
  currentMonthSavedLKR: number;
  totalWithdrawnLKR: number;
  totalDonatedLKR: number;
} {
  let totalBalanceLKR = 0;
  let currentMonthSavedLKR = 0;
  let totalWithdrawnLKR = 0;
  let totalDonatedLKR = 0;

  for (const tx of transactions) {
    totalBalanceLKR += tx.amountLKR;

    if (tx.type === 'credit_order' || tx.type === 'credit_ride') {
      if (tx.date.startsWith(currentYearMonth)) {
        currentMonthSavedLKR += tx.amountLKR;
      }
    } else if (tx.type === 'withdrawal_bank') {
      totalWithdrawnLKR += Math.abs(tx.amountLKR);
    } else if (tx.type === 'donation_charity') {
      totalDonatedLKR += Math.abs(tx.amountLKR);
    }
  }

  return {
    totalBalanceLKR: Math.max(0, totalBalanceLKR),
    currentMonthSavedLKR,
    totalWithdrawnLKR,
    totalDonatedLKR,
  };
}

/**
 * Validates whether a customer can withdraw savings to their bank account.
 * Rule: Withdrawals are allowed only ONCE per calendar month, minimum LKR 200, up to available balance.
 */
export function validateMonthlyWithdrawal(
  requestedAmountLKR: number,
  availableBalanceLKR: number,
  lastWithdrawalMonth: string | null,
  currentYearMonth: string = '2026-10'
): {
  valid: boolean;
  error?: string;
} {
  if (lastWithdrawalMonth === currentYearMonth) {
    return {
      valid: false,
      error:
        'Monthly withdrawal limit reached. GO DUDE allows one bank withdrawal per calendar month. Your next eligible withdrawal opens on the 1st of next month.',
    };
  }

  if (!Number.isFinite(requestedAmountLKR) || requestedAmountLKR < 200) {
    return {
      valid: false,
      error: 'Minimum bank withdrawal amount is LKR 200.',
    };
  }

  if (requestedAmountLKR > availableBalanceLKR) {
    return {
      valid: false,
      error: `Requested amount exceeds your available savings balance of LKR ${availableBalanceLKR.toLocaleString()}.`,
    };
  }

  return { valid: true };
}
