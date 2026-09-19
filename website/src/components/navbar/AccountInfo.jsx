import React from "react";
import { useNavigate } from "react-router-dom";
import { FaWallet, FaMoneyBillWave, FaCoins } from "react-icons/fa";
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { useSite } from "../../context/SiteContext";

const AccountInfo = ({ accountInfo }) => {
  const COLORS = useColors();
  const navigate = useNavigate();
  const { setShowLogin } = useSite() || {};
  const isGuest = accountInfo?.account_id === "guest" || localStorage.getItem("auth_secret_key") === "guest";

  // Premium initials-based avatar (inclusive for both male and female)
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${accountInfo.account_username}&backgroundColor=60a5fa&fontSize=45&bold=true`;

  const remainingWager = parseFloat(accountInfo?.tbl_requiredplay_balance || 0);
  const casinoBonus = parseFloat(accountInfo?.account_casino_bonus || 0);
  const sportsBonus = parseFloat(accountInfo?.account_sports_bonus || 0);
  const activeBonus = casinoBonus + sportsBonus;
  const isWagering = remainingWager > 0 && activeBonus > 0;

  // Use real wagering data from tbl_bonus_redemptions (returned by account-info API)
  const wagerRequired = parseFloat(accountInfo.wagering_required || 0);
  const wagerCompleted = parseFloat(accountInfo.wagering_completed || 0);
  // Accurate %: use API data when available, fall back to remaining estimate
  const wagerPct = isWagering
    ? (wagerRequired > 0
      ? Math.min(100, Math.round((wagerCompleted / wagerRequired) * 100))
      : 0)
    : 0;

  const balanceData = [
    { label: isGuest ? "Demo Balance" : "Real Balance", value: parseFloat(accountInfo.account_balance || 0).toLocaleString('en-IN'), isCurrency: true, active: true },
    { label: "Casino Bonus", value: parseFloat(accountInfo.account_casino_bonus || 0).toLocaleString('en-IN'), isCurrency: true, active: true, locked: isWagering && casinoBonus > 0 },
    { label: "Sports Bonus", value: parseFloat(accountInfo.account_sports_bonus || 0).toLocaleString('en-IN'), isCurrency: true, active: true, locked: isWagering && sportsBonus > 0 },
    { label: "Total Balance", value: parseFloat(accountInfo.account_total_balance || 0).toLocaleString('en-IN'), isCurrency: true, active: true },
  ];

  const handleDepositClick = () => {
    if (isGuest) {
      if (setShowLogin) setShowLogin(true);
      return;
    }
    navigate("/deposit");
  };

  const handleWithdrawClick = () => {
    if (isGuest) {
      if (setShowLogin) setShowLogin(true);
      return;
    }
    navigate("/withdraw");
  };

  return (
    <div className="w-full bg-white/[0.02] rounded-[2.5rem] flex flex-col p-6 border border-black/5 dark:border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[60px] -mr-16 -mt-16 group-hover:bg-brand/10 transition-colors duration-700"></div>

      {/* Profile Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 border-brand/20 shadow-[0_0_20px_rgba(29,78,216,0.2)] group-hover:border-brand/50 transition-all duration-500 bg-gray-100 dark:bg-white/5 flex items-center justify-center relative`}>
              <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent"></div>
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-[3px] border-[#111111] shadow-lg"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.3em] mb-1" style={{ fontFamily: FONTS.ui }}>Player Profile</span>
            <span className="text-base font-black text-black dark:text-white uppercase tracking-tight leading-none" style={{ fontFamily: FONTS.head }}>
              {accountInfo?.account_username || "User"}
            </span>
          </div>
        </div>
      </div>

      {/* Balance Hub - 2x2 Grid */}
      <div className="space-y-4 mb-8 relative z-10">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-3 rounded-full" style={{ background: COLORS.brandGradient }}></div>
          <span className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.3em]" style={{ fontFamily: FONTS.ui }}>Wallet Overview</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {balanceData.map((box, index) => (
            <div
              key={index}
              className={`p-2.5 rounded-[1.25rem] border transition-all duration-300 relative overflow-hidden group/box ${box.active
                  ? "bg-white/[0.04] border-black/10 dark:border-white/10 hover:border-brand/30"
                  : "bg-white/[0.01] border-black/5 dark:border-white/5 opacity-60"
                } ${box.locked ? "border-brand/30 bg-brand/5" : ""}`}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-[7px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest leading-none">{box.label}</div>
                  {box.locked && <span className="text-[8px]">🔒</span>}
                </div>
                <div className={`text-[11px] sm:text-sm font-black flex items-center gap-0.5 leading-none ${box.active ? "text-black dark:text-white" : "text-black/20 dark:text-white/20"}`} style={{ fontFamily: FONTS.head, letterSpacing: '-0.02em' }}>
                  {box.isCurrency && box.active && <span className="text-brand text-[9px] font-bold">₹</span>}
                  <span className="whitespace-nowrap">{box.value}</span>
                </div>
              </div>
              {box.active && (
                <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover/box:opacity-10 transition-opacity">
                  <FaCoins className="text-xl" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Wagering Progress Banner — shown only when bonus is locked in wagering */}
        {isWagering && (
          <div className="mt-3 p-3 rounded-2xl border border-brand/20 bg-brand/5 relative overflow-hidden">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-brand mb-0.5">Wagering In Progress 🔒</p>
                {wagerRequired > 0 ? (
                  <p className="text-[10px] font-bold text-black/60 dark:text-white/60">
                    ₹{wagerCompleted.toLocaleString('en-IN')} completed of ₹{wagerRequired.toLocaleString('en-IN')} required
                  </p>
                ) : (
                  <p className="text-[10px] font-bold text-black/60 dark:text-white/60">
                    ₹{remainingWager.toLocaleString('en-IN')} remaining to unlock
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] font-black text-brand">{wagerPct}%</span>
                <p className="text-[7px] text-black/30 dark:text-white/30 uppercase tracking-wider">done</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${wagerPct}%`,
                  background: wagerPct >= 100
                    ? "linear-gradient(90deg, #22c55e, #16a34a)"
                    : "linear-gradient(90deg, #f59e0b, #f97316)"
                }}
              />
            </div>
            <p className="text-[7px] text-black/30 dark:text-white/30 mt-2 leading-tight">
              Bonus of ₹{activeBonus.toLocaleString('en-IN')} stays in the Sports/Casino bonus wallet and will transfer to Real Balance automatically only after 100% wagering is complete.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 relative z-10 mb-6">
        <button
          onClick={handleDepositClick}
          className="group flex flex-col items-center justify-center gap-1 bg-gray-100 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-black dark:text-white font-black py-2 rounded-xl transition-all duration-300 border border-black/5 dark:border-white/5 uppercase text-[7px] tracking-[0.2em] active:scale-95"
          style={{ fontFamily: FONTS.ui }}
        >
          <div className="w-6 h-6 rounded-md bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(34,197,94,0.15)] group-hover:bg-green-500 group-hover:text-black dark:text-white transition-all">
            <FaMoneyBillWave size={10} />
          </div>
          Deposit
        </button>
        <button
          onClick={handleWithdrawClick}
          className="group flex flex-col items-center justify-center gap-1 bg-gray-100 dark:bg-white/5 hover:bg-brand/20 dark:hover:bg-brand/10 text-black dark:text-white font-black py-2 rounded-xl transition-all duration-500 border border-black/5 dark:border-white/5 uppercase text-[7px] tracking-[0.2em] active:scale-95 shadow-lg group-hover:shadow-brand/20 group-hover:border-brand"
          style={{ fontFamily: FONTS.ui }}
        >
          <div className="w-6 h-6 rounded-md bg-brand/10 text-brand group-hover:bg-white group-hover:text-brand flex items-center justify-center group-hover:scale-110 transition-all shadow-[0_0_10px_rgba(29,78,216,0.15)]">
            <FaWallet size={10} />
          </div>
          <span className="group-hover:text-black dark:text-white transition-colors">Withdraw</span>
        </button>
      </div>

      {/* Cashback Claim Banner (Manual Mode) */}
      {accountInfo.claimable_cashback > 0 && accountInfo.cashback_mode === 'manual' && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-brand/10 to-cyan-500/10 border border-brand/20 backdrop-blur-md relative overflow-hidden animate-pulse">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[8px] font-black text-brand uppercase tracking-widest mb-0.5">Available Cashback</p>
              <p className="text-lg font-black text-white" style={{ fontFamily: FONTS.head }}>₹{parseFloat(accountInfo.claimable_cashback).toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${accountInfo.BASE_URL}router/`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Route: "route-claim-cashback",
                      AuthToken: localStorage.getItem("auth_secret_key"),
                    },
                    body: JSON.stringify({ USER_ID: localStorage.getItem("account_id"), LOG_ID: accountInfo.cashback_log_id })
                  });
                  const res = await response.json();
                  if (res.status === "success") {
                    window.dispatchEvent(new CustomEvent("site-data-refresh"));
                    alert("Cashback claimed successfully!");
                  } else {
                    alert(res.message || "Failed to claim");
                  }
                } catch (e) { console.error(e); }
              }}
              className="px-4 py-2 bg-brand hover:bg-brandDark text-white text-[9px] font-black uppercase rounded-lg shadow-lg active:scale-95 transition-all"
            >
              Claim Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountInfo;








