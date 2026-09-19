import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlay, FaTimes } from 'react-icons/fa';
import { useGames } from '../../context/GameContext';
import { useSite } from '../../context/SiteContext';
import { useNavigate } from 'react-router-dom';
import { URL as BASE_URL, API_URL } from "../../utils/constants";
import GameLaunchModal from '../common/GameLaunchModal';

export default function HomeSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { slots, casino, fishing, poker, turbo, live, casino_lobby, topslot } = useGames() || {};
  const { setShowLogin, refreshSiteData } = useSite();
  const navigate = useNavigate();
  const authSecretKey = localStorage.getItem("auth_secret_key");
  const [confirmPopup, setConfirmPopup] = useState({ show: false, game: null, error: null });

  const handleGameLaunch = (game) => {
    if (!authSecretKey) {
      setShowLogin(true);
      return;
    }
    setConfirmPopup({ show: true, game, error: null });
  };

  const q = searchQuery.toLowerCase();
  const allGames = [
    ...(slots||[]), ...(casino||[]), ...(fishing||[]), ...(poker||[]),
    ...(turbo||[]), ...(live||[]), ...(casino_lobby||[]), ...(topslot||[])
  ];
  const uniqueGames = Array.from(new Map(allGames.map(item => [item["Game UID"], item])).values());
  const filtered = uniqueGames.filter(g => g["Game Name"]?.toLowerCase().includes(q));

  return (
    <div className="relative z-[60] transition-all duration-500 flex flex-col items-end">
      {!isExpanded ? (
        <button 
          onClick={() => {
            setIsExpanded(true);
            setTimeout(() => {
              const banner = document.getElementById('trending-slots');
              if (banner) {
                // Scroll to position with a larger offset to clear the fixed navbar + sport tabs
                const y = banner.getBoundingClientRect().top + window.scrollY - 140;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }, 100);
          }}
          className="relative group transition-all duration-300 hover:scale-110 flex items-center justify-center p-1 md:p-1.5"
          title="Search Games"
        >
          <FaSearch className="text-black/80 dark:text-white/80 group-hover:text-brand transition-colors duration-300 text-sm md:text-base drop-shadow-sm" />
        </button>
      ) : (
        <div className="relative group transition-all duration-300 animate-fadeIn w-[260px] sm:w-[350px]">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand/0 via-brand/40 to-brand/0 rounded-[2rem] blur opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-1000"></div>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <FaSearch className="text-brand/70 group-focus-within:text-brand transition-colors duration-300 text-base group-hover:animate-pulse drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
            </div>
            <input
              autoFocus
              type="text"
              className="relative block w-full pl-11 pr-12 py-3 bg-white/40 dark:bg-[#111111]/90 backdrop-blur-2xl border border-black/10 dark:border-white/10 group-focus-within:border-brand/50 group-hover:border-brand/30 text-black dark:text-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] focus:outline-none transition-all duration-300 placeholder-black/40 dark:placeholder-white/40 text-sm font-medium"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center z-10">
              <button 
                onClick={() => { setIsExpanded(false); setSearchQuery(""); }}
                className="text-black/50 dark:text-white/50 hover:text-red-500 transition-colors duration-300 p-2"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isExpanded && searchQuery.trim().length > 0 && (
        <div className="absolute top-[110%] right-0 w-[300px] sm:w-[450px] bg-white/95 dark:bg-[#151515]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl max-h-[50vh] overflow-y-auto custom-scrollbar p-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No games found matching "{searchQuery}"</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {filtered.map((game, idx) => (
                <div key={idx} className="flex flex-col group cursor-pointer" onClick={() => handleGameLaunch(game)}>
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-black/10 dark:border-white/10 group-hover:border-brand/50 transition-all duration-300">
                    <img src={game.icon || "/placeholder.svg"} alt={game["Game Name"]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-brand text-black p-2 rounded-full shadow-lg">
                        <FaPlay className="ml-1" size={12} />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-1 right-1 text-center">
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider block truncate">{game["Game Name"]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Renders the global launch modal when a game is clicked */}
      <GameLaunchModal 
        show={confirmPopup.show} 
        game={confirmPopup.game} 
        error={confirmPopup.error} 
        onClose={() => setConfirmPopup({ show: false, game: null, error: null })} 
      />
    </div>
  );
}
