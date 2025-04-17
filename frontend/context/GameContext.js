import React, {
  createContext,
  useEffect,
  useState,
  useMemo,
  useRef,
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

  const lastPlayersRef = useRef({});

  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      console.log("🔌 Connected to server as:", socket.id);
      setMyId(socket.id);
    };

    const handlePlayers = (data) => {
      const players = data.players ?? data;
      console.log("📦 Received 'players' payload:", players);

      const ruleSet = data.rules || {};
      const me = players[socket.id];
      if (me?.state) setMyState(me.state);
      if (me?.levers) setMyLevers(me.levers);
      if (ruleSet[me?.hostId]) {
        console.log("📜 Rule from ruleset:", ruleSet[me.hostId]);
        setRule(ruleSet[me.hostId]);
      }

      // Check if the state actually changed
      const last = lastPlayersRef.current;
      const didChange = JSON.stringify(players) !== JSON.stringify(last);
      if (!didChange) {
        console.warn("⚠️ Received player update but no changes detected.");
      } else {
        console.log("✅ Updating allStates with new data.");
        lastPlayersRef.current = players;
        setAllStates(players);
      }
    };

    const handleStartGame = ({ rule }) => {
      if (rule) {
        setRule(rule);
        console.log("🚀 Received rule on start-game:", rule);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("players", handlePlayers);
    socket.on("start-game", handleStartGame);

    // Safety: Request state if not received in 5s
    const fallbackTimer = setTimeout(() => {
      if (Object.keys(lastPlayersRef.current).length === 0) {
        console.warn("⏰ No player data received — requesting manually.");
        socket.emit("find-hosts"); // optionally request a full refresh
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

  const toggleLever = (index) => {
    const newState = [...myState];
    newState[index] = !newState[index];
    setMyState(newState);
    console.log(`🕹️ Lever ${index} toggled to ${newState[index]}`);
    socket.emit("updateState", newState);
  };

  const hostGame = () => {
    console.log("📡 Emitting host-game");
    socket.emit("host-game", playerName);
  };

  const joinHost = (hostId) => {
    console.log(`📡 Emitting join-host to ${hostId}`);
    socket.emit("join-host", { hostId, name: playerName });
  };

  const leaveGame = () => {
    console.log("📤 Emitting leave-game");
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
