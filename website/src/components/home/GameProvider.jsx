import React, { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import 'swiper/css';

// Provider images
import caleta from './providers/Caleta.png';
import cq9 from './providers/CQ9.png';
import evoplay from './providers/Evoplay.png';
import pragmaticplay from './providers/PragmaticPlay.png';
import saba from './providers/sabalogo.png';
import pgsoft from './providers/PGSOFT.png';
import mac88 from './providers/mac88.png';
import eighteenpeaches from './providers/18-preaches.png';
import veliplay from './providers/veliplay.png';
import aviatrix from './providers/aviatrix.png';
import inout from './providers/inout-minigames.png';
import galaxsys from './providers/galaxsys.png';
import smartsoft from './providers/Smartsoft.png';
import twoJ from './providers/2j.png';
import turbogames from './providers/turbo-games.png';
import auragaming from './providers/aura-gaming.png';
import indialotto from './providers/india-lotto.png';
import ongaming from './providers/ongaming.png';
import ezugi1 from './providers/ezugi1.png';
import evolution2 from './providers/Evolution2.png';
import luckysports from './providers/lucky-sports.png';
import playngo from './providers/PlayNGo.png';
import redtiger from './providers/redtiger.png';
import relaxgaming from './providers/relaxgaming.png';

const providers = [
  { logo: ezugi1,          name: "Ezugi" },
  { logo: evolution2,      name: "Evolution" },
  { logo: caleta,          name: "Caleta" },
  { logo: cq9,             name: "CQ9" },
  { logo: evoplay,         name: "Evoplay" },
  { logo: pragmaticplay,   name: "Pragmatic" },
  { logo: saba,            name: "Saba" },
  { logo: luckysports,     name: "Lucky Sports" },
  { logo: mac88,           name: "MAC88" },
  { logo: eighteenpeaches, name: "18Peaches" },
  { logo: veliplay,        name: "VeliPlay" },
  { logo: aviatrix,        name: "Aviatrix" },
  { logo: inout,           name: "InOut" },
  { logo: galaxsys,        name: "Galaxsys" },
  { logo: smartsoft,       name: "Smartsoft" },
  { logo: twoJ,            name: "2J" },
  { logo: turbogames,      name: "Turbogames" },
  { logo: auragaming,      name: "Aura Gaming" },
  { logo: indialotto,      name: "India Lotto" },
  { logo: pgsoft,          name: "PG Soft" },
  { logo: ongaming,        name: "ON Gaming" },
  { logo: playngo,         name: "Play'n GO" },
  { logo: redtiger,        name: "Red Tiger" },
  { logo: relaxgaming,     name: "Relax" },
];

/* ── Pure circular badge — NO text, NO name ── */
const Circle = ({ logo, name, brand }) => (
  <div className="group flex items-center justify-center px-1 py-2">
    <div
      className="provider-circle relative rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:scale-105 cursor-pointer"
      style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
      }}
      title={name}
    >
      {/* Inner ring */}
      <div
        className="provider-inner-ring absolute rounded-full pointer-events-none"
        style={{ inset: '6px', borderRadius: '50%' }}
      ></div>
      {/* Hover glow ring */}
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{ boxShadow: `inset 0 0 20px ${brand}22`, borderRadius: '50%' }}
      ></div>
      {/* Logo */}
      <img
        src={logo}
        alt={name}
        className="provider-logo"
        style={{
          width: '58%',
          height: '58%',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          transition: 'all 0.2s',
        }}
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
    </div>
  </div>
);

const GameProvider = () => {
  const COLORS = useColors();
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="mt-7 px-4 md:px-0 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 px-1 md:px-2">
        <h2 className="section-banner max-w-full" style={{ fontFamily: FONTS.head }}>
          <span>Game Providers</span>
        </h2>

        <button
          onClick={() => setShowAll(!showAll)}
          className={`see-all cursor-pointer ${showAll ? 'bg-blue-600 text-white' : ''}`}
          style={showAll ? { background: COLORS.brand, color: '#fff' } : {}}
        >
          {showAll ? 'Close ✕' : 'View All'}
        </button>
      </div>

      {/* Infinite scroll carousel */}
      {!showAll && (
        <Swiper
          modules={[Autoplay]}
          spaceBetween={0}
          slidesPerView={5}
          loop={true}
          speed={4000}
          autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            480:  { slidesPerView: 6 },
            640:  { slidesPerView: 7 },
            768:  { slidesPerView: 8 },
            1024: { slidesPerView: 10 },
            1280: { slidesPerView: 12 },
          }}
          className="w-full"
        >
          {[...providers, ...providers].map((p, i) => (
            <SwiperSlide key={i} style={{ display: 'flex', justifyContent: 'center' }}>
              <Circle logo={p.logo} name={p.name} brand={COLORS.brand} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Expanded full grid — circles only, no names */}
      {showAll && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' }}>
          {providers.map((p, i) => (
            <Circle key={i} logo={p.logo} name={p.name} brand={COLORS.brand} />
          ))}
        </div>
      )}
    </section>
  );
};

export default GameProvider;
