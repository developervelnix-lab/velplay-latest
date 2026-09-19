import React, { useEffect, useState } from "react";
import { useGames } from "../../context/GameContext";
import GameCategoryLayout from "./GameCategoryLayout";

function CrashGamesPage() {
  const games = useGames();
  const loading = games.loading;
  const [crashGames, setCrashGames] = useState([]);

  useEffect(() => {
    if (!loading) {
      const allGames = Object.values(games).filter(Array.isArray).flat();

      const filtered = allGames.filter((game) => {
        const navCat = (game.navbar_category || game["Navbar Category"] || "").trim().toLowerCase();
        return navCat === "crash games" || navCat === "crash" || navCat === "crash-games";
      });

      setCrashGames(Array.from(new Map(filtered.map((item) => [item["Game UID"] || item.id, item])).values()));
    }
  }, [games, loading]);

  return (
    <GameCategoryLayout
      title="Crash Games"
      icon="🚀"
      games={crashGames}
      loading={loading}
      sectionId="crash-games-collection"
      description="Fast-action crash and multiplier games in a single responsive lobby."
    />
  );
}

export default CrashGamesPage;