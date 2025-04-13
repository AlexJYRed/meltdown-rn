// context/GameContext.js
import React, { createContext, useEffect, useState, useMemo } from "react";
import socket from "../utils/socket";

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [allStates, setAllStates] = useState({});
  const [myId, setMyId] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [myState, setMyState] = useState([false, false, false, false]);
  const [myLevers, setMyLevers] = useState([]);
  const [rule, setRule] = useState(null);

  useEffect(() => {
    socket.connect();

    const handleConnect = () => setMyId(socket.id);
    const handlePlayers = (data) => {
      const allPlayerStates = data.players ?? data;
      setAllStates(allPlayerStates);

      const me = allPlayerStates[socket.id];
      if (me?.state) setMyState(me.state);
      if (me?.levers) setMyLevers(me.levers);

      if (data.rules) {
        const rule = data.rules[me?.hostId];
        if (rule) {
          setRule(rule);
        }
      }

      console.log("Received players + rules payload:", data);
    };

    const handleStartGame = ({ rule }) => {
      if (rule) {
        setRule(rule); // ✅ store it
        console.log("Received rule:", rule);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("players", handlePlayers);
    socket.on("start-game", handleStartGame);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("players", handlePlayers);
      socket.off("start-game", handleStartGame);
      socket.disconnect();
    };
  }, []);

  const toggleLever = (index) => {
    const newState = [...myState];
    newState[index] = !newState[index];
    setMyState(newState);
    socket.emit("updateState", newState);
  };

  const hostGame = () => {
    socket.emit("host-game", playerName);
  };

  const joinHost = (hostId) => {
    socket.emit("join-host", { hostId, name: playerName });
  };

  const leaveGame = () => {
    socket.emit("leave-game");
    setAllStates({});
    setMyState([false, false, false, false]);
    setMyLevers([]);
    setMyId(null);
  };

  const contextValue = useMemo(
    () => ({
      myId,
      allStates,
      myState,
      myLevers,
      toggleLever,
      playerName,
      setPlayerName,
      hostGame,
      joinHost,
      leaveGame,
      rule,
    }),
    [myId, allStates, myState, myLevers, toggleLever, playerName, rule]
  );
  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}
