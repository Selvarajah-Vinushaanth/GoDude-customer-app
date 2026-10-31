export type MainTab = 'home' | 'activity' | 'offers' | 'profile';
export type ActiveServiceView = 'none' | 'foods' | 'pickdrop' | 'savings';

export type VehicleTypeId = 'bike' | 'tuktuk' | 'car';

export interface SriLankaLocation {
  id: string;
  name: string;
  area: string;
  city: 'Colombo' | 'Kandy' | 'Galle' | 'Negombo';
  address: string;
  lat: number;
  lng: number;
}

export interface FoodCustomizationOption {
  id: string;
  label: string;
  priceLKR: number;
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  name: string;
  category: 'Kottu & Roti' | 'Biriyani & Rice' | 'Sri Lankan Classics' | 'Burgers & Wraps' | 'Beverages & Desserts';
  description: string;
  priceLKR: number;
  largePriceDeltaLKR: number;
  isPopular?: boolean;
  isSpicy?: boolean;
  prepTimeMins: number;
  calories: number;
  illustrationType: 'kottu' | 'cheese_kottu' | 'biriyani' | 'fried_rice' | 'burger' | 'lamprais' | 'hoppers' | 'isso_wade' | 'wattalappan' | 'faluda';
  availableAddons: FoodCustomizationOption[];
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  city: 'Colombo' | 'Kandy' | 'Galle' | 'Negombo';
  address: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMins: number;
  deliveryFeeLKR: number;
  distanceKm: number;
  isOpen: boolean;
  featuredPromo?: string;
  cuisineTags: string[];
  bannerColor: string;
  illustrationType: 'kottu' | 'cheese_kottu' | 'biriyani' | 'fried_rice' | 'burger' | 'lamprais' | 'hoppers' | 'isso_wade';
}

export interface CartItem {
  cartItemId: string;
  foodItem: FoodItem;
  restaurantId: string;
  restaurantName: string;
  quantity: number;
  portion: 'Regular' | 'Large';
  spiceLevel: 'Mild' | 'Medium Spicy' | 'Sri Lankan Fiery';
  selectedAddons: FoodCustomizationOption[];
  specialInstructions: string;
  unitTotalLKR: number;
}

export interface VehicleOption {
  id: VehicleTypeId;
  name: string;
  sinhalaTamilSub: string;
  description: string;
  capacity: string;
  baseFareLKR: number;
  perKmRateLKR: number;
  perMinWaitLKR: number;
  etaMins: number;
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Rider Assigned'
  | 'Picked Up'
  | 'On the Way'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export type ServiceType = 'Food Delivery' | 'Ride Booking' | 'Parcel Delivery' | 'Flexible Ride';

export interface ActivityBooking {
  id: string;
  serviceType: ServiceType;
  title: string;
  subtitle: string;
  createdAt: string;
  status: BookingStatus;
  paymentMethod: 'Visa •••• 4242' | 'LankaPay QR' | 'Genie Wallet' | 'Cash on Delivery';
  paymentStatus: 'Paid (Verified)' | 'Settled' | 'Refunded';
  pickupAddress: string;
  destinationAddress: string;
  subtotalLKR: number;
  deliveryOrServiceFeeLKR: number;
  discountLKR: number;
  totalPaidLKR: number;
  savingsEarnedLKR: number;
  etaMins: number;
  distanceKm: number;
  driverOrRider?: {
    name: string;
    phone: string;
    vehicleName: string;
    plateNumber: string;
    rating: number;
  };
  itemsSummary?: string[];
  progressStep: number; // 1 to 5
}

export interface SavingsTransaction {
  id: string;
  type: 'credit_order' | 'credit_ride' | 'withdrawal_bank' | 'donation_charity';
  title: string;
  referenceId: string;
  date: string;
  eligibleBaseAmountLKR?: number;
  amountLKR: number; // positive for credit, negative for withdrawal/donation
  status: 'Completed' | 'Processing' | 'Pending';
  recipientDetails?: string;
}

export interface CharityOrganization {
  id: string;
  name: string;
  category: 'Emergency Healthcare' | 'Children & Education' | 'Disaster Relief' | 'Community Nutrition' | 'Animal Welfare';
  registrationNo: string;
  summary: string;
  impactMetric: string;
  totalRaisedOnPlatformLKR: number;
  verifiedBadge: boolean;
}

export interface PromotionalOffer {
  id: string;
  title: string;
  businessName: string;
  category: 'Restaurants' | 'Hotels & Stays' | 'Local Businesses' | 'Ride Deals';
  city: 'All Sri Lanka' | 'Colombo' | 'Kandy' | 'Galle' | 'Negombo';
  discountLabel: string;
  promoCode: string;
  description: string;
  minSpendLKR: number;
  maxDiscountLKR: number;
  validUntil: string;
  isSponsored: boolean;
  accentColor: string;
}

export interface BusinessMembershipPlan {
  id: string;
  name: string;
  monthlyPriceLKR: number;
  adSlotsPerMonth: number;
  reachEstimate: string;
  features: string[];
  recommended?: boolean;
}

export interface SavedAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  addressLine: string;
  city: string;
  landmark: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  branchName: string;
  accountHolder: string;
  accountNumberMasked: string;
  isVerified: boolean;
}

export interface CustomerProfile {
  accountId: string;
  fullName: string;
  phone: string;
  email: string;
  memberSince: string;
  monthsActive: number;
  rating: number;
  selectedLocationId: string;
  savedAddresses: SavedAddress[];
  bankAccounts: BankAccount[];
  lastWithdrawalMonth: string | null; // YYYY-MM format, e.g. '2026-09'
  notificationsEnabled: boolean;
  locationConsentEnabled: boolean;
}
