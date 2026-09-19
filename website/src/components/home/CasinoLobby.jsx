"use client"

import React from "react"
import { useGames } from "../../context/GameContext"
import GameSection from './GameSection';

const CasinoLobby = () => {
  const gamesContext = useGames();
  const { casino_lobby, casino, live } = gamesContext || {};

  // Providers to exclude from Live Casino
  const excludeProviders = [
    'India Lotto', 'SABA Sports', 'Saba', 'SportsGame', 'Sports', 'Lucky Sports', 
    'LuckSportsGame', 'BTi', 'CMD368', 'Pinnacle', 'SBOBET', 'United Gaming',
    'IN OUT MINI GAMES', 'InOut Minigames', 'inout minigames', 'Spribe'
  ];

  // Specific non-live keywords to exclude
  const nonLiveKeywords = [
    'aviator', 'mines', 'go rush', 'tower', 'plinko', 'limbo', 'diver', 'hamster run',
    'chicken road', 'ballonix', 'trump card', 'ballon', 'balloon', 'crash', 'squid gamebler',
    'aviafly', 'bubbles', 'cryptos', 'twist', 'stairs', 'triple', 'jogo do bicho', 'penalty unlimited',
    'forest arrow', 'rabbit road', 'robo dice', 'hilo joker', 'double online', 'wheel', 'spin wheel', 'jungle wheel'
  ];

  const isNonLive = (name, provider) => {
    const cleanName = (name || '').toLowerCase().trim();
    const cleanProv = (provider || '').toLowerCase().trim();

    if (excludeProviders.some(p => cleanProv.includes(p.toLowerCase()))) return true;
    if (nonLiveKeywords.some(kw => cleanName === kw || cleanName.includes(kw))) return true;
    if (cleanName === 'roulette' && cleanProv.includes('in out')) return true;

    return false;
  };

  const allCandidateGames = [
    ...(casino_lobby || []),
    ...(casino || []),
    ...(live || [])
  ];

  // Deduplicate and filter strictly to authentic Live Casino tables and provider lobbies
  const displayGames = Array.from(
    new Map(
      allCandidateGames
        .filter(game => {
          const name = (game["Game Name"] || "").toLowerCase().trim();
          const provider = game["Game Provider"] || game["provider"] || "";
          const navCat = (game.navbar_category || game["Navbar Category"] || "").toLowerCase().trim();

          if (isNonLive(name, provider)) return false;

          // Include provider lobbies
          if (name.includes('lobby')) return true;

          // Include real live casino table categories
          if (navCat === 'roulette' || navCat === 'baccarat' || navCat === 'blackjack' || navCat === 'dragon tiger' || navCat === 'game shows') return true;

          // Include matching live game names
          const isLiveTable = name.includes('roulette') || name.includes('baccarat') || name.includes('blackjack') || 
                              name.includes('dragon tiger') || name.includes('crazy time') || name.includes('monopoly') || 
                              name.includes('dream catcher') || name.includes('deal or no deal') || name.includes('fan tan') || 
                              name.includes('craps') || name.includes('lightning') || name.includes('andar bahar') || name.includes('teen patti');

          return isLiveTable;
        })
        .map(game => [game["Game UID"] || game["Game Name"] || game.id, game])
    ).values()
  );

  return (
    <div className="games-display space-y-6 overflow-hidden">
      <GameSection id="casino-lobby" title="🎲 Live Casino" games={displayGames} />
    </div>
  )
}

export default CasinoLobby