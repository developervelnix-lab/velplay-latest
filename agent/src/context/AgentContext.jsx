import React, { createContext, useContext, useState, useEffect } from "react";
import { apiUrl } from "../utils/constants";

const AgentContext = createContext();

export const useAgent = () => useContext(AgentContext);

export const AgentProvider = ({ children }) => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0]
  });

  const getInitialAgentState = () => {
    try {
      const saved = localStorage.getItem("agent_user");
      if (saved) {
        const u = JSON.parse(saved);
        let roleFormatted = 'Agent';
        if (u.rank_level === 'senior_super_agent') roleFormatted = 'Senior Super Agent';
        else if (u.rank_level === 'super_agent') roleFormatted = 'Super Agent';
        else if (u.rank_level === 'master_agent') roleFormatted = 'Master Agent';
        else if (u.rank_level) roleFormatted = u.rank_level.replace(/_/g, ' ').toUpperCase();

        return {
          username: u.username || "",
          fullName: u.name || u.username || "Agent Account",
          role: roleFormatted,
          rank_level: u.rank_level || 'agent',
          partnership: parseFloat(u.partnership_pct || u.commission_rate || 0),
          email: u.email || "",
          phone: u.phone || "",
          balance: parseFloat(u.current_credit || u.current_balance || 0),
          exposure: parseFloat(u.exposed_credit || u.exposure_amount || 0),
          metrics: {}
        };
      }
    } catch (e) {}
    return {
      username: "",
      fullName: "",
      role: "Agent",
      partnership: 0,
      email: "",
      phone: "",
      balance: 0.0,
      exposure: 0.0,
      metrics: {}
    };
  };

  const [agentMe, setAgentMe] = useState(getInitialAgentState);
  const [clients, setClients] = useState([]);
  const [players, setPlayers] = useState([]);

  const token = localStorage.getItem("agent_token") || localStorage.getItem("token") || "";
  const getToken = () => localStorage.getItem("agent_token") || localStorage.getItem("token") || "";

  const fetchAgentData = async () => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl("/api/v1/agent/dashboard"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const rawText = await res.text();
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (jsonErr) {
        console.warn("Agent profile returned non-JSON:", rawText);
        return;
      }
      if (data.status === "success" && data.data) {
        const iden = data.data.identity || data.data.agent || {};
        const met = data.data.metrics || {};
        
        let roleFormatted = 'Agent';
        if (iden.rank_level === 'senior_super_agent') roleFormatted = 'Senior Super Agent';
        else if (iden.rank_level === 'super_agent') roleFormatted = 'Super Agent';
        else if (iden.rank_level === 'master_agent') roleFormatted = 'Master Agent';
        else if (iden.rank_level) roleFormatted = iden.rank_level.replace(/_/g, ' ').toUpperCase();

        const agentPayload = {
          username: iden.username || "",
          fullName: iden.name || iden.username || "Agent Account",
          role: roleFormatted,
          partnership: parseFloat(met.partnership_pct !== undefined ? met.partnership_pct : (iden.partnership_pct || 0)),
          email: iden.email || "",
          phone: iden.phone || "",
          balance: parseFloat(met.current_credit !== undefined ? met.current_credit : (iden.current_credit || 0)),
          exposure: parseFloat(met.exposed_credit !== undefined ? met.exposed_credit : (iden.exposed_credit || 0)),
          metrics: met,
          recentTransfers: Array.isArray(data.data.recent_transfers) ? data.data.recent_transfers : [],
          recentTransactions: Array.isArray(data.data.recent_transactions) ? data.data.recent_transactions : []
        };

        setAgentMe(agentPayload);
        try {
          localStorage.setItem("agent_user", JSON.stringify({
            username: iden.username,
            name: iden.name || iden.username,
            rank_level: iden.rank_level,
            partnership_pct: agentPayload.partnership,
            current_credit: agentPayload.balance,
            exposed_credit: agentPayload.exposure,
            email: iden.email
          }));
        } catch (e) {}
      }
    } catch (e) {
      console.error("Error fetching agent profile:", e);
    }
  };

        const fetchDownlines = async () => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
      
      const resAgents = await fetch(apiUrl(`/agent/downlines/index.php${tokenQuery}`), { headers });
      const rawAgents = await resAgents.text();
      let dataAgents = {};
      try { dataAgents = rawAgents ? JSON.parse(rawAgents) : {}; } catch (e) {}
      
      const resPlayers = await fetch(apiUrl(`/agent/players/index.php${tokenQuery}`), { headers });
      const rawPlayers = await resPlayers.text();
      let dataPlayers = {};
      try { dataPlayers = rawPlayers ? JSON.parse(rawPlayers) : {}; } catch (e) {}

      const clientArr = [];
      if (dataAgents.status === "success" && Array.isArray(dataAgents.data)) {
        dataAgents.data.forEach(item => {
          clientArr.push({
            id: item.id,
            username: item.username,
            name: item.name || item.username,
            level: item.rank_level === 'senior_super_agent' ? 'Senior Super Agent' : (item.rank_level === 'super_agent' ? 'Super Agent' : (item.rank_level === 'master_agent' ? 'Master Agent' : 'Agent')),
            creditRef: parseFloat(item.current_credit || item.credit_limit || 0),
            balance: parseFloat(item.current_credit || item.current_balance || 0),
            exposure: parseFloat(item.exposed_credit || item.exposure_amount || 0),
            partnership: parseFloat(item.partnership_pct || item.commission_rate || 0),
            players: item.player_count !== undefined ? item.player_count : (item.players_count || 0),
            status: item.status || "active",
            bettingBlocked: item.status === "suspended"
          });
        });
      }

      const playerArr = [];
      if (dataPlayers.status === "success" && Array.isArray(dataPlayers.data)) {
        dataPlayers.data.forEach(item => {
          playerArr.push({
            id: item.id,
            username: item.username,
            fullName: item.full_name || item.username,
            phone: item.phone || '',
            availableBal: parseFloat(item.balance || 0),
            pnl: 0,
            exposure: 0,
            type: "direct",
            status: item.status || "active"
          });
        });
      }

      setClients(clientArr);
      setPlayers(playerArr);
    } catch (e) {
      console.error("Error fetching downlines & players:", e);
    }
  };

  useEffect(() => {
    fetchAgentData();
    fetchDownlines();
  }, [token]);

  const transferClientCredit = (clientId, amount) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const newBal = c.balance + amount;
        return { ...c, balance: Math.max(0, newBal), creditRef: Math.max(0, newBal) };
      }
      return c;
    }));
  };

  const toggleClientBetting = (clientId) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return { ...c, bettingBlocked: !c.bettingBlocked };
      }
      return c;
    }));
  };

  const createClient = async (clientData) => {
    try {
      const res = await fetch(apiUrl("/api/v1/agent/downlines/create"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          username: clientData.username,
          name: clientData.name || clientData.username,
          password: clientData.password || "agent123",
          email: clientData.email || "",
          level: clientData.level || "Agent",
          rank_level: clientData.level || "Agent",
          partnership_pct: parseFloat(clientData.partnership) || 10.0,
          opening_credit: parseFloat(clientData.creditRef) || 0.0
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetchDownlines();
        await fetchAgentData();
        return { success: true, message: data.message || "Agent created successfully", data: data.data };
      } else {
        return { success: false, message: data.message || "Failed to create agent" };
      }
    } catch (e) {
      console.error("Create agent error:", e);
      return { success: false, message: "Network or server error creating agent." };
    }
  };

    const transferPlayerCredit = async (playerId, amount) => {
    try {
      const token = getToken();
      const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
      const url = `/agent/players/credit${tokenQuery}`;
      
      const res = await fetch(apiUrl(url), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          player_id: playerId,
          amount: parseFloat(amount),
          remark: "Player credit allocation"
        })
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Non-JSON response from server:", text);
        return { success: false, message: "Server response error: " + text.substring(0, 120) };
      }

      if (data.status === "success") {
        await fetchDownlines();
        await fetchAgentData();
        return { success: true, message: data.message || "Player credit updated successfully" };
      } else {
        return { success: false, message: data.message || "Failed to update player credit." };
      }
    } catch (e) {
      console.error("Player credit transfer error:", e);
      return { success: false, message: "Connection error: " + (e.message || e) };
    }
  };
  const togglePlayerBlock = (playerId) => toggleClientBetting(playerId);
          const createPlayer = async (playerData) => {
    try {
      const token = getToken();
      const url = token ? `/agent/players/create?token=${encodeURIComponent(token)}` : '/agent/players/create';
      
      const res = await fetch(apiUrl(url), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          username: playerData.username,
          password: playerData.password || "player123",
          full_name: playerData.fullName || playerData.name || playerData.username,
          phone: playerData.phone || "9999999999",
          opening_credit: parseFloat(playerData.creditRef || playerData.opening_credit || 0)
        })
      });
      
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Non-JSON response from server:", text);
        return { success: false, message: "Server response error: " + text.substring(0, 120) };
      }

      if (data.status === "success") {
        await fetchDownlines();
        await fetchAgentData();
        return { success: true, message: data.message || "Player account created successfully", data: data.data };
      } else {
        return { success: false, message: data.message || "Failed to create player account." };
      }
    } catch (e) {
      console.error("Create player error:", e);
      return { success: false, message: "Connection error: " + (e.message || e) };
    }
  };

  return (
    <AgentContext.Provider
      value={{
        dateRange,
        setDateRange,
        agentMe,
        setAgentMe,
        clients,
        players,
        transferClientCredit,
        toggleClientBetting,
        createClient,
        transferPlayerCredit,
        togglePlayerBlock,
        createPlayer,
        refreshData: () => { fetchAgentData(); fetchDownlines(); }
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};
