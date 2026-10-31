import React, { useState } from 'react';
import {
  Award,
  Building2,
  CheckCircle2,
  Edit3,
  FileText,
  Heart,
  HelpCircle,
  Home,
  MapPin,
  Plus,
  RotateCcw,
  Shield,
  Smile,
  Star,
  User,
} from 'lucide-react';
import {
  ActivityBooking,
  CustomerProfile,
  SavedAddress,
  SavingsTransaction,
} from '../types/godude';
import { summarizeSavingsLedger } from '../utils/calculations';

interface ProfileViewProps {
  profile: CustomerProfile;
  bookings: ActivityBooking[];
  transactions: SavingsTransaction[];
  onUpdateProfile: (updated: CustomerProfile) => void;
  onResetDemoData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  bookings,
  transactions,
  onUpdateProfile,
  onResetDemoData,
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(profile.fullName);
  const [phoneInput, setPhoneInput] = useState(profile.phone);
  const [emailInput, setEmailInput] = useState(profile.email);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Other');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Colombo 05');
  const [newAddrLandmark, setNewAddrLandmark] = useState('');

  const [activePolicyModal, setActivePolicyModal] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const ledgerSummary = summarizeSavingsLedger(transactions, '2026-10');

  // Verified totals calculated from historical baseline + active session records
  const totalFoodOrders =
    22 + bookings.filter((b) => b.serviceType === 'Food Delivery' && b.status !== 'Cancelled').length;
  const totalRidesAndDeliveries =
    28 +
    bookings.filter(
      (b) =>
        (b.serviceType === 'Ride Booking' ||
          b.serviceType === 'Parcel Delivery' ||
          b.serviceType === 'Flexible Ride') &&
        b.status !== 'Cancelled'
    ).length;

  const lifetimeSavedLKR =
    ledgerSummary.totalBalanceLKR +
    ledgerSummary.totalWithdrawnLKR +
    ledgerSummary.totalDonatedLKR;

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !phoneInput.trim()) return;
    onUpdateProfile({
      ...profile,
      fullName: nameInput.trim(),
      phone: phoneInput.trim(),
      email: emailInput.trim(),
    });
    setIsEditingProfile(false);
    setStatusMessage('Personal profile details saved.');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrLine.trim()) return;
    const added: SavedAddress = {
      id: `addr-${Date.now()}`,
      label: newAddrLabel,
      addressLine: newAddrLine.trim(),
      city: newAddrCity.trim() || 'Colombo',
      landmark: newAddrLandmark.trim() || 'Main Road Access',
    };
    onUpdateProfile({
      ...profile,
      savedAddresses: [...profile.savedAddresses, added],
    });
    setNewAddrLine('');
    setNewAddrLandmark('');
    setIsAddingAddress(false);
    setStatusMessage('New delivery address added to your profile.');
  };

  return (
    <div className="relative min-h-full pb-28">
      {/* ISSUE 1 FIX: FIXED STICKY TOP BLUE HEADER WITH FROSTED GLASS */}
      <header className="sticky top-0 z-30 glass-header px-4 pt-3.5 pb-4 text-white rounded-b-[24px] shadow-lg transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-400/20 border-2 border-sky-400 flex items-center justify-center text-sky-200 font-display font-extrabold text-lg shadow-xs">
              {profile.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <h1 className="font-display font-extrabold text-base leading-tight">
                {profile.fullName}
              </h1>
              <div className="text-[11px] text-sky-200 font-mono-num">
                Account ID: {profile.accountId}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold">{profile.rating} Rating</span>
                <span>·</span>
                <span className="text-sky-200">{profile.monthsActive}m Member</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingProfile ? 'Done' : 'Edit'}</span>
          </button>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {statusMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {statusMessage}
            </span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-emerald-700 underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Edit Personal Details Form */}
        {isEditingProfile && (
          <form
            onSubmit={handleSavePersonalInfo}
            className="bg-white rounded-2xl border border-blue-200 p-4 space-y-3 shadow-sm"
          >
            <h2 className="font-display font-bold text-sm text-slate-900">
              Edit Personal Information
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
            >
              Save Changes
            </button>
          </form>
        )}

        {/* SECTION 6.3: OUR CONTRIBUTION (Smile-Inspired Customer Impact Dashboard) */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0f294a] via-[#1e3a8a] to-[#1d4ed8] text-white p-4 shadow-md space-y-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-base">
                  Our Contribution · Community Impact
                </h2>
                <p className="text-xs text-sky-200">
                  Member since {profile.memberSince} ({profile.monthsActive} months active)
                </p>
              </div>
            </div>
            <Award className="w-5 h-5 text-amber-300 shrink-0" />
          </div>

          {/* Friendly Smile Celebration Message */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-3 text-xs leading-relaxed text-sky-50">
            “You’ve helped complete{' '}
            <strong className="text-amber-300">
              {totalFoodOrders + totalRidesAndDeliveries} local deliveries & rides
            </strong>
            , accumulated{' '}
            <strong className="text-amber-300 font-mono-num">
              LKR {lifetimeSavedLKR.toLocaleString()}
            </strong>{' '}
            in 10% customer savings, and contributed{' '}
            <strong className="text-emerald-300 font-mono-num">
              LKR {ledgerSummary.totalDonatedLKR.toLocaleString()}
            </strong>{' '}
            to verified Sri Lankan social causes!”
          </div>

          {/* Verified Impact Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-slate-950/35 rounded-xl p-2.5">
              <div className="text-[10px] text-sky-200">Total Food Orders</div>
              <div className="font-mono-num font-extrabold text-base text-white mt-0.5">
                {totalFoodOrders}
              </div>
            </div>
            <div className="bg-slate-950/35 rounded-xl p-2.5">
              <div className="text-[10px] text-sky-200">Rides & Deliveries</div>
              <div className="font-mono-num font-extrabold text-base text-white mt-0.5">
                {totalRidesAndDeliveries}
              </div>
            </div>
            <div className="bg-slate-950/35 rounded-xl p-2.5">
              <div className="text-[10px] text-sky-200">Total Money Saved</div>
              <div className="font-mono-num font-extrabold text-base text-amber-300 mt-0.5">
                LKR {lifetimeSavedLKR.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-950/35 rounded-xl p-2.5">
              <div className="text-[10px] text-sky-200">Social Donations</div>
              <div className="font-mono-num font-extrabold text-base text-emerald-300 mt-0.5">
                LKR {ledgerSummary.totalDonatedLKR.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-950/35 rounded-xl p-2.5">
              <div className="text-[10px] text-sky-200">Rewards Earned</div>
              <div className="font-mono-num font-extrabold text-base text-sky-300 mt-0.5">
                1,450 Pts
              </div>
            </div>
            <div className="bg-slate-950/35 rounded-xl p-2.5">
              <div className="text-[10px] text-sky-200">Impact Milestone</div>
              <div className="font-bold text-xs text-amber-200 mt-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Gold Citizen
              </div>
            </div>
          </div>
        </div>

        {/* Saved Home & Work Addresses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Saved Addresses ({profile.savedAddresses.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Address
            </button>
          </div>

          {isAddingAddress && (
            <form
              onSubmit={handleAddAddress}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs"
            >
              <div className="grid grid-cols-3 gap-1.5">
                {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setNewAddrLabel(lbl)}
                    className={`py-1.5 rounded-lg font-semibold border ${
                      newAddrLabel === lbl
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={newAddrLine}
                onChange={(e) => setNewAddrLine(e.target.value)}
                placeholder="Street address e.g. 88 Havelock Road..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newAddrCity}
                  onChange={(e) => setNewAddrCity(e.target.value)}
                  placeholder="City / Zone"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200"
                />
                <input
                  type="text"
                  value={newAddrLandmark}
                  onChange={(e) => setNewAddrLandmark(e.target.value)}
                  placeholder="Nearest Landmark"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold"
              >
                Save New Address
              </button>
            </form>
          )}

          <div className="space-y-2">
            {profile.savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <Home className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">
                      {addr.label} · {addr.city}
                    </div>
                    <div className="text-slate-600">{addr.addressLine}</div>
                    <div className="text-[11px] text-slate-400">Landmark: {addr.landmark}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Bank Accounts & Payment Methods */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
          <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Verified Bank Accounts (For Monthly Savings Withdrawals)</span>
          </h3>
          <div className="space-y-2">
            {profile.bankAccounts.map((bank) => (
              <div
                key={bank.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{bank.bankName}</div>
                  <div className="text-[11px] text-slate-500">
                    {bank.branchName} · {bank.accountNumberMasked}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700">Verified CEFT</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy, Notifications & About GO DUDE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
          <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Privacy, Notifications & Platform Policies</span>
          </h3>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 cursor-pointer">
              <div>
                <div className="font-bold text-slate-900">Order & Ride Push Notifications</div>
                <div className="text-[11px] text-slate-500">
                  Real-time rider arrival, food prep & monthly payout alerts
                </div>
              </div>
              <input
                type="checkbox"
                checked={profile.notificationsEnabled}
                onChange={(e) =>
                  onUpdateProfile({ ...profile, notificationsEnabled: e.target.checked })
                }
                className="w-4 h-4 accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 cursor-pointer">
              <div>
                <div className="font-bold text-slate-900">Consent-Based Live GPS Location</div>
                <div className="text-[11px] text-slate-500">
                  Used strictly during active Pick & Drop rides and deliveries
                </div>
              </div>
              <input
                type="checkbox"
                checked={profile.locationConsentEnabled}
                onChange={(e) =>
                  onUpdateProfile({ ...profile, locationConsentEnabled: e.target.checked })
                }
                className="w-4 h-4 accent-blue-600"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { id: 'about', label: 'About GO DUDE & Support', icon: HelpCircle },
              { id: 'rules', label: 'Savings & Refund Rules', icon: FileText },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePolicyModal(item.id)}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
              >
                <item.icon className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Reset Demo Data Button (Required by Prompt Section 9) */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              GO DUDE Sri Lanka v2.4.0 · Customer Prototype
            </div>
            <button
              type="button"
              onClick={() => {
                onResetDemoData();
                setStatusMessage(
                  'Demo data reset to initial Sri Lanka default state (cart, bookings, savings & profile restored).'
                );
              }}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Policy & Support Info Modal */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 space-y-3 shadow-2xl text-xs">
            <h3 className="font-display font-bold text-base text-slate-900">
              {activePolicyModal === 'about'
                ? 'About GO DUDE Sri Lanka & 24/7 Support'
                : 'Transparent 10% Savings, Donation & Refund Rules'}
            </h3>
            {activePolicyModal === 'about' ? (
              <div className="space-y-2 text-slate-600 leading-relaxed">
                <p>
                  <strong>GO DUDE</strong> is Sri Lanka’s unified platform for food delivery,
                  Point-to-Point & Flexible ride-hailing, courier parcels, and automatic 10%
                  customer savings.
                </p>
                <p>
                  <strong>24/7 Colombo Operations & Support:</strong> +94 11 234 5678 ·
                  support@godude.lk · Level 12, World Trade Center, Colombo 01.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-slate-600 leading-relaxed">
                <p>
                  <strong>1. 10% Savings Calculation Base:</strong> Every verified paid food order
                  or ride allocates 10% of the net eligible food or trip amount (excluding delivery
                  and handling fees) to your Savings Wallet.
                </p>
                <p>
                  <strong>2. Monthly Bank Withdrawal Rule:</strong> Customers may transfer savings
                  to a verified bank account once per calendar month (minimum LKR 200).
                </p>
                <p>
                  <strong>3. Social Donations & Refunds:</strong> Donations to verified Sri Lankan
                  charities can be made anytime. Cancelled orders are refunded in full and do not
                  generate duplicate savings credits.
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setActivePolicyModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
