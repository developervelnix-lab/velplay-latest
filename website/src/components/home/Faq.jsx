import React, { useState } from "react";
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';

const faqs = [
  { q: "Why is this one of the best online betting sites in India?", a: "A trusted betting platform offering fast transactions and secure gaming experiences for Indian players." },
  { q: "Is online betting legal in India?", a: "Betting laws vary by state. Always check your local regulations before participating." },
  { q: "How do I withdraw my winnings?", a: "Withdrawals are processed instantly using our secure banking methods. Minimum withdrawal limits apply." },
  { q: "Can I ever win in an online casino?", a: "Yes, but outcomes are chance-based. Games have a house edge — play responsibly." },
  { q: "Is online casino a skill or luck?", a: "Most casino games are luck-based, though games like poker and blackjack involve skill elements." },
];

const Item = ({ q, a, open, onToggle, idx }) => {
  const COLORS = useColors();
  return (
    <div
      className="faq-card border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        borderColor: open ? `${COLORS.brand}45` : 'rgba(0,0,0,0.06)',
        background: open ? `${COLORS.brand}08` : '#ffffff',
        boxShadow: open ? `0 2px 12px ${COLORS.brand}15` : '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3 px-4 py-3 select-none">
        {/* Number badge */}
        <span
          className="text-[10px] font-black shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all duration-200"
          style={{
            fontFamily: FONTS.ui,
            background: open ? COLORS.brand : 'rgba(29, 78, 216, 0.08)',
            color: open ? '#fff' : '#1d4ed8',
            boxShadow: open ? `0 0 10px ${COLORS.brand}60` : 'none',
          }}
        >
          {idx + 1}
        </span>

        {/* Question */}
        <span
          className="flex-1 text-[11.5px] font-bold uppercase tracking-[0.5px] transition-colors duration-200 leading-snug"
          style={{ fontFamily: FONTS.ui, color: open ? '#111827' : '#6b7280' }}
        >
          {q}
        </span>

        {/* Chevron */}
        <svg
          viewBox="0 0 24 24"
          className="w-3 h-3 shrink-0 fill-current transition-transform duration-200"
          style={{ color: open ? COLORS.brand : '#9ca3af', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
        </svg>
      </div>

      {/* Answer */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: open ? '120px' : '0', opacity: open ? 1 : 0 }}
      >
        <div className="px-4 pb-3 pl-12">
          <div
            className="h-[1px] mb-2 w-full"
            style={{ background: `linear-gradient(90deg, ${COLORS.brand}40, transparent)` }}
          ></div>
          <p
            className="text-[11px] leading-relaxed"
            style={{ fontFamily: FONTS.ui, color: '#6b7280' }}
          >
            {a}
          </p>
        </div>
      </div>
    </div>
  );
};

const Faq = () => {
  const COLORS = useColors();
  const [open, setOpen] = useState(0);

  return (
    <section className="mt-7 mb-6 px-4 md:px-0 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1 md:px-2">
        <h2 className="section-banner max-w-full" style={{ fontFamily: FONTS.head }}>
          <span>Frequently Asked Questions</span>
        </h2>
        <span
          className="text-[9px] font-black uppercase tracking-[1px] px-2.5 py-1 rounded border"
          style={{
            fontFamily: FONTS.ui,
            color: COLORS.brand,
            background: `${COLORS.brand}10`,
            borderColor: `${COLORS.brand}30`,
          }}
        >
          {faqs.length} Questions
        </span>
      </div>

      {/* FAQ list — single column, compact */}
      <div className="flex flex-col gap-1.5 max-w-[900px]">
        {faqs.map((item, i) => (
          <Item
            key={i}
            idx={i}
            q={item.q}
            a={item.a}
            open={open === i}
            onToggle={() => setOpen(open === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
};

export default Faq;
