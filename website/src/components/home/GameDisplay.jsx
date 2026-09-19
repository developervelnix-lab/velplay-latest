"use client"

import React from "react"
import { useGames } from "../../context/GameContext"
import GameSection from "./GameSection"

const GamesDisplay = ({ section }) => {
  const gamesContext = useGames();
  const { slots, casino, fishing, poker, turbo } = gamesContext;

  const excludeProviders = [
    'MAC88', '18Peaches', 'Veliplay', 'aviatrix', 'InOut Minigames',
    'Galaxsys', 'Smartsoft', '2J', 'turbogamesasia', 'Aura Gaming', 'India Lotto'
  ];

  const filterGames = (gameList) => {
    if (!gameList || !Array.isArray(gameList)) return [];
    return gameList.filter(game => {
      const provider = game["Game Provider"] || game["provider"] || "";
      return !excludeProviders.includes(provider);
    });
  };

  // Deduplicate array helper
  const dedupe = (list) => {
    return Array.from(
      new Map(list.map(g => [g["Game UID"] || g["Game Name"] || g.id, g])).values()
    );
  };

  // All games flat list for flexible filtering
  const allGames = Object.values(gamesContext).filter(Array.isArray).flat();

  // 1. Filtered Casino (Trending)
  const filteredCasino = dedupe(
    (casino || []).filter(game => {
      const isLobby = (game["Game Name"] || "").toLowerCase().includes("lobby");
      const provider = game["Game Provider"] || game["provider"] || "";
      const isExcluded = excludeProviders.includes(provider);
      return !isLobby && !isExcluded;
    })
  );

  // 2. Trending Games (Max 10 items)
  const trendingGames = filteredCasino.slice(0, 10);

  // 3. Unique Slots
  const filteredSlots = dedupe(filterGames(slots));

  // 4. Unique Fishing Games (remove duplicates)
  const filteredFishing = dedupe(filterGames(fishing));

  // 5. Full Collection of Indian Poker & Card Games
  const filteredPoker = dedupe(
    allGames.filter(game => {
      const name = (game["Game Name"] || "").toLowerCase();
      const cat = (game["Game Type"] || game.type || "").toLowerCase();
      const navCat = (game.navbar_category || game["Navbar Category"] || "").toLowerCase();
      const provider = (game["Game Provider"] || game.provider || "").toLowerCase();

      return (
        cat === 'poker' ||
        navCat === 'poker' ||
        navCat === 'teen patti' ||
        navCat === 'andar bahar' ||
        provider === 'india poker game' ||
        name.includes('poker') ||
        name.includes('teen patti') ||
        name.includes('teenpatti') ||
        name.includes('rummy') ||
        name.includes('andar') ||
        name.includes('bahar') ||
        name.includes('ak47') ||
        name.includes('callbreak') ||
        name.includes('flush') ||
        name.includes('tongits') ||
        name.includes('pusoy')
      );
    })
  );

  // 6. Genuine Fantasy / Sports / Virtual Games (distinct from Poker)
  const filteredFantasy = dedupe(
    allGames.filter(game => {
      const name = (game["Game Name"] || "").toLowerCase();
      const navCat = (game.navbar_category || game["Navbar Category"] || "").toLowerCase();
      const type = (game["Game Type"] || game.type || "").toLowerCase();
      return navCat === 'fantasy games' || navCat === 'fantasy' || type === 'fantasy' || name.includes('cricket') || name.includes('football') || name.includes('kabaddi') || name.includes('premier league') || name.includes('world cup') || name.includes('fantasy');
    })
  );

  if (section === "trending-games") {
    return <GameSection id="trending-games" title="⚡ Trending Games" games={trendingGames} />
  }

  if (section === "slots") {
    return <GameSection id="slots" title="🎰 Trending Slot" games={filteredSlots} />
  }

  if (section === "fishing") {
    return <GameSection id="fishing" title="🎣 Fishing" games={filteredFishing} />
  }

  if (section === "poker") {
    return <GameSection id="poker" title="🃏 Indian Poker Games" games={filteredPoker} />
  }

  if (section === "fantasy") {
    return <GameSection id="fantasy-games" title="🎮 Fantasy Games" games={filteredFantasy.length > 0 ? filteredFantasy : filteredSlots.slice(0, 10)} />
  }

  // Default: return all in the new requested order if no section specified
  return (
    <div className="games-display space-y-3">
      <GameSection id="trending-games" title="⚡ Trending Games" games={trendingGames} />
      <GameSection id="slots" title="🎰 Trending Slot" games={filteredSlots} />
      <GameSection id="fantasy-games" title="🎮 Fantasy Games" games={filteredFantasy.length > 0 ? filteredFantasy : filteredSlots.slice(0, 10)} />
      <GameSection id="poker" title="🃏 Indian Poker Games" games={filteredPoker} />
      <GameSection id="fishing" title="🎣 Fishing" games={filteredFishing} />
    </div>
  )
}

export default GamesDisplay