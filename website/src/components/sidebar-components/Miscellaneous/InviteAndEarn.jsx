import React, { useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaCopy, FaGift, FaLink, FaMoneyBillWave, FaShareAlt, FaUsers } from "react-icons/fa";
import { URL } from "@/utils/constants";
import { FONTS } from "../../../constants/theme";

const steps = [
  {
    icon: <FaShareAlt />,
    title: "Share Link",
    copy: "Send your referral link or code to friends in one tap.",
  },
  {
    icon: <FaUsers />,
    title: "They Join",
    copy: "Friends register through your code and complete their first deposit.",
  },
  {
    icon: <FaMoneyBillWave />,
    title: "You Earn",
    copy: "Track referral rewards and grow your wallet from each successful invite.",
  },
];

const statCards = [
  { label: "Referral Rate", value: "20%", hint: "Per valid deposit" },
  { label: "Reward Status", value: "Live", hint: "Instant tracking" },
  { label: "Payout Desk", value: "24/7", hint: "Always available" },
];

const InviteAndEarn = () => {
  const referralCode = localStorage.getItem("account_id") || "GUEST001";
  const referralURL = useMemo(() => `${URL}home?referralcode=${referralCode}`, [referralCode]);
  const [showToast, setShowToast] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
  };

  useEffect(() => {
    if (!showToast) return undefined;
    const timer = setTimeout(() => setShowToast(false), 2200);
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <section className="invite-v2">
      {showToast && (
        <div className="invite-v2-toast">
          <FaCheckCircle />
          <span>Copied to clipboard</span>
        </div>
      )}

      <div className="invite-v2-hero">
        <div className="invite-v2-copy">
          <span className="invite-v2-kicker">Referral Desk</span>
          <h1 style={{ fontFamily: FONTS.head }}>Invite & Earn</h1>
          <p>
            Share your personal referral access, onboard friends faster, and keep every reward update in one cleaner
            wallet-focused screen.
          </p>

          <div className="invite-v2-stats">
            {statCards.map((item) => (
              <article key={item.label}>
                <strong style={{ fontFamily: FONTS.head }}>{item.value}</strong>
                <span>{item.label}</span>
                <em>{item.hint}</em>
              </article>
            ))}
          </div>
        </div>

        <div className="invite-v2-earnings">
          <div className="invite-v2-earnings-head">
            <span><FaGift /></span>
            <div>
              <small>Referral Earnings</small>
              <strong style={{ fontFamily: FONTS.head }}>₹0.00</strong>
            </div>
          </div>
          <p>Rewards from successful invites will appear here once referrals complete their qualifying deposit.</p>
        </div>
      </div>

      <div className="invite-v2-grid">
        <article className="invite-v2-card">
          <div className="invite-v2-card-head">
            <span><FaLink /></span>
            <div>
              <h2 style={{ fontFamily: FONTS.head }}>Referral Link</h2>
              <p>Use this link in messages, stories, or direct shares.</p>
            </div>
          </div>

          <div className="invite-v2-field">
            <input type="text" readOnly value={referralURL} />
            <button type="button" onClick={() => handleCopy(referralURL)}>
              <FaCopy />
              <span>Copy Link</span>
            </button>
          </div>
        </article>

        <article className="invite-v2-card">
          <div className="invite-v2-card-head">
            <span><FaUsers /></span>
            <div>
              <h2 style={{ fontFamily: FONTS.head }}>Referral Code</h2>
              <p>Your personal code for quick manual entry.</p>
            </div>
          </div>

          <div className="invite-v2-field invite-v2-field-code">
            <div className="invite-v2-code-box" style={{ fontFamily: FONTS.head }}>
              {referralCode}
            </div>
            <button type="button" className="secondary" onClick={() => handleCopy(referralCode)}>
              <FaCopy />
              <span>Copy Code</span>
            </button>
          </div>
        </article>
      </div>

      <div className="invite-v2-steps">
        <div className="invite-v2-section-head">
          <span className="invite-v2-section-tag">How It Works</span>
          <strong style={{ fontFamily: FONTS.head }}>Simple referral flow</strong>
        </div>

        <div className="invite-v2-steps-grid">
          {steps.map((step, index) => (
            <article key={step.title} className="invite-v2-step-card">
              <div className="invite-v2-step-no">{String(index + 1).padStart(2, "0")}</div>
              <div className="invite-v2-step-icon">{step.icon}</div>
              <div className="invite-v2-step-copy">
                <h3 style={{ fontFamily: FONTS.head }}>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="invite-v2-note">
        <strong style={{ fontFamily: FONTS.head }}>Terms apply</strong>
        <p>
          Rewards are credited only after successful qualifying activity. Duplicate, invalid, or self-referred accounts
          may be excluded from referral benefits.
        </p>
      </div>
    </section>
  );
};

export default InviteAndEarn;
