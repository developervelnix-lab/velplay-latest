import React, { useEffect, useState } from "react";
import { useGames } from "../../context/GameContext";
import GameCategoryLayout from "./GameCategoryLayout";

function LotteryPage() {
  const games = useGames();
  const loading = games.loading;
  const [lotteryGames, setLotteryGames] = useState([]);

  useEffect(() => {
    if (!loading) {
      const allGames = Object.values(games).filter(Array.isArray).flat();

      const filtered = allGames.filter((game) => {
        const navCat = (game.navbar_category || game["Navbar Category"] || "").trim().toLowerCase();
        return navCat === "lottery" || navCat === "lotto";
      });

      setLotteryGames(Array.from(new Map(filtered.map((item) => [item["Game UID"] || item.id, item])).values()));
    }
  }, [games, loading]);

  return (
    <GameCategoryLayout
      title="Lottery"
      icon="🎟️"
      games={lotteryGames}
      loading={loading}
      sectionId="lottery-collection"
      description="Lottery and number games arranged in a simple lobby with quick access and clear browsing."
    />
  );
}

export default LotteryPage;