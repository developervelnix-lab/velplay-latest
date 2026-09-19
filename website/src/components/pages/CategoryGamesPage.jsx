import React, { useEffect, useState } from "react"
import { useParams, useLocation } from "react-router-dom"
import { useGames } from "../../context/GameContext"
import GameCategoryLayout from "./GameCategoryLayout"

const CATEGORY_ICONS = {
  'lottery': '🎟️',
  'crash games': '🚀',
  'crash-games': '🚀',
  'crash': '🚀',
  'roulette': '🎡',
  'blackjack': '🃏',
  'baccarat': '💎',
  'dragon tiger': '🐯',
  'dragon-tiger': '🐯',
  'teen patti': '🎴',
  'teen-patti': '🎴',
  'poker': '♠️',
  'game shows': '📺',
  'game-shows': '📺',
  'andar bahar': '🎴',
  'andar-bahar': '🎴',
  'cockfight': '🐓',
  'cock fight': '🐓',
  'cock-fight': '🐓',
  'fantasy': '🎮',
  'fantasy games': '🎮',
  'fantasy-games': '🎮',
  'slots': '🎰',
  'casino': '🎲',
  'fishing': '🎣',
  'turbo': '⚡',
  'live': '🔴',
  'table': '♠️',
}

function CategoryGamesPage(props) {
  const params = useParams()
  const location = useLocation()
  const games = useGames()
  const loading = games.loading
  const [categoryGames, setCategoryGames] = useState([])

  let rawCat = props.title || params.categoryName || location.pathname.replace(/^\//, '').replace(/-/g, ' ')
  const cleanCat = rawCat.trim().toLowerCase()
  const displayTitle = props.title || (rawCat.charAt(0).toUpperCase() + rawCat.slice(1))
  const icon = props.icon || CATEGORY_ICONS[cleanCat] || CATEGORY_ICONS[cleanCat.replace(/\s+/g, '-')] || '🎮'

  useEffect(() => {
    if (!loading) {
      const allGames = Object.values(games).filter(Array.isArray).flat()
      
      const filtered = allGames.filter((g) => {
        const navCat = (g.navbar_category || g["Navbar Category"] || "").trim().toLowerCase()
        if (!navCat) return false
        
        const normNav = navCat.replace(/[^a-z0-9]/g, '')
        const normTarget = cleanCat.replace(/[^a-z0-9]/g, '')

        if (normNav === normTarget) return true
        if (normNav === normTarget + 'games' || normNav + 'games' === normTarget) return true
        return false
      })

      // Deduplicate by Game UID
      const unique = Array.from(
        new Map(filtered.map((item) => [item["Game UID"] || item.id, item])).values()
      )
      setCategoryGames(unique)
    }
  }, [games, loading, cleanCat])

  return (
    <GameCategoryLayout
      title={displayTitle}
      icon={icon}
      games={categoryGames}
      loading={loading}
      sectionId={`${cleanCat.replace(/\s+/g, '-')}-collection`}
      description={`Explore ${displayTitle} games arranged in a dedicated lobby with instant play.`}
    />
  )
}

export default CategoryGamesPage