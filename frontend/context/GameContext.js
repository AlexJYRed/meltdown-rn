import React, {
  createContext,
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import socket from "../utils/socket";

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [allStates, setAllStates] = useState({});
  const [myId, setMyId] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [myState, setMyState] = useState([false, false, false, false]);
  const [myLevers, setMyLevers] = useState([]);
  const [rule, setRule] = useState(null);
  const [lives, setLives] = useState(5);
  const [instruction, setInstruction] = useState(null);
  const [score, setScore] = useState(0);

  const lastPlayersRef = useRef({});

  useEffect(() => {
    if (myId && allStates[myId]) {
      const updated = allStates[myId].state;
      if (JSON.stringify(updated) !== JSON.stringify(myState)) {
        console.log("🔄 Syncing myState from allStates:", updated);
        setMyState(updated);
      }
    }
  }, [allStates, myId]);

  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      console.log("🔌 Connected to server as:", socket.id);
      setMyId(socket.id);
    };

    const handlePlayers = (data) => {
      const players = data.players ?? data;
      const ruleSet = data.rules || {};
      const me = players[socket.id];

      if (me?.state) setMyState(me.state);
      if (me?.levers) setMyLevers(me.levers);
      if (ruleSet[me?.hostId]) setRule(ruleSet[me.hostId]);
      if (typeof data.lives === "number") setLives(data.lives);
      if (typeof data.instruction === "string")
        setInstruction(data.instruction);
      if (typeof data.score === "number") setScore(data.score);

      const last = lastPlayersRef.current;
      const didChange = JSON.stringify(players) !== JSON.stringify(last);
      if (didChange) {
        const deepCloned = JSON.parse(JSON.stringify(players));
        lastPlayersRef.current = deepCloned;
        setAllStates(deepCloned);
      } else {
        console.warn("⚠️ Received player update but no changes detected.");
      }
    };

    const handleStartGame = ({ rule }) => {
      if (rule) setRule(rule);
    };

    socket.on("connect", handleConnect);
    socket.on("players", handlePlayers);
    socket.on("start-game", handleStartGame);

    const fallbackTimer = setTimeout(() => {
      if (Object.keys(lastPlayersRef.current).length === 0) {
        console.warn("⏰ No player data received — requesting manually.");
        socket.emit("find-hosts");
      }
    }, 5000);

    return () => {
      clearTimeout(fallbackTimer);
      socket.off("connect", handleConnect);
      socket.off("players", handlePlayers);
      socket.off("start-game", handleStartGame);
      socket.disconnect();
    };
  }, []);

  const toggleLever = useCallback((index) => {
    setMyState((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      socket.emit("updateState", newState);
      return newState;
    });
  }, []);

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
    setRule(null);
    setInstruction(null);
    setScore(0);
    setLives(5);
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
      lives,
      instruction,
      score,
    }),
    [
      myId,
      allStates,
      myState,
      myLevers,
      toggleLever,
      playerName,
      rule,
      lives,
      instruction,
      score,
    ]
  );

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}
