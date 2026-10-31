import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  HeartHandshake,
  Info,
  Receipt,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import {
  BankAccount,
  CharityOrganization,
  CustomerProfile,
  SavingsTransaction,
} from '../types/godude';
import {
  calculateSavingsAllocation,
  summarizeSavingsLedger,
  validateMonthlyWithdrawal,
} from '../utils/calculations';

interface SavingsViewProps {
  transactions: SavingsTransaction[];
  charities: CharityOrganization[];
  profile: CustomerProfile;
  onWithdrawToBank: (amountLKR: number, bankAccount: BankAccount) => void;
  onDonateToCharity: (amountLKR: number, charity: CharityOrganization) => void;
  onBackHome: () => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  transactions,
  charities,
  profile,
  onWithdrawToBank,
  onDonateToCharity,
  onBackHome,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'withdraw' | 'donate'>('ledger');
  const [selectedBankId, setSelectedBankId] = useState<string>(
    profile.bankAccounts[0]?.id || 'bank-combank'
  );
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>('1000');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawalReceipt, setWithdrawalReceipt] = useState<{
    refId: string;
    amountLKR: number;
    bank: BankAccount;
    timestamp: string;
  } | null>(null);

  const [selectedCharity, setSelectedCharity] = useState<CharityOrganization>(charities[0]);
  const [donationAmountInput, setDonationAmountInput] = useState<string>('500');
  const [donationError, setDonationError] = useState<string | null>(null);
  const [donationReceipt, setDonationReceipt] = useState<{
    refId: string;
    amountLKR: number;
    charity: CharityOrganization;
    timestamp: string;
  } | null>(null);

  const [simulatorSampleLKR, setSimulatorSampleLKR] = useState<number>(1000);

  const currentYearMonth = '2026-10';
  const summary = summarizeSavingsLedger(transactions, currentYearMonth);
  const simResult = calculateSavingsAllocation(simulatorSampleLKR);

  const hasWithdrawnThisMonth = profile.lastWithdrawalMonth === currentYearMonth;
  const nextEligibleDateText = hasWithdrawnThisMonth
    ? 'Nov 1, 2026 (Used)'
    : 'Available Now';

  const handleBankWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    const amount = Number(withdrawAmountInput);

    const validation = validateMonthlyWithdrawal(
      amount,
      summary.totalBalanceLKR,
      profile.lastWithdrawalMonth,
      currentYearMonth
    );

    if (!validation.valid) {
      setWithdrawError(validation.error || 'Invalid withdrawal request.');
      return;
    }

    const bank =
      profile.bankAccounts.find((b) => b.id === selectedBankId) || profile.bankAccounts[0];

    onWithdrawToBank(amount, bank);
    setWithdrawalReceipt({
      refId: `WDR-GD-${Math.floor(1000 + Math.random() * 8999)}`,
      amountLKR: amount,
      bank,
      timestamp: 'Oct 21, 2026 · Instant CEFT Demo Settlement',
    });
  };

  const handleCharityDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDonationError(null);
    const amount = Number(donationAmountInput);

    if (!Number.isFinite(amount) || amount < 100) {
      setDonationError('Minimum social cause donation is LKR 100.');
      return;
    }

    if (amount > summary.totalBalanceLKR) {
      setDonationError(
        `Donation exceeds your available savings balance of LKR ${summary.totalBalanceLKR.toLocaleString()}.`
      );
      return;
    }

    onDonateToCharity(amount, selectedCharity);
    setDonationReceipt({
      refId: `DON-GD-${Math.floor(1000 + Math.random() * 8999)}`,
      amountLKR: amount,
      charity: selectedCharity,
      timestamp: 'Oct 21, 2026 · Verified Social Impact Ledger',
    });
  };

  return (
    <div className="relative min-h-full pb-28">
      {/* ISSUE 1 FIX: FIXED STICKY TOP ORANGE HEADER WITH FROSTED GLASS */}
      <header className="sticky top-0 z-30 bg-[#c2410c]/92 backdrop-blur-md border-b border-orange-400/30 text-white pt-3.5 pb-3.5 px-4 rounded-b-[24px] shadow-lg transition-all space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </button>
          <div className="text-right">
            <span className="font-display font-extrabold text-base">GO DUDE Savings</span>
            <div className="text-[10px] text-orange-100 font-medium">
              10% Automatic Customer Savings Ledger
            </div>
          </div>
        </div>

        {/* Compact Balance Bar */}
        <div className="flex items-center justify-between bg-black/25 rounded-2xl p-3 border border-white/15">
          <div>
            <div className="text-[10px] text-orange-200 uppercase tracking-wider font-bold">
              Total Accumulated Balance
            </div>
            <div
              data-testid="savings-total-balance"
              className="font-mono-num font-extrabold text-2xl text-white tracking-tight"
            >
              LKR {summary.totalBalanceLKR.toLocaleString()}
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="font-mono-num font-bold text-amber-300">
              +LKR {summary.currentMonthSavedLKR.toLocaleString()}
            </div>
            <div className="text-[10px] text-orange-200">Earned This Month</div>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="grid grid-cols-3 gap-1 bg-black/25 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('ledger')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'ledger'
                ? 'bg-white text-orange-950 shadow-xs'
                : 'text-orange-50 hover:bg-white/10'
            }`}
          >
            Savings Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('withdraw')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'withdraw'
                ? 'bg-white text-orange-950 shadow-xs'
                : 'text-orange-50 hover:bg-white/10'
            }`}
          >
            Withdraw to Bank
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('donate')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'donate'
                ? 'bg-white text-orange-950 shadow-xs'
                : 'text-orange-50 hover:bg-white/10'
            }`}
          >
            Donate to Society
          </button>
        </div>
      </header>

      <div className="px-4 pt-3.5 space-y-4">
        {/* Transparent Demo Notice */}
        <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-orange-950 shadow-xs">
          <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <strong>Transparent 10% Allocation Rule:</strong> Every eligible paid food order or ride
            allocates <strong>10%</strong> into your Savings Wallet. Monthly withdrawals are allowed
            once per calendar month; charity donations can be made anytime!
          </div>
        </div>

        {/* SUB-TAB 1: SAVINGS LEDGER & 10% RULE CALCULATOR */}
        {activeSubTab === 'ledger' && (
          <div className="space-y-4">
            {/* Interactive 10% Settlement Breakdown Simulator */}
            <div className="glass-card rounded-3xl p-4 space-y-3 shadow-sm border border-slate-200/90">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>10% Savings Calculator</span>
                </h2>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Rule Preview
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                {[1000, 2500, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSimulatorSampleLKR(val)}
                    className={`px-3 py-1 rounded-full text-xs font-mono-num font-bold border transition-all ${
                      simulatorSampleLKR === val
                        ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    LKR {val.toLocaleString()} Order
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">Order Amount</div>
                  <div className="font-mono-num font-bold text-slate-900 mt-0.5">
                    LKR {simResult.eligibleAmountLKR.toLocaleString()}
                  </div>
                </div>
                <div className="border-x border-slate-200">
                  <div className="text-[10px] text-orange-700 font-bold">
                    10% Your Savings
                  </div>
                  <div className="font-mono-num font-extrabold text-orange-600 mt-0.5">
                    +LKR {simResult.savingsCreditLKR.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">90% Settlement</div>
                  <div className="font-mono-num font-bold text-slate-800 mt-0.5">
                    LKR {simResult.remainingSettlementLKR.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History List */}
            <div className="glass-card rounded-3xl p-4 space-y-3 shadow-sm border border-slate-200/90">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-sm text-slate-900">
                  Auditable Savings Ledger ({transactions.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('withdraw')}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Withdraw →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isPositive = tx.amountLKR > 0;
                  return (
                    <div
                      key={tx.id}
                      className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{tx.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {tx.date} · Ref: {tx.referenceId} · {tx.status}
                          {tx.eligibleBaseAmountLKR
                            ? ` · 10% of LKR ${tx.eligibleBaseAmountLKR.toLocaleString()}`
                            : ''}
                        </div>
                        {tx.recipientDetails && (
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            To: {tx.recipientDetails}
                          </div>
                        )}
                      </div>
                      <div
                        className={`shrink-0 font-mono-num font-extrabold text-sm ${
                          isPositive ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {isPositive ? `+LKR ${tx.amountLKR}` : `-LKR ${Math.abs(tx.amountLKR)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: WITHDRAW TO BANK */}
        {activeSubTab === 'withdraw' && (
          <form
            onSubmit={handleBankWithdrawalSubmit}
            className="glass-card rounded-3xl p-4 space-y-4 shadow-sm border border-slate-200/90"
          >
            <div>
              <h2 className="font-display font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                <span>Transfer Savings to Bank Account</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Allowed once per calendar month via Sri Lanka CEFT / SLIPS.
              </p>
            </div>

            <div
              className={`p-3 rounded-2xl border text-xs ${
                hasWithdrawnThisMonth
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <strong>Status:</strong>{' '}
              {hasWithdrawnThisMonth
                ? 'Your 1 permitted bank withdrawal for this month was already completed. Window opens Nov 1 (You can still donate to charity anytime!).'
                : 'Eligible for October 2026 bank withdrawal.'}
            </div>

            {/* Bank Accounts */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Select Verified Sri Lankan Bank
              </label>
              <div className="space-y-2">
                {profile.bankAccounts.map((bank) => {
                  const selected = bank.id === selectedBankId;
                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
                        selected
                          ? 'border-orange-600 bg-orange-50/70 font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{bank.bankName}</div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {bank.branchName} · {bank.accountNumberMasked}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="withdraw-amount-input"
                  className="text-xs font-bold text-slate-800"
                >
                  Withdrawal Amount (LKR)
                </label>
                <span className="text-xs text-slate-500">
                  Available:{' '}
                  <strong className="font-mono-num text-slate-900">
                    LKR {summary.totalBalanceLKR.toLocaleString()}
                  </strong>
                </span>
              </div>
              <input
                id="withdraw-amount-input"
                type="number"
                min={200}
                max={summary.totalBalanceLKR}
                value={withdrawAmountInput}
                onChange={(e) => setWithdrawAmountInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono-num font-bold text-sm focus:outline-none focus:border-orange-600"
              />
            </div>

            {withdrawError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium"
              >
                {withdrawError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Submit Monthly Bank Withdrawal</span>
            </button>
          </form>
        )}

        {/* SUB-TAB 3: DONATE TO SOCIETY */}
        {activeSubTab === 'donate' && (
          <form
            onSubmit={handleCharityDonationSubmit}
            className="glass-card rounded-3xl p-4 space-y-4 shadow-sm border border-slate-200/90"
          >
            <div>
              <h2 className="font-display font-extrabold text-base text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-orange-600" />
                <span>Donate to Sri Lankan Causes</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Directly support emergency healthcare, children’s hospitals, and disaster relief.
              </p>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-800">
                1. Choose Registered Charity
              </label>
              {charities.map((charity) => {
                const isSelected = charity.id === selectedCharity.id;
                return (
                  <button
                    key={charity.id}
                    type="button"
                    onClick={() => setSelectedCharity(charity)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-900">{charity.name}</div>
                      <span className="text-[10px] font-bold text-orange-700 shrink-0">
                        {charity.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{charity.summary}</p>
                    <div className="text-[10px] text-emerald-800 font-bold pt-1">
                      ★ {charity.impactMetric}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Donation Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="donation-amount-input"
                  className="text-xs font-bold text-slate-800"
                >
                  2. Donation Amount (LKR)
                </label>
                <span className="text-xs text-slate-500">
                  Balance: LKR {summary.totalBalanceLKR.toLocaleString()}
                </span>
              </div>
              <input
                id="donation-amount-input"
                type="number"
                min={100}
                max={summary.totalBalanceLKR}
                value={donationAmountInput}
                onChange={(e) => setDonationAmountInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono-num font-bold text-sm focus:outline-none focus:border-orange-600"
              />
            </div>

            {donationError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium"
              >
                {donationError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm Donation of LKR {Number(donationAmountInput || 0).toLocaleString()}</span>
            </button>
          </form>
        )}
      </div>

      {/* Receipts */}
      {withdrawalReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900">
                    Bank Withdrawal Completed!
                  </h3>
                  <p className="text-xs text-slate-500">Demo Bank Settlement Receipt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWithdrawalReceipt(null);
                  setActiveSubTab('ledger');
                }}
                aria-label="Close receipt"
                className="p-1.5 rounded-full bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono-num font-bold">{withdrawalReceipt.refId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination Bank</span>
                <span className="font-bold text-slate-900">{withdrawalReceipt.bank.bankName}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                <span>Amount Transferred</span>
                <span className="font-mono-num text-orange-600">
                  LKR {withdrawalReceipt.amountLKR.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setWithdrawalReceipt(null);
                setActiveSubTab('ledger');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              View Updated Savings Ledger
            </button>
          </div>
        </div>
      )}

      {donationReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-orange-600">
                <Receipt className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900">
                    Donation Receipt
                  </h3>
                  <p className="text-xs text-slate-500">Official Social Impact Contribution</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDonationReceipt(null);
                  setActiveSubTab('ledger');
                }}
                aria-label="Close donation receipt"
                className="p-1.5 rounded-full bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-orange-50/70 rounded-2xl p-4 border border-orange-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Reference</span>
                <span className="font-mono-num font-bold">{donationReceipt.refId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Beneficiary</span>
                <span className="font-bold text-slate-900 text-right max-w-[200px]">
                  {donationReceipt.charity.name}
                </span>
              </div>
              <div className="pt-2 border-t border-orange-200 flex justify-between font-bold text-sm text-orange-900">
                <span>Total Donated</span>
                <span className="font-mono-num">
                  LKR {donationReceipt.amountLKR.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDonationReceipt(null);
                setActiveSubTab('ledger');
              }}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
            >
              Return to Savings Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
