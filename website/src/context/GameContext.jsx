import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGet } from '@/utils/apiFetch';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [games, setGames] = useState(() => {
        const cached = typeof window !== 'undefined' ? localStorage.getItem("cached_games") : null;
        if (cached) {
            try { return JSON.parse(cached); } catch (e) { console.error("Error parsing cached games", e); }
        }
        return {
            slots: [],
            casino: [],
            fishing: [],
            poker: [],
            turbo: [],
            live: [],
            casino_lobby: [],
            topslot: []
        };
    });
    const [loading, setLoading] = useState(true);

    const fetchGames = async () => {
        try {
            console.log("🎮 [GameContext] Fetching games...");
            
            const response = await apiGet("route-get-games");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();

            if (result.status_code === "success" && result.data) {
                setGames(prev => {
                    const newGames = { ...prev, ...result.data };
                    localStorage.setItem("cached_games", JSON.stringify(newGames));
                    return newGames;
                });
            }
        } catch (error) {
            console.error("❌ [GameContext] Error fetching games:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    return (
        <GameContext.Provider value={{ ...games, loading, refreshGames: fetchGames }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGames = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error("useGames must be used within a GameProvider");
    }
    return context;
};
