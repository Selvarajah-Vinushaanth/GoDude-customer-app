import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  calculateCustomizedFoodUnitPrice,
  calculateFlexibleRideRunningFare,
  calculatePointToPointFare,
  calculateSavingsAllocation,
  searchRestaurantsByFood,
  summarizeSavingsLedger,
  validateMonthlyWithdrawal,
} from './calculations';
import { FoodItem, Restaurant, VehicleOption } from '../types/godude';

const sampleRestaurants: Restaurant[] = [
  {
    id: 'r1',
    name: 'Colombo Spice House',
    tagline: 'Authentic Kottu',
    city: 'Colombo',
    address: 'Galle Rd',
    rating: 4.5,
    reviewCount: 210,
    deliveryTimeMins: 30,
    deliveryFeeLKR: 180,
    distanceKm: 2.4,
    isOpen: true,
    cuisineTags: ['Sri Lankan', 'Kottu'],
    bannerColor: '#16a34a',
    illustrationType: 'kottu',
  },
  {
    id: 'r2',
    name: 'Hotel de Pilawoos',
    tagline: 'Legendary Kottu & Cheese Kottu',
    city: 'Colombo',
    address: 'Bambalapitiya',
    rating: 4.9,
    reviewCount: 1450,
    deliveryTimeMins: 22,
    deliveryFeeLKR: 150,
    distanceKm: 1.6,
    isOpen: true,
    cuisineTags: ['Sri Lankan', 'Kottu', 'Late Night'],
    bannerColor: '#15803d',
    illustrationType: 'cheese_kottu',
  },
];

const sampleFoods: FoodItem[] = [
  {
    id: 'f1',
    restaurantId: 'r1',
    name: 'Roast Chicken Kottu',
    category: 'Kottu & Roti',
    description: 'Godamba roti chopped on hot iron griddle',
    priceLKR: 1150,
    largePriceDeltaLKR: 350,
    prepTimeMins: 18,
    calories: 780,
    illustrationType: 'kottu',
    availableAddons: [{ id: 'a1', label: 'Extra Cheese', priceLKR: 250 }],
  },
  {
    id: 'f2',
    restaurantId: 'r2',
    name: 'Special Chicken Kottu',
    category: 'Kottu & Roti',
    description: 'Signature Bambalapitiya style chicken kottu',
    priceLKR: 1250,
    largePriceDeltaLKR: 400,
    prepTimeMins: 15,
    calories: 820,
    illustrationType: 'kottu',
    availableAddons: [],
  },
];

test('10% savings allocation calculates exact 10% credit and 90% settlement', () => {
  const res = calculateSavingsAllocation(1000);
  assert.equal(res.eligibleAmountLKR, 1000);
  assert.equal(res.savingsCreditLKR, 100);
  assert.equal(res.remainingSettlementLKR, 900);
});

test('searchRestaurantsByFood filters by food item and sorts highest rating first', () => {
  const results = searchRestaurantsByFood('Chicken Kottu', sampleRestaurants, sampleFoods, 'rating');
  assert.equal(results.length, 2);
  // Hotel de Pilawoos (4.9) must come before Colombo Spice House (4.5)
  assert.equal(results[0].restaurant.id, 'r2');
  assert.equal(results[1].restaurant.id, 'r1');
});

test('calculateCustomizedFoodUnitPrice adds portion delta and add-on prices', () => {
  const unitPrice = calculateCustomizedFoodUnitPrice(sampleFoods[0], 'Large', [250, 150]);
  // 1150 + 350 (Large) + 400 (addons) = 1900
  assert.equal(unitPrice, 1900);
});

test('calculateCartTotals computes subtotal, discount, delivery fee, and 10% savings on eligible food amount', () => {
  const cart = [
    {
      cartItemId: 'c1',
      foodItem: sampleFoods[0],
      restaurantId: 'r1',
      restaurantName: 'Colombo Spice House',
      quantity: 2,
      portion: 'Regular' as const,
      spiceLevel: 'Medium Spicy' as const,
      selectedAddons: [],
      specialInstructions: '',
      unitTotalLKR: 1000,
    },
  ];

  const totals = calculateCartTotals(cart, 200, null);
  assert.equal(totals.foodSubtotalLKR, 2000);
  assert.equal(totals.deliveryFeeLKR, 200);
  assert.equal(totals.finalPayableLKR, 2200);
  assert.equal(totals.eligibleForSavingsLKR, 2000);
  assert.equal(totals.savingsAllocationLKR, 200);
  assert.equal(totals.netMerchantSettlementLKR, 1800);
});

test('calculatePointToPointFare and calculateFlexibleRideRunningFare compute accurate LKR ride fares', () => {
  const tuktuk: VehicleOption = {
    id: 'tuktuk',
    name: 'Three-Wheeler (Tuk-Tuk)',
    sinhalaTamilSub: 'ත්‍රීවීලර්',
    description: 'Iconic city breeze ride',
    capacity: '3 Passengers',
    baseFareLKR: 150,
    perKmRateLKR: 95,
    perMinWaitLKR: 10,
    etaMins: 3,
  };

  // 5km ride: 150 base (includes first 1km) + 4km * 95 = 150 + 380 = 530
  const p2p = calculatePointToPointFare(tuktuk, 5, false);
  assert.equal(p2p.totalFareLKR, 530);
  assert.equal(p2p.savingsAllocationLKR, 53);

  // Flexible ride: 3.0 km travelled, 120 seconds (2 mins) -> 150 + 285 + 20 = 455
  const flex = calculateFlexibleRideRunningFare(tuktuk, 3.0, 120);
  assert.equal(flex.runningTotalLKR, 455);
  assert.equal(flex.estimatedSavingsLKR, 46);
});

test('validateMonthlyWithdrawal enforces once-per-calendar-month rule and balance cap', () => {
  // Already withdrew in 2026-10
  const blocked = validateMonthlyWithdrawal(500, 2000, '2026-10', '2026-10');
  assert.equal(blocked.valid, false);

  // Exceeds available balance
  const overBalance = validateMonthlyWithdrawal(3000, 2000, '2026-09', '2026-10');
  assert.equal(overBalance.valid, false);

  // Eligible withdrawal
  const allowed = validateMonthlyWithdrawal(1000, 2000, '2026-09', '2026-10');
  assert.equal(allowed.valid, true);
});

test('summarizeSavingsLedger aggregates credits, withdrawals, and donations properly', () => {
  const summary = summarizeSavingsLedger(
    [
      {
        id: 't1',
        type: 'credit_order',
        title: '10% Savings Credit',
        referenceId: 'ORD-1',
        date: '2026-10-18',
        amountLKR: 500,
        status: 'Completed',
      },
      {
        id: 't2',
        type: 'donation_charity',
        title: 'Suwa Seriya Donation',
        referenceId: 'DON-1',
        date: '2026-10-19',
        amountLKR: -200,
        status: 'Completed',
      },
    ],
    '2026-10'
  );

  assert.equal(summary.totalBalanceLKR, 300);
  assert.equal(summary.currentMonthSavedLKR, 500);
  assert.equal(summary.totalDonatedLKR, 200);
});
