"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { FaChevronLeft, FaChevronRight, FaEye, FaArrowLeft, FaPlay } from "react-icons/fa"
import { liveSport } from "../jsondata/live"
import { turbogames } from "../jsondata/turbogames"
import { useNavigate, useSearchParams } from "react-router-dom"
import { API_URL } from "@/utils/constants"
import { useColors } from '../../hooks/useColors'
import { FONTS } from '../../constants/theme'
import { useSite } from "../../context/SiteContext"

const GameSection = ({ title, games }) => {
    const COLORS = useColors()
    const { setShowLogin } = useSite()
    const [preloadedImages, setPreloadedImages] = useState([])
    const [loadingForGames, setLoadingForGames] = useState(null)
    const [showPopup, setShowPopup] = useState(false)
    const [confirmPopup, setConfirmPopup] = useState({ show: false, game: null })
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const [hoveredGame, setHoveredGame] = useState(null)
    const [confirmLoading, setConfirmLoading] = useState(false)
    const [loadingProgress, setLoadingProgress] = useState(0)

    const popupParam = searchParams.get("show_all")
    const sectionId = title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")

    useEffect(() => {
        if (popupParam === sectionId) {
            setShowPopup(true)
        } else {
            setShowPopup(false)
        }
    }, [popupParam, sectionId])

    const openPopup = () => {
        setSearchParams((prev) => {
            prev.set("show_all", sectionId)
            return prev
        })
    }

    const closePopup = () => {
        setSearchParams((prev) => {
            prev.delete("show_all")
            return prev
        })
    }

    useEffect(() => {
        const images = games?.map((game) => game.icon) || []
        preloadImages(images)
    }, [games])

    // Effect to simulate loading progress
    useEffect(() => {
        if (confirmLoading) {
            setLoadingProgress(0)
            const interval = setInterval(() => {
                setLoadingProgress((prev) => {
                    const newProgress = prev + Math.random() * 15
                    return newProgress > 90 ? 90 : newProgress
                })
            }, 300)

            return () => clearInterval(interval)
        } else if (loadingProgress > 0) {
            setLoadingProgress(100)
            const timeout = setTimeout(() => {
                setLoadingProgress(0)
            }, 500)

            return () => clearTimeout(timeout)
        }
    }, [confirmLoading])

    const preloadImages = async (imageUrls) => {
        try {
            const promises = imageUrls.map(
                (imageUrl) =>
                    new Promise((resolve, reject) => {
                        const img = new Image()
                        img.src = imageUrl
                        img.onload = resolve
                        img.onerror = reject
                    }),
            )
            await Promise.all(promises)
            setPreloadedImages(imageUrls)
        } catch (error) {
            console.error("Error preloading images:", error)
        }
    }

    const handleGameClick = (game) => {
        const authSecretKey = localStorage.getItem("auth_secret_key")
        if (!authSecretKey) {
            setShowLogin(true)
            return
        }
        setConfirmPopup({ show: true, game })
    }

    const confirmGameOpen = async () => {
        const authSecretKey = localStorage.getItem("auth_secret_key")
        const userId = localStorage.getItem("account_id")

        const game = confirmPopup.game
        if (!game) return

        setLoadingForGames(game["Game UID"])
        setConfirmLoading(true)

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    route: "route-play-games",
                    AuthToken: authSecretKey,
                },
                body: JSON.stringify({
                    USER_ID: userId,
                    GAME_NAME: game["Game Name"],
                    GAME_UID: game["Game UID"],
                }),
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const data = await response.json()

            if (showPopup) {
                closePopup()
            }

            if (data.status_code === "authorization_error") {
                setConfirmPopup({
                    show: true,
                    game: game,
                    error: "authorization_error",
                })
            } else if (data.error || !data.data?.game_url) {
                console.error("Error launching game:", data.status_code || data.error || "No game URL")
                setConfirmPopup({
                    show: true,
                    game: game,
                    error: data.status_code || "unknown_error",
                })
            } else if (data.data?.game_url) {
                setTimeout(() => {
                    // Base64 encode the URL to prevent issues with slashes and special characters in the route
                    const encodedUrl = btoa(data.data.game_url);
                    navigate(`/game-url/${encodeURIComponent(encodedUrl)}/${encodeURIComponent(game["Game Name"])}`)
                }, 500)
            }
        } catch (error) {
            console.error("Error logging game click:", error)
            setConfirmPopup({
                show: true,
                game: game,
                error: "network_error",
            })
        } finally {
            setTimeout(() => {
                setLoadingForGames(null)
                setConfirmLoading(false)
            }, 500)
        }
    }

    return (
        <div
            className="game-section relative w-full px-4 py-5 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-black/5 dark:border-white/5"
            style={{
                backgroundColor: `${COLORS.bg2}EE`,
                backdropFilter: "blur(10px)",
            }}
        >
            <div
                className="absolute top-0 left-0 w-1.5 h-full opacity-70"
                style={{ background: COLORS.brandGradient }}
            ></div>

            <div className="flex justify-between items-center mb-4 md:mb-6 gap-2">
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                    <div
                        className="h-3 md:h-5 w-1 rounded-full flex-shrink-0"
                        style={{ background: COLORS.brandGradient }}
                    ></div>
                    <h2
                        className="text-[11px] xs:text-sm sm:text-base md:text-lg font-black text-black dark:text-white tracking-[0.05em] uppercase leading-none whitespace-nowrap truncate"
                        style={{ fontFamily: FONTS.head }}
                    >
                        {title}
                    </h2>
                </div>

                <button
                    onClick={openPopup}
                    className="see-all"
                    aria-label="See All"
                >
                    See All
                </button>
            </div>

            <div
                className="flex md:grid md:grid-cols-5 overflow-x-auto md:overflow-x-visible scrollbar-hide snap-x snap-mandatory gap-2 sm:gap-3 px-2 pb-4"
            >
                {games?.map((game, index) => (
                    <div key={index}
                        className="flex-shrink-0 w-[calc((100%-16px)/3)] sm:w-[calc((100%-24px)/3.5)] md:w-full snap-start relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-black/10 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl group cursor-pointer"
                        onClick={() => handleGameClick(game)}
                    >
                        <img
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${loadingForGames === game["Game UID"] ? "opacity-30 blur-sm" : ""
                                }`}
                            src={game.icon || "/placeholder.svg"}
                            alt={game["Game Name"]}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2 sm:p-3 pointer-events-none">
                            <span className="text-black dark:text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate w-full" style={{ fontFamily: FONTS.ui }}>
                                {game["Game Name"]}
                            </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                            <div
                                className="p-1.5 sm:p-5 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500 shadow-2xl"
                                style={{ background: COLORS.brandGradient }}
                            >
                                <FaPlay className="text-black dark:text-white ml-0.5 block sm:hidden" size={10} />
                                <FaPlay className="text-black dark:text-white ml-1 hidden sm:block" size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showPopup &&
                createPortal(
                    <div className="fixed inset-0 bg-black z-[99999] overflow-y-auto animate-fadeIn flex flex-col">
                        <div
                            className="fixed inset-0 pointer-events-none opacity-40"
                            style={{
                                backgroundImage: `radial-gradient(circle at 50% -20%, ${COLORS.brand}44, transparent 70%), radial-gradient(circle at 0% 100%, ${COLORS.brand}22, transparent 50%), radial-gradient(circle at 100% 100%, ${COLORS.brand}22, transparent 50%)`,
                            }}
                        ></div>

                        <div className="relative flex flex-col min-h-full backdrop-blur-[50px]">
                            <div
                                className="sticky top-0 z-[100] w-full border-b border-black/5 dark:border-white/5 shadow-2xl"
                                style={{ backgroundColor: `${COLORS.bg2}A0` }}
                            >
                                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between backdrop-blur-md">
                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={closePopup}
                                            className="bg-gray-100 dark:bg-white/5 hover:bg-gray-100 dark:bg-white/10 text-black dark:text-white rounded-2xl p-3.5 transition-all duration-300 border border-black/10 dark:border-white/10 shadow-lg active:scale-95 group"
                                            aria-label="Go Back"
                                        >
                                            <FaArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                        </button>
                                        <div className="h-10 w-1 rounded-full opacity-80" style={{ background: COLORS.brandGradient }}></div>
                                        <div>
                                            <h2
                                                className="text-2xl font-black text-black dark:text-white tracking-[0.15em] uppercase"
                                                style={{ fontFamily: FONTS.head }}
                                            >
                                                {title}
                                            </h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                                                <span className="text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-[0.2em]">
                                                    Premium Collection
                                                </span>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </div>

                            <div className="flex-1 w-full max-w-[1920px] mx-auto px-4 md:px-6 py-6">
                                <div className="see-all-grid gap-3 md:gap-6 animate-fadeInUp">
                                    {games.map((game, index) => (
                                        <div key={index} className="flex flex-col group cursor-pointer" onClick={() => handleGameClick(game)}>
                                            <div className="relative aspect-[4/5] rounded-xl overflow-hidden p-[1px] bg-gradient-to-br from-white/10 via-transparent to-white/5 transition-all duration-500 group-hover:from-brand/50 group-hover:to-brand/20 group-hover:shadow-[0_0_30px_rgba(29,78,216,0.4)] group-hover:-translate-y-1">
                                                <div className="relative w-full h-full rounded-[11px] overflow-hidden bg-gray-100 dark:bg-white/5">
                                                    <img
                                                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${loadingForGames === game["Game UID"] ? "opacity-30 blur-sm" : ""
                                                            }`}
                                                        src={game.icon || "/placeholder.svg"}
                                                        alt={game["Game Name"]}
                                                    />

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/5 opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div
                                                            className="p-3 rounded-full shadow-2xl transform scale-50 group-hover:scale-100 transition-all duration-500 hover:scale-110"
                                                            style={{ background: COLORS.brandGradient }}
                                                        >
                                                            <FaPlay className="text-black dark:text-white ml-0.5" size={12} />
                                                        </div>
                                                    </div>

                                                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                        <div className="backdrop-blur-md bg-black/10 dark:bg-black/40 rounded-lg p-1.5 border border-black/10 dark:border-white/10 text-center shadow-xl">
                                                            <p className="text-[9px] font-black text-black/90 dark:text-white/90 truncate uppercase tracking-tighter">
                                                                {game["Game Name"]}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="py-12 flex flex-col items-center justify-center gap-4 opacity-10">
                                <div className="h-px w-40 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.8em] text-black dark:text-white">
                                    Experience Excellence
                                </span>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}

            {confirmPopup.show && createPortal(
                <div className="fixed inset-0 flex items-center justify-center bg-black/10 dark:bg-black/40 backdrop-blur-2xl z-[99999] transition-all duration-500 animate-fadeIn">
                    <div
                        className="relative p-10 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] max-w-sm w-full mx-6 animate-fadeInUp border border-black/10 dark:border-white/10 text-center"
                        style={{
                            backgroundColor: `${COLORS.bg2}F2`,
                            backgroundImage: 'radial-gradient(circle at top right, rgba(230, 160, 0, 0.05), transparent 40%)'
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-[2.5rem]"></div>
                        <div
                            className="absolute -top-10 left-1/2 transform -translate-x-1/2 p-6 rounded-full shadow-2xl animate-bounce-slow"
                            style={{ background: COLORS.brandGradient }}
                        >
                            <FaPlay className="text-black dark:text-white ml-0.5" size={28} />
                        </div>
                        <div className="relative z-10 mt-8 mb-8">
                            {confirmPopup.error === "authorization_error" ? (
                                <div className="space-y-3">
                                    <h3
                                        className="text-xl font-black text-red-500 tracking-tight uppercase"
                                        style={{ fontFamily: FONTS.head }}
                                    >
                                        Session Expired
                                    </h3>
                                    <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed px-2">
                                        Your session has expired or you are not authorized to play this game. Please try logging in again.
                                    </p>
                                </div>
                            ) : confirmPopup.error ? (
                                <div className="space-y-3">
                                    <h3
                                        className="text-xl font-black text-red-500 tracking-tight uppercase"
                                        style={{ fontFamily: FONTS.head }}
                                    >
                                        Game Unavailable
                                    </h3>
                                    <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed px-2">
                                        This game is currently unavailable ({confirmPopup.error}). Please try another one.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h3
                                        className="text-xl font-black text-black dark:text-white tracking-tight uppercase"
                                        style={{ fontFamily: FONTS.head }}
                                    >
                                        Ready to Win?
                                    </h3>
                                    <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed px-2">
                                        You are about to enter <span className="text-black dark:text-white font-bold">{confirmPopup.game?.["Game Name"]}</span>. Good luck!
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-3">
                            {confirmPopup.error === "authorization_error" ? (
                                <button
                                    onClick={() => {
                                        localStorage.clear();
                                        window.dispatchEvent(new Event('site-data-refresh'));
                                        navigate("/");
                                        window.location.reload();
                                    }}
                                    className="w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-95 group overflow-hidden relative text-black dark:text-white"
                                    style={{ background: COLORS.brandGradient, fontFamily: FONTS.ui }}
                                >
                                    <div className="absolute inset-0 bg-gray-100 dark:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span>Log In Again</span>
                                </button>
                            ) : confirmPopup.error ? (
                                <button
                                    onClick={() => {
                                        setConfirmPopup({ show: false, game: null, error: null });
                                    }}
                                    className="w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-95 group overflow-hidden relative text-black dark:text-white"
                                    style={{ background: COLORS.brandGradient, fontFamily: FONTS.ui }}
                                >
                                    <div className="absolute inset-0 bg-gray-100 dark:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span>Try Other Game</span>
                                </button>
                            ) : (
                                <button
                                    onClick={confirmGameOpen}
                                    className="w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-95 group overflow-hidden relative text-black dark:text-white"
                                    style={{ background: COLORS.brandGradient, fontFamily: FONTS.ui }}
                                >
                                    <div className="absolute inset-0 bg-gray-100 dark:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span>Confirm Play</span>
                                </button>
                            )}
                            <button
                                onClick={() => setConfirmPopup({ show: false, game: null, error: null })}
                                className="w-full px-6 py-3 rounded-2xl font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/5 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300 border border-black/5 dark:border-white/5"
                                style={{ fontFamily: FONTS.ui }}
                            >
                                {confirmPopup.error ? "Close" : "Cancel"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {confirmLoading && createPortal(
                <div className="fixed inset-0 bg-black/25 dark:bg-black/60 backdrop-blur-2xl z-[999999] flex flex-col items-center justify-center transition-all duration-700 animate-fadeIn p-4 overflow-y-auto">
                    <div
                        className="w-[90%] max-w-[340px] md:max-w-md px-5 py-6 md:px-8 md:py-10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-black/10 dark:border-white/10 relative overflow-hidden text-center max-h-[92vh] overflow-y-auto scrollbar-none"
                        style={{
                            backgroundColor: `${COLORS.bg2}F2`,
                            backgroundImage: 'radial-gradient(circle at top right, rgba(230, 160, 0, 0.05), transparent 40%)'
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                        <div className="relative z-10 mb-6 md:mb-8">
                            {confirmPopup.game && (
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-4 md:mb-6 group">
                                        <div className="absolute -inset-4 bg-brand/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                        <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-black/10 dark:border-white/10 shadow-2xl transform transition-transform duration-700 hover:scale-105">
                                            <img
                                                src={confirmPopup.game.icon || "/placeholder.svg"}
                                                alt={confirmPopup.game["Game Name"]}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        </div>
                                    </div>
                                    <h3
                                        className="text-xl md:text-2xl font-black text-black dark:text-white mb-1.5 md:mb-2 tracking-wider uppercase"
                                        style={{ fontFamily: FONTS.head }}
                                    >
                                        {confirmPopup.game["Game Name"]}
                                    </h3>
                                    <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-[0.2em] animate-pulse">
                                        <span className="w-2 h-2 rounded-full bg-brand shadow-[0_0_10px_rgba(29,78,216,1)]"></span>
                                        Initializing Elite Experience
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative z-10 px-2 md:px-4 mb-6 md:mb-10">
                            <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1 overflow-hidden backdrop-blur-sm border border-black/5 dark:border-white/5">
                                <div
                                    className="h-full rounded-full transition-all duration-300 ease-out relative"
                                    style={{
                                        width: `${loadingProgress}%`,
                                        background: COLORS.brandGradient,
                                        boxShadow: `0 0 20px ${COLORS.brand}80`
                                    }}
                                >
                                    <div className="absolute top-0 right-0 w-8 h-full bg-gray-100 dark:bg-white/40 blur-sm animate-shimmer"></div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-3 px-1">
                                <span className="text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-widest">Connection Status</span>
                                <span className="text-[10px] text-brand font-black italic">{Math.round(loadingProgress)}%</span>
                            </div>
                        </div>
                        <div className="relative z-10 space-y-4 px-2 mb-10 text-left">
                            {[
                                { label: "Establishing Connection", threshold: 30 },
                                { label: "Syncing Game Assets", threshold: 60 },
                                { label: "Optimizing Performance", threshold: 85 }
                            ].map((step, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <span className={`text-xs transition-colors duration-500 ${loadingProgress > step.threshold ? "text-black/80 dark:text-white/80" : "text-black/20 dark:text-white/20"}`} style={{ fontFamily: FONTS.ui }}>
                                        {step.label}
                                    </span>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-700 ${loadingProgress > step.threshold
                                        ? "border-brand/40 bg-brand/10 text-brand scale-110 shadow-[0_0_15px_rgba(29,78,216,0.2)]"
                                        : "border-black/5 dark:border-white/5 bg-gray-100 dark:bg-white/2"
                                        }`}>
                                        {loadingProgress > step.threshold ? (
                                            <span className="text-[10px] font-bold">âœ“</span>
                                        ) : (
                                            <div className="w-1 h-1 bg-gray-100 dark:bg-white/10 rounded-full animate-ping"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="relative z-10 py-4 px-6 rounded-2xl bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-md group hover:bg-white/[0.08] transition-all duration-500">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-5 h-[1px] bg-brand/50"></div>
                                <span className="text-[10px] text-brand/80 font-black uppercase tracking-widest">Pro Tip</span>
                            </div>
                            <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed font-medium italic">
                                "Enable high performance mode in settings for the smoothest gameplay experience."
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center gap-4 opacity-30">
                        <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/50"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black dark:text-white">Velplay365 Elite</span>
                        <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/50"></div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

const Live = () => {
    return (
        <div className="games-display space-y-6 overflow-hidden">
            {" "}
            <GameSection title="âš½ Live Sports" games={liveSport} />
        </div>
    )
}

export default Live



