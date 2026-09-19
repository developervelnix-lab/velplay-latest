import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useGames } from "../../context/GameContext";
import { 
  FaSearch, FaTimes, FaFire, FaFilter, FaArrowLeft, 
  FaGamepad, FaSortAlphaDown, FaSortAlphaUp, FaTimesCircle
} from "react-icons/fa";
import RanaHeader from "../home/velplay365/RanaHeader";
import RanaFooter from "../home/velplay365/RanaFooter";
import GameSection from "../home/GameSection";
import "../../assets/css/velplay365.css";

const POPULAR_SEARCHES = [
  { name: "Aviator", icon: "🚀", tag: "Crash" },
  { name: "Lightning Roulette", icon: "🎡", tag: "Live" },
  { name: "Teen Patti", icon: "🎴", tag: "Card" },
  { name: "Crazy Time", icon: "📺", tag: "Show" },
  { name: "Super Andar Bahar", icon: "🎴", tag: "Card" },
  { name: "Dragon Tiger", icon: "🐯", tag: "Live" },
  { name: "First Person Baccarat", icon: "💎", tag: "Live" },
  { name: "Mines", icon: "💣", tag: "Turbo" },
  { name: "Bhagyathara", icon: "🎟️", tag: "Lotto" },
  { name: "Cockfight", icon: "🐓", tag: "Live" },
  { name: "Blackjack", icon: "🃏", tag: "Table" },
  { name: "Rummy", icon: "♠️", tag: "Card" },
];

const CATEGORY_TABS = [
  { id: "all", label: "All", icon: "🎮" },
  { id: "slots", label: "Slots", icon: "🎰" },
  { id: "live casino", label: "Live Casino", icon: "🎲" },
  { id: "crash games", label: "Crash", icon: "🚀" },
  { id: "roulette", label: "Roulette", icon: "🎡" },
  { id: "blackjack", label: "Blackjack", icon: "🃏" },
  { id: "baccarat", label: "Baccarat", icon: "💎" },
  { id: "dragon tiger", label: "Dragon Tiger", icon: "🐯" },
  { id: "teen patti", label: "Teen Patti", icon: "🎴" },
  { id: "poker", label: "Poker", icon: "♠️" },
  { id: "lottery", label: "Lottery", icon: "🎟️" },
  { id: "cockfight", label: "Cockfight", icon: "🐓" },
];

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const gamesContext = useGames();
  const inputRef = useRef(null);

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Keep query in sync with URL
  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    if (currentQ !== query) setQuery(currentQ);
  }, [searchParams]);

  // Focus input and handle ESC key to clear
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClearQuery();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSearchParams(
      (prev) => {
        if (val.trim()) prev.set("q", val);
        else prev.delete("q");
        return prev;
      },
      { replace: true }
    );
  };

  const handleClearQuery = () => {
    setQuery("");
    setSearchParams(
      (prev) => {
        prev.delete("q");
        return prev;
      },
      { replace: true }
    );
    if (inputRef.current) inputRef.current.focus();
  };

  const handleTagClick = (name) => {
    setQuery(name);
    setSearchParams(
      (prev) => {
        prev.set("q", name);
        return prev;
      },
      { replace: true }
    );
  };

  // Flatten and deduplicate all games from context
  const allGames = useMemo(() => {
    const flat = Object.values(gamesContext || {}).filter(Array.isArray).flat();
    return Array.from(
      new Map(flat.map((g) => [g["Game UID"] || g["Game Name"] || g.id, g])).values()
    );
  }, [gamesContext]);

  // Extract unique providers with counts
  const providerStats = useMemo(() => {
    const map = new Map();
    allGames.forEach((g) => {
      const p = g["Game Provider"] || g.provider;
      if (p) map.set(p, (map.get(p) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allGames]);

  // Filter games based on query, category, and provider
  const filteredGames = useMemo(() => {
    const cleanQ = query.trim().toLowerCase();
    const cleanCat = selectedCategory.toLowerCase();
    const cleanProv = selectedProvider.toLowerCase();

    let list = allGames.filter((g) => {
      const name = (g["Game Name"] || "").toLowerCase();
      const uid = String(g["Game UID"] || "").toLowerCase();
      const prov = (g["Game Provider"] || g.provider || "").toLowerCase();
      const cat = (g["Game Type"] || g.type || g.category || "").toLowerCase();
      const navCat = (g.navbar_category || g["Navbar Category"] || "").toLowerCase();

      // Search Query filter
      if (cleanQ) {
        const matches =
          name.includes(cleanQ) ||
          uid.includes(cleanQ) ||
          prov.includes(cleanQ) ||
          cat.includes(cleanQ) ||
          navCat.includes(cleanQ);
        if (!matches) return false;
      }

      // Provider filter
      if (cleanProv !== "all" && prov !== cleanProv) {
        return false;
      }

      // Category filter
      if (cleanCat !== "all") {
        if (cleanCat === "live casino") {
          const isLive =
            cat === "casino" ||
            cat === "casino_lobby" ||
            cat === "live" ||
            navCat === "roulette" ||
            navCat === "baccarat" ||
            navCat === "blackjack" ||
            navCat === "dragon tiger" ||
            name.includes("lobby") ||
            name.includes("roulette") ||
            name.includes("baccarat") ||
            name.includes("blackjack");
          if (!isLive) return false;
        } else if (cleanCat === "slots") {
          if (cat !== "slots" && !name.includes("slot")) return false;
        } else {
          const normNav = navCat.replace(/[^a-z0-9]/g, "");
          const normCat = cleanCat.replace(/[^a-z0-9]/g, "");
          if (normNav !== normCat && !name.includes(cleanCat)) return false;
        }
      }

      return true;
    });

    // Sorting
    if (sortBy === "alpha_asc") {
      list.sort((a, b) => (a["Game Name"] || "").localeCompare(b["Game Name"] || ""));
    } else if (sortBy === "alpha_desc") {
      list.sort((a, b) => (b["Game Name"] || "").localeCompare(a["Game Name"] || ""));
    }

    return list;
  }, [allGames, query, selectedCategory, selectedProvider, sortBy]);

  return (
    <div className="rana-layout category-route flex flex-col min-h-screen relative bg-[#060a14] text-slate-200 overflow-x-hidden">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <RanaHeader />
      </div>

      <main className="relative z-10 flex-grow w-full max-w-[1360px] mx-auto px-3 sm:px-6 py-4 md:py-6">
                        {/* SIMPLE & CLEAN SEARCH HERO CARD */}
        <section className="rounded-2xl mb-4 bg-transparent">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            {/* Title & Back */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Go back"
              >
                <FaArrowLeft size={12} />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎮</span>
                <h1 className="text-xl font-bold text-white m-0">
                  Game Search
                </h1>
                <span className="text-xs px-2.5 py-1 rounded-md bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/20 ml-2">
                  {allGames.length} Games
                </span>
              </div>
            </div>

            {/* WHITE SEARCH INPUT */}
            <div className="relative flex-grow max-w-xl w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FaSearch size={14} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search games, provider, category..."
                className="block w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-black placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-colors"
              />
              {query && (
                <button
                  onClick={handleClearQuery}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-rose-500"
                  title="Clear"
                >
                  <FaTimes size={14} />
                </button>
              )}
            </div>
          </div>

          {/* NORMAL QUICK SEARCH TAGS */}
          <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-2">
              <FaFire className="text-orange-500" size={12} /> Hot:
            </span>
            {POPULAR_SEARCHES.map((item) => {
              const active = query.toLowerCase() === item.name.toLowerCase();
              return (
                <button
                  key={item.name}
                  onClick={() => handleTagClick(item.name)}
                  className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                    active
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* COMPACT CATEGORY & TOOLBAR */}
        <section className="mb-4 space-y-2">
          {/* CATEGORY TABS HORIZONTAL SCROLLER */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORY_TABS.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] border transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-cyan-400 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]"
                      : "bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.07] hover:text-slate-200"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* COMPACT FILTER & SORT BAR */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 px-3 rounded-xl bg-[#091022]/80 border border-white/10 backdrop-blur-md">
            {/* Provider Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                <FaFilter size={10} className="text-cyan-400" /> Provider:
              </span>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="bg-[#0e1933] text-[11px] font-bold text-slate-200 border border-white/15 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All ({providerStats.length})</option>
                {providerStats.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Toolbar */}
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-[#0e1933] p-0.5 border border-white/10 text-[10px]">
                <button
                  onClick={() => setSortBy("default")}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    sortBy === "default" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Default
                </button>
                <button
                  onClick={() => setSortBy("alpha_asc")}
                  className={`px-2 py-0.5 rounded font-bold transition-all flex items-center gap-1 ${
                    sortBy === "alpha_asc" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FaSortAlphaDown size={9} /> A-Z
                </button>
                <button
                  onClick={() => setSortBy("alpha_desc")}
                  className={`px-2 py-0.5 rounded font-bold transition-all flex items-center gap-1 ${
                    sortBy === "alpha_desc" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FaSortAlphaUp size={9} /> Z-A
                </button>
              </div>

              {(query || selectedCategory !== "all" || selectedProvider !== "all") && (
                <button
                  onClick={() => {
                    handleClearQuery();
                    setSelectedCategory("all");
                    setSelectedProvider("all");
                    setSortBy("default");
                  }}
                  className="text-[10px] px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>

        {/* RESULTS HEADER */}
        <div className="flex items-center justify-between gap-3 mb-3 px-1">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span>Found</span>
            <span className="px-2 py-0.2 rounded-md bg-blue-500/20 text-cyan-400 font-extrabold text-xs border border-cyan-500/30">
              {filteredGames.length}
            </span>
            <span>games {query ? `for "${query}"` : ""}</span>
          </div>

          <div className="text-[10px] font-semibold text-slate-500">
            Instant Play
          </div>
        </div>

        {/* GAMES GRID OR EMPTY STATE */}
        {filteredGames.length > 0 ? (
          <GameSection
            id="search-results-grid"
            games={filteredGames}
            layout="grid"
            hideHeader={true}
          />
        ) : (
          <div className="py-12 px-4 text-center rounded-2xl bg-white/[0.02] border border-white/10 my-4 backdrop-blur-md">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="text-base font-bold text-white mb-1">No Games Matching "{query}"</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try searching with another keyword or explore popular titles below:
            </p>

            <div className="flex justify-center gap-1.5 flex-wrap max-w-md mx-auto">
              {POPULAR_SEARCHES.slice(0, 6).map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleTagClick(item.name)}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-cyan-300 hover:bg-blue-600 hover:text-white transition-all font-semibold"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <div className="relative z-10">
        <RanaFooter />
      </div>
    </div>
  );
}

export default SearchPage;
