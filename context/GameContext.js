import React, { createContext, useEffect, useState } from "react";
import socket from "../utils/socket";

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [allStates, setAllStates] = useState({});
  const [myId, setMyId] = useState(null);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setMyId(socket.id);
    });

    socket.on("players", (data) => {
      setAllStates(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleButton = (index) => {
    const current = allStates[myId]?.state || [false, false];
    const newState = [...current];
    newState[index] = !newState[index];
    socket.emit("updateState", newState);
  };

  const hostGame = () => {
    socket.emit("host-game", playerName);
  };

  const joinHost = (hostId) => {
    socket.emit("join-host", { hostId, name: playerName });
  };

  return (
    <GameContext.Provider
      value={{
        myId,
        allStates,
        toggleButton,
        playerName,
        setPlayerName,
        hostGame,
        joinHost,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
