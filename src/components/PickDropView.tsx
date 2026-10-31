import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Navigation,
  Package,
  Phone,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  UserCheck,
  X,
} from 'lucide-react';
import {
  ActivityBooking,
  SriLankaLocation,
  VehicleOption,
  VehicleTypeId,
} from '../types/godude';
import {
  calculateFlexibleRideRunningFare,
  calculatePointToPointFare,
  calculateRouteMetrics,
} from '../utils/calculations';
import { LiveRouteMap, VehicleIllustration } from './VisualAssets';

interface PickDropViewProps {
  initialMode?: 'p2p' | 'flexible';
  initialIsParcel?: boolean;
  locations: SriLankaLocation[];
  currentLocation: SriLankaLocation;
  vehicles: VehicleOption[];
  onCompleteRideBooking: (
    booking: ActivityBooking,
    savingsCreditLKR: number,
    eligibleBaseLKR: number
  ) => void;
  onBackHome: () => void;
  onGoToActivity: () => void;
}

export const PickDropView: React.FC<PickDropViewProps> = ({
  initialMode = 'p2p',
  initialIsParcel = false,
  locations,
  currentLocation,
  vehicles,
  onCompleteRideBooking,
  onBackHome,
  onGoToActivity,
}) => {
  const [bookingMode, setBookingMode] = useState<'p2p' | 'flexible'>(initialMode);
  const [isParcel, setIsParcel] = useState<boolean>(initialIsParcel);
  const [originId, setOriginId] = useState<string>(currentLocation.id);
  const [destinationId, setDestinationId] = useState<string>(
    locations.find((l) => l.id !== currentLocation.id)?.id || locations[1].id
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<VehicleTypeId>('bike');
  const [parcelNote, setParcelNote] = useState('Fragile package · Call recipient upon arrival');
  const [paymentMethod, setPaymentMethod] = useState<
    'Visa •••• 4242' | 'LankaPay QR' | 'Genie Wallet'
  >('Visa •••• 4242');

  // ISSUE 5 FIX: PROPER FLEXIBLE RIDE LIFECYCLE
  // 'idle' -> 'driver_assigned' -> 'in_progress' -> 'trip_ended_review'
  const [flexStage, setFlexStage] = useState<
    'idle' | 'driver_assigned' | 'in_progress' | 'trip_ended_review'
  >('idle');
  const [flexTravelledKm, setFlexTravelledKm] = useState(0);
  const [flexElapsedSec, setFlexElapsedSec] = useState(0);

  // Payment confirmation & receipt modal
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [completedBookingReceipt, setCompletedBookingReceipt] = useState<ActivityBooking | null>(
    null
  );

  const originLoc = useMemo(
    () => locations.find((l) => l.id === originId) || currentLocation,
    [locations, originId, currentLocation]
  );

  const destLoc = useMemo(
    () => locations.find((l) => l.id === destinationId) || locations[1],
    [locations, destinationId]
  );

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0],
    [vehicles, selectedVehicleId]
  );

  const routeMetrics = useMemo(
    () => calculateRouteMetrics(originLoc, destLoc),
    [originLoc, destLoc]
  );

  const p2pFare = useMemo(
    () => calculatePointToPointFare(selectedVehicle, routeMetrics.distanceKm, isParcel),
    [selectedVehicle, routeMetrics.distanceKm, isParcel]
  );

  const flexFare = useMemo(
    () => calculateFlexibleRideRunningFare(selectedVehicle, flexTravelledKm, flexElapsedSec),
    [selectedVehicle, flexTravelledKm, flexElapsedSec]
  );

  // Live timer for flexible ride when in_progress
  useEffect(() => {
    if (flexStage !== 'in_progress') return;
    const interval = setInterval(() => {
      setFlexElapsedSec((prev) => prev + 4);
      setFlexTravelledKm((prev) => Number((prev + 0.12).toFixed(2)));
    }, 1000);
    return () => clearInterval(interval);
  }, [flexStage]);

  const handleSwapLocations = () => {
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
  };

  const getDriverForVehicle = (vId: VehicleTypeId) => {
    if (vId === 'bike') {
      return {
        name: 'Chathura Bandara',
        phone: '+94 77 512 9088',
        vehicleName: 'TVS NTorq 125 Scooter (Blue)',
        plateNumber: 'WP BKT-2291',
        rating: 4.93,
      };
    }
    if (vId === 'tuktuk') {
      return {
        name: 'Kamal Fernando',
        phone: '+94 71 892 3310',
        vehicleName: 'Bajaj RE 4S Tuk-Tuk (Green)',
        plateNumber: 'WP ABG-9124',
        rating: 4.95,
      };
    }
    return {
      name: 'Pradeep Jayawardena',
      phone: '+94 77 901 4412',
      vehicleName: 'Toyota Axio Hybrid AC Sedan',
      plateNumber: 'WP CBE-8840',
      rating: 4.97,
    };
  };

  // Point-to-Point Booking Submission
  const handleConfirmP2PBooking = () => {
    setIsConfirmingPayment(true);
    setTimeout(() => {
      const codeNum = Math.floor(1000 + Math.random() * 8999);
      const prefix = isParcel ? 'PAR-GD' : 'RID-GD';
      const driver = getDriverForVehicle(selectedVehicle.id);

      const newBooking: ActivityBooking = {
        id: `${prefix}-${codeNum}`,
        serviceType: isParcel ? 'Parcel Delivery' : 'Ride Booking',
        title: `${selectedVehicle.name} · ${originLoc.name.split('·')[0].trim()} to ${destLoc.name
          .split('·')[0]
          .trim()}`,
        subtitle: isParcel
          ? `Parcel Courier (${routeMetrics.distanceKm} km) · ${parcelNote}`
          : `Point-to-Point Trip (${routeMetrics.distanceKm} km)`,
        createdAt: 'Just now',
        status: 'Rider Assigned',
        paymentMethod,
        paymentStatus: 'Paid (Verified)',
        pickupAddress: originLoc.address,
        destinationAddress: destLoc.address,
        subtotalLKR: p2pFare.baseFareLKR + p2pFare.distanceChargeLKR,
        deliveryOrServiceFeeLKR: p2pFare.parcelHandlingFeeLKR,
        discountLKR: 0,
        totalPaidLKR: p2pFare.totalFareLKR,
        savingsEarnedLKR: p2pFare.savingsAllocationLKR,
        etaMins: selectedVehicle.etaMins,
        distanceKm: routeMetrics.distanceKm,
        driverOrRider: driver,
        itemsSummary: [
          `${isParcel ? 'Courier Package' : 'Passenger Ride'} via ${selectedVehicle.name}`,
          `Route: ${originLoc.name} → ${destLoc.name} (${routeMetrics.distanceKm} km)`,
        ],
        progressStep: 3,
      };

      setIsConfirmingPayment(false);
      setCompletedBookingReceipt(newBooking);
      onCompleteRideBooking(
        newBooking,
        p2pFare.savingsAllocationLKR,
        p2pFare.baseFareLKR + p2pFare.distanceChargeLKR
      );
    }, 750);
  };

  // Flexible Ride Flow (Issue 5 Fix)
  // Step 1 -> Step 2: Request driver
  const handleRequestFlexibleRide = () => {
    setFlexStage('driver_assigned');
  };

  // Step 2 -> Step 3: Driver arrives, start trip
  const handleStartFlexibleTrip = () => {
    setFlexTravelledKm(0.3);
    setFlexElapsedSec(20);
    setFlexStage('in_progress');
  };

  // Step 3 -> Step 4: End trip and calculate final fare (no payment taken yet!)
  const handleEndFlexibleTrip = () => {
    setFlexStage('trip_ended_review');
  };

  // Step 4 -> Step 5: Customer confirms payment method and pays
  const handlePayAndCompleteFlexibleRide = () => {
    setIsConfirmingPayment(true);
    const finalKm = Math.max(1.2, flexTravelledKm);
    const finalCalc = calculateFlexibleRideRunningFare(
      selectedVehicle,
      finalKm,
      flexElapsedSec
    );

    setTimeout(() => {
      const codeNum = Math.floor(1000 + Math.random() * 8999);
      const driver = getDriverForVehicle(selectedVehicle.id);

      const newFlexBooking: ActivityBooking = {
        id: `FLX-GD-${codeNum}`,
        serviceType: 'Flexible Ride',
        title: `Metered ${selectedVehicle.name} Ride`,
        subtitle: `Distance-Based Ride from ${originLoc.name} · ${finalKm.toFixed(1)} km travelled`,
        createdAt: 'Just now',
        status: 'Completed',
        paymentMethod,
        paymentStatus: 'Paid (Verified)',
        pickupAddress: originLoc.address,
        destinationAddress: `Open Drop-off (${originLoc.city} · ${finalKm.toFixed(1)} km)`,
        subtotalLKR: finalCalc.runningTotalLKR,
        deliveryOrServiceFeeLKR: 0,
        discountLKR: 0,
        totalPaidLKR: finalCalc.runningTotalLKR,
        savingsEarnedLKR: finalCalc.estimatedSavingsLKR,
        etaMins: 0,
        distanceKm: Number(finalKm.toFixed(1)),
        driverOrRider: driver,
        itemsSummary: [
          `Flexible Distance-Based Ride (${finalKm.toFixed(1)} km, ${Math.max(
            1,
            Math.floor(flexElapsedSec / 60)
          )} mins)`,
        ],
        progressStep: 5,
      };

      setIsConfirmingPayment(false);
      setCompletedBookingReceipt(newFlexBooking);
      setFlexStage('idle');
      setFlexTravelledKm(0);
      setFlexElapsedSec(0);
      onCompleteRideBooking(
        newFlexBooking,
        finalCalc.estimatedSavingsLKR,
        finalCalc.runningTotalLKR
      );
    }, 700);
  };

  return (
    <div className="relative min-h-full pb-28">
      {/* ISSUE 1 FIX: FIXED STICKY TOP BLUE HEADER WITH FROSTED GLASS */}
      <header className="sticky top-0 z-30 bg-[#02568a]/92 backdrop-blur-md border-b border-sky-400/30 text-white pt-3.5 pb-3 px-4 rounded-b-[24px] shadow-lg transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <button
            type="button"
            onClick={onBackHome}
            aria-label="Back to Home"
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h1 className="font-display font-extrabold text-base tracking-tight">Pick & Drop</h1>
            <div className="text-[10px] text-sky-200">Point-to-Point & Flexible Metered</div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
            ● GPS Live
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950/35 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setBookingMode('p2p');
              setFlexStage('idle');
            }}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              bookingMode === 'p2p'
                ? 'bg-white text-blue-950 shadow-xs'
                : 'text-sky-100 hover:bg-white/10'
            }`}
          >
            Mode 1: Point-to-Point
          </button>
          <button
            type="button"
            onClick={() => setBookingMode('flexible')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              bookingMode === 'flexible'
                ? 'bg-white text-blue-950 shadow-xs'
                : 'text-sky-100 hover:bg-white/10'
            }`}
          >
            Mode 2: Flexible Distance
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="px-4 pt-3.5 space-y-4">
        <div className="glass-card rounded-3xl p-4 shadow-sm space-y-3.5 border border-slate-200/90">
          {/* Passenger Ride vs Parcel Courier Toggle (Point-to-Point Mode) */}
          {bookingMode === 'p2p' && (
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-700">Trip Type</span>
              <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsParcel(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    !isParcel ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Passenger Ride
                </button>
                <button
                  type="button"
                  onClick={() => setIsParcel(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    isParcel ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Parcel Courier</span>
                </button>
              </div>
            </div>
          )}

          {/* Origin & Destination Inputs (Issue 4 Fix: Clean vertical arrangement without crowding) */}
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-2">
              {/* Pickup Row */}
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full border-[3px] border-sky-500 bg-white shrink-0 shadow-xs" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pickup Location
                  </label>
                  <select
                    aria-label="Origin Pickup Location"
                    value={originId}
                    onChange={(e) => setOriginId(e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none py-0.5 truncate"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.area})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Destination Row (Only in Point-to-Point) */}
              {bookingMode === 'p2p' ? (
                <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                  <span className="w-3 h-3 rounded-full border-[3px] border-orange-500 bg-white shrink-0 shadow-xs" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Destination
                    </label>
                    <select
                      aria-label="Destination Drop-off Location"
                      value={destinationId}
                      onChange={(e) => setDestinationId(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none py-0.5 truncate"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.area})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Open Destination:</strong> Trip meter
                    calculates exact distance travelled in real time.
                  </div>
                </div>
              )}
            </div>

            {bookingMode === 'p2p' && (
              <button
                type="button"
                onClick={handleSwapLocations}
                aria-label="Swap pickup and destination"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition-colors shadow-xs"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Parcel notes if courier */}
          {bookingMode === 'p2p' && isParcel && (
            <div className="pt-1">
              <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Recipient & Package Instructions
              </label>
              <input
                type="text"
                value={parcelNote}
                onChange={(e) => setParcelNote(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
          )}

          {/* Interactive Live Route Map */}
          <LiveRouteMap
            origin={originLoc}
            destination={destLoc}
            vehicleType={selectedVehicle.id}
            distanceKm={bookingMode === 'p2p' ? routeMetrics.distanceKm : flexTravelledKm}
            etaMins={
              bookingMode === 'p2p'
                ? routeMetrics.estimatedMinutes
                : Math.max(1, Math.round(flexElapsedSec / 60))
            }
            isFlexibleMode={bookingMode === 'flexible'}
            isTripActive={flexStage === 'in_progress'}
            progressPercent={
              bookingMode === 'flexible'
                ? Math.min(92, 15 + flexTravelledKm * 12)
                : 45
            }
          />

          {/* Vehicle Selection List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Select Vehicle Type</span>
              <span className="text-[10px] font-semibold text-orange-600">
                10% Savings on Fare
              </span>
            </div>

            {vehicles.map((vehicle) => {
              const isSelected = vehicle.id === selectedVehicleId;
              const estFare =
                bookingMode === 'p2p'
                  ? calculatePointToPointFare(vehicle, routeMetrics.distanceKm, isParcel)
                      .totalFareLKR
                  : vehicle.baseFareLKR;

              return (
                <button
                  key={vehicle.id}
                  type="button"
                  disabled={flexStage === 'in_progress'}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-sky-50/90 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  } ${flexStage === 'in_progress' ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <VehicleIllustration type={vehicle.id} className="w-12 h-9 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{vehicle.name}</span>
                        <span className="text-[10px] font-normal text-slate-500">
                          · {vehicle.etaMins}m away
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        LKR {vehicle.baseFareLKR} base · LKR {vehicle.perKmRateLKR}/km
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <div className="font-mono-num font-extrabold text-xs text-slate-900">
                        {bookingMode === 'p2p'
                          ? `LKR ${estFare.toLocaleString()}`
                          : `LKR ${vehicle.perKmRateLKR}/km`}
                      </div>
                      <div className="text-[9px] font-bold text-orange-600">
                        +10% Saved
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* MODE 1: POINT-TO-POINT CONFIRMATION */}
          {bookingMode === 'p2p' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              {/* Payment selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Visa •••• 4242', 'LankaPay QR', 'Genie Wallet'] as const).map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold transition-all ${
                        paymentMethod === pm
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Base Fare</span>
                  <span className="font-mono-num">LKR {p2pFare.baseFareLKR}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Distance ({routeMetrics.distanceKm} km)</span>
                  <span className="font-mono-num">LKR {p2pFare.distanceChargeLKR}</span>
                </div>
                {p2pFare.parcelHandlingFeeLKR > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Parcel Courier Fee</span>
                    <span className="font-mono-num">LKR {p2pFare.parcelHandlingFeeLKR}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Estimated Total</span>
                  <span className="font-mono-num">
                    LKR {p2pFare.totalFareLKR.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-orange-600 pt-0.5">
                  <span>Automatic 10% Savings Credit</span>
                  <span className="font-mono-num">+LKR {p2pFare.savingsAllocationLKR}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isConfirmingPayment}
                onClick={handleConfirmP2PBooking}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isConfirmingPayment
                    ? 'Confirming Payment & Assigning Driver...'
                    : `Confirm ${isParcel ? 'Parcel Delivery' : selectedVehicle.name} · LKR ${p2pFare.totalFareLKR.toLocaleString()}`}
                </span>
              </button>
            </div>
          )}

          {/* MODE 2: FLEXIBLE DISTANCE-BASED RIDE (ISSUE 5 FIX: STAGED WORKFLOW) */}
          {bookingMode === 'flexible' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              {/* STAGE 1: Rate Card & Request */}
              {flexStage === 'idle' && (
                <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300">
                      Flexible Rate Card ({selectedVehicle.name})
                    </span>
                    <span className="text-[10px] text-emerald-300 font-semibold">
                      Pay ONLY after ride
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-800/90 rounded-xl p-2.5 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Base Fare</div>
                      <div className="font-mono-num font-bold text-white mt-0.5">
                        LKR {selectedVehicle.baseFareLKR}
                      </div>
                    </div>
                    <div className="border-x border-slate-700">
                      <div className="text-[10px] text-slate-400">Per Km Rate</div>
                      <div className="font-mono-num font-bold text-sky-300 mt-0.5">
                        LKR {selectedVehicle.perKmRateLKR}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Per Min Wait</div>
                      <div className="font-mono-num font-bold text-amber-300 mt-0.5">
                        LKR {selectedVehicle.perMinWaitLKR}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    No fixed destination required. Your driver starts the trip from pickup, the
                    meter tracks actual distance travelled, and you confirm payment after reaching
                    your destination.
                  </p>

                  <button
                    type="button"
                    onClick={handleRequestFlexibleRide}
                    className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Request Flexible Ride & Assign Driver</span>
                  </button>
                </div>
              )}

              {/* STAGE 2: Driver Assigned & At Pickup */}
              {flexStage === 'driver_assigned' && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">
                          {getDriverForVehicle(selectedVehicle.id).name} (
                          {getDriverForVehicle(selectedVehicle.id).rating} ★)
                        </div>
                        <div className="text-[10px] text-slate-600">
                          {getDriverForVehicle(selectedVehicle.id).vehicleName} ·{' '}
                          <strong>{getDriverForVehicle(selectedVehicle.id).plateNumber}</strong>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      At Pickup
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-blue-100">
                    Your driver is waiting at <strong>{originLoc.name}</strong>. Step in and click
                    Start Trip to begin the metered journey.
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFlexStage('idle')}
                      className="py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel Request
                    </button>
                    <button
                      type="button"
                      onClick={handleStartFlexibleTrip}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Trip</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 3: Trip In Progress (Meter Live Ticking) */}
              {flexStage === 'in_progress' && (
                <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Trip In Progress (Meter Active)
                    </span>
                    <span className="text-[10px] text-slate-300">
                      {getDriverForVehicle(selectedVehicle.id).name}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-800 rounded-xl p-2.5 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400">Distance</div>
                      <div className="font-mono-num font-extrabold text-sm text-white">
                        {flexTravelledKm.toFixed(2)} km
                      </div>
                    </div>
                    <div className="border-x border-slate-700">
                      <div className="text-[10px] text-slate-400">Time</div>
                      <div className="font-mono-num font-extrabold text-sm text-sky-300">
                        {Math.floor(flexElapsedSec / 60)}m {flexElapsedSec % 60}s
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Running Fare</div>
                      <div className="font-mono-num font-extrabold text-sm text-amber-300">
                        LKR {flexFare.runningTotalLKR}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>Base LKR {selectedVehicle.baseFareLKR} + Distance</span>
                    <span className="text-orange-300 font-bold">
                      +LKR {flexFare.estimatedSavingsLKR} Savings
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFlexTravelledKm((prev) => Number((prev + 1.5).toFixed(2)));
                        setFlexElapsedSec((prev) => prev + 180);
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700"
                    >
                      + 1.5 km (Simulate Drive)
                    </button>
                    <button
                      type="button"
                      onClick={handleEndFlexibleTrip}
                      className="py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>End Trip & Review</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 4: Trip Ended · Payment & Review Sheet (Issue 5 Fix: Payment confirmed here ONLY after trip) */}
              {flexStage === 'trip_ended_review' && (
                <div className="bg-white rounded-2xl border border-slate-300 p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="font-display font-extrabold text-sm text-slate-900">
                        Trip Completed · Fare Breakdown
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Review your metered trip details before confirming payment
                      </p>
                    </div>
                    <span className="text-xs font-mono-num font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {flexTravelledKm.toFixed(1)} km
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Fare</span>
                      <span className="font-mono-num">LKR {flexFare.baseFareLKR}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Distance ({flexTravelledKm.toFixed(1)} km)</span>
                      <span className="font-mono-num">LKR {flexFare.distanceFareLKR}</span>
                    </div>
                    {flexFare.timeChargeLKR > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Waiting / Travel Time Charge</span>
                        <span className="font-mono-num">LKR {flexFare.timeChargeLKR}</span>
                      </div>
                    )}
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                      <span>Final Payable Fare</span>
                      <span className="font-mono-num">
                        LKR {flexFare.runningTotalLKR.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-orange-600 pt-0.5">
                      <span>+10% Savings Wallet Credit</span>
                      <span className="font-mono-num">+LKR {flexFare.estimatedSavingsLKR}</span>
                    </div>
                  </div>

                  {/* Payment selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Confirm Online Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Visa •••• 4242', 'LankaPay QR', 'Genie Wallet'] as const).map((pm) => (
                        <button
                          key={pm}
                          type="button"
                          onClick={() => setPaymentMethod(pm)}
                          className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold transition-all ${
                            paymentMethod === pm
                              ? 'border-blue-600 bg-blue-50 text-blue-900'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {pm}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isConfirmingPayment}
                    onClick={handlePayAndCompleteFlexibleRide}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {isConfirmingPayment
                        ? 'Processing Payment...'
                        : `Pay LKR ${flexFare.runningTotalLKR.toLocaleString()} & Complete Ride`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Confirmation & Receipt Modal */}
      {completedBookingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900">
                    {completedBookingReceipt.serviceType} Confirmed!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Booking ID {completedBookingReceipt.id} · Payment Verified
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompletedBookingReceipt(null)}
                aria-label="Close booking confirmation"
                className="p-1.5 rounded-full bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Assigned Driver Card */}
            {completedBookingReceipt.driverOrRider && (
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {completedBookingReceipt.driverOrRider.name} ·{' '}
                      {completedBookingReceipt.driverOrRider.rating} ★
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {completedBookingReceipt.driverOrRider.vehicleName} ·{' '}
                      <strong>{completedBookingReceipt.driverOrRider.plateNumber}</strong>
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono-num text-xs font-bold text-blue-800">
                  {completedBookingReceipt.etaMins > 0
                    ? `${completedBookingReceipt.etaMins}m ETA`
                    : 'Completed'}
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup</span>
                <span className="font-semibold text-slate-900 truncate max-w-[210px]">
                  {completedBookingReceipt.pickupAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination</span>
                <span className="font-semibold text-slate-900 truncate max-w-[210px]">
                  {completedBookingReceipt.destinationAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Distance</span>
                <span className="font-mono-num font-semibold">
                  {completedBookingReceipt.distanceKm} km
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-sm">
                <span>Total Paid ({completedBookingReceipt.paymentMethod})</span>
                <span className="font-mono-num">
                  LKR {completedBookingReceipt.totalPaidLKR.toLocaleString()}
                </span>
              </div>
              <div className="bg-orange-100/90 text-orange-950 px-3 py-2 rounded-xl font-semibold flex items-center justify-between mt-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  10% Savings Credited
                </span>
                <span className="font-mono-num font-extrabold">
                  +LKR {completedBookingReceipt.savingsEarnedLKR}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setCompletedBookingReceipt(null)}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => {
                  setCompletedBookingReceipt(null);
                  onGoToActivity();
                }}
                className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Track in Activity</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
