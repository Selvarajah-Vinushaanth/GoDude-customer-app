import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FastForward,
  MapPin,
  Navigation,
  Phone,
  Receipt,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { ActivityBooking, SriLankaLocation } from '../types/godude';
import { LiveRouteMap } from './VisualAssets';

interface ActivityViewProps {
  bookings: ActivityBooking[];
  currentLocation: SriLankaLocation;
  onAdvanceBookingStatus: (bookingId: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onBookNewService: (service: 'foods' | 'pickdrop') => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  bookings,
  currentLocation,
  onAdvanceBookingStatus,
  onCancelBooking,
  onBookNewService,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [contactToast, setContactToast] = useState<string | null>(null);

  const isBookingActive = (b: ActivityBooking) =>
    b.status !== 'Delivered' && b.status !== 'Completed' && b.status !== 'Cancelled';

  const activeCount = bookings.filter(isBookingActive).length;

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'active') return isBookingActive(b);
    if (filter === 'completed') return b.status === 'Delivered' || b.status === 'Completed';
    if (filter === 'cancelled') return b.status === 'Cancelled';
    return true;
  });

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || null;

  const stepLabels = ['Confirmed', 'Preparing', 'Rider Assigned', 'On the Way', 'Completed'];

  return (
    <div className="relative min-h-full pb-28">
      {/* ISSUE 1 FIX: FIXED STICKY TOP BLUE HEADER WITH FROSTED GLASS */}
      <header className="sticky top-0 z-30 glass-header px-4 pt-3.5 pb-3 text-white rounded-b-[24px] shadow-lg transition-all space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-extrabold text-base tracking-tight">
              Activity Hub
            </h1>
            <p className="text-[10px] text-sky-200">
              Live food deliveries, passenger rides & courier parcels
            </p>
          </div>
          <div className="text-right font-mono-num">
            <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30">
              {activeCount} Active
            </span>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="grid grid-cols-4 gap-1 bg-slate-950/35 p-1 rounded-2xl">
          {(
            [
              { id: 'all', label: `All (${bookings.length})` },
              { id: 'active', label: `Active (${activeCount})` },
              { id: 'completed', label: 'Done' },
              { id: 'cancelled', label: 'Cancelled' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all text-center truncate ${
                filter === tab.id
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-sky-100 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Bookings List */}
      <div className="px-4 pt-4 space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <div className="text-sm font-bold text-slate-800">
              No {filter !== 'all' ? filter : ''} bookings found
            </div>
            <p className="text-xs text-slate-500">
              Place a food order or book a Pick & Drop ride to track live progress here.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onBookNewService('foods')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Order Food
              </button>
              <button
                type="button"
                onClick={() => onBookNewService('pickdrop')}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Book a Ride
              </button>
            </div>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const active = isBookingActive(booking);
            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3"
              >
                {/* Header Row: ID, Service Type, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {booking.serviceType} · {booking.id} · {booking.createdAt}
                    </div>
                    <h3 className="font-display font-bold text-sm text-slate-900 mt-0.5">
                      {booking.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">{booking.subtitle}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-bold ${
                        booking.status === 'Cancelled'
                          ? 'text-red-600'
                          : active
                          ? 'text-blue-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {booking.status}
                    </div>
                    {active && booking.etaMins > 0 && (
                      <div className="text-[11px] font-mono-num font-semibold text-slate-700 mt-0.5">
                        ETA {booking.etaMins} mins
                      </div>
                    )}
                  </div>
                </div>

                {/* Pickup & Destination Route Details */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 truncate">
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                    <span className="text-slate-500">From:</span>
                    <span className="font-medium truncate">{booking.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 truncate">
                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                    <span className="text-slate-500">To:</span>
                    <span className="font-medium truncate">{booking.destinationAddress}</span>
                  </div>
                </div>

                {/* Payment & Savings Summary Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100">
                  <div className="text-slate-600">
                    <span className="font-mono-num font-bold text-slate-900">
                      LKR {booking.totalPaidLKR.toLocaleString()}
                    </span>
                    <span> · {booking.paymentMethod}</span>
                    <span> · {booking.paymentStatus}</span>
                  </div>
                  {booking.savingsEarnedLKR > 0 && (
                    <span className="font-mono-num font-bold text-orange-600">
                      +LKR {booking.savingsEarnedLKR} Saved (10%)
                    </span>
                  )}
                </div>

                {/* Action Buttons: Clean non-overlapping layout */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingId(booking.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs min-h-[36px]"
                  >
                    <Navigation className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{active ? 'Live Tracking' : 'View Receipt'}</span>
                  </button>

                  {active && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onAdvanceBookingStatus(booking.id)}
                        className="py-2 px-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors min-h-[36px]"
                        title="Simulate step advance"
                      >
                        <FastForward className="w-3.5 h-3.5 shrink-0" />
                        <span>Advance</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelBooking(booking.id)}
                        className="py-2 px-2.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors min-h-[36px]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Live Tracking & Digital Receipt Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="text-[11px] font-semibold text-blue-600">
                  {selectedBooking.serviceType} · {selectedBooking.id}
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  {selectedBooking.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedBookingId(null);
                  setContactToast(null);
                }}
                aria-label="Close booking details"
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Live Map for Booking */}
            <LiveRouteMap
              origin={currentLocation}
              vehicleType={
                selectedBooking.serviceType === 'Food Delivery'
                  ? 'bike'
                  : selectedBooking.title.toLowerCase().includes('car')
                  ? 'car'
                  : 'tuktuk'
              }
              distanceKm={selectedBooking.distanceKm}
              etaMins={selectedBooking.etaMins}
              progressPercent={selectedBooking.progressStep * 20}
            />

            {/* 5-Step Progress Bar */}
            {selectedBooking.status !== 'Cancelled' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    Current Status: {selectedBooking.status}
                  </span>
                  <span className="font-mono-num text-blue-700 font-semibold">
                    Step {selectedBooking.progressStep} of 5
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {stepLabels.map((lbl, idx) => {
                    const reached = idx + 1 <= selectedBooking.progressStep;
                    return (
                      <div key={lbl} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            reached ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        />
                        <div className="text-[9px] text-slate-500 text-center truncate">{lbl}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>This booking was cancelled and refunded in full.</span>
              </div>
            )}

            {/* Assigned Rider / Driver Card */}
            {selectedBooking.driverOrRider && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {selectedBooking.driverOrRider.name} ({selectedBooking.driverOrRider.rating} ★)
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {selectedBooking.driverOrRider.vehicleName} ·{' '}
                    <strong>{selectedBooking.driverOrRider.plateNumber}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setContactToast(
                      `Simulated Demo Call connected to ${selectedBooking.driverOrRider?.name} (${selectedBooking.driverOrRider?.phone})`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </button>
              </div>
            )}

            {contactToast && (
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-medium">
                {contactToast}
              </div>
            )}

            {/* Digital Receipt Details */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                <span>Verified Digital Receipt</span>
              </div>
              {selectedBooking.itemsSummary?.map((line, i) => (
                <div key={i} className="text-slate-700">
                  • {line}
                </div>
              ))}
              <div className="flex justify-between text-slate-500 pt-1">
                <span>Subtotal</span>
                <span className="font-mono-num">
                  LKR {selectedBooking.subtotalLKR.toLocaleString()}
                </span>
              </div>
              {selectedBooking.deliveryOrServiceFeeLKR > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Delivery / Handling Fee</span>
                  <span className="font-mono-num">
                    LKR {selectedBooking.deliveryOrServiceFeeLKR.toLocaleString()}
                  </span>
                </div>
              )}
              {selectedBooking.discountLKR > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promotional Discount</span>
                  <span className="font-mono-num">
                    -LKR {selectedBooking.discountLKR.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Paid ({selectedBooking.paymentMethod})</span>
                <span className="font-mono-num">
                  LKR {selectedBooking.totalPaidLKR.toLocaleString()}
                </span>
              </div>
              {selectedBooking.savingsEarnedLKR > 0 && (
                <div className="pt-1 flex justify-between text-orange-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 10% Savings Wallet Credit
                  </span>
                  <span className="font-mono-num">+LKR {selectedBooking.savingsEarnedLKR}</span>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center gap-2">
              {isBookingActive(selectedBooking) && (
                <button
                  type="button"
                  onClick={() => onAdvanceBookingStatus(selectedBooking.id)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Advance Demo Progress</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedBookingId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
