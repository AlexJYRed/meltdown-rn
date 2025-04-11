// app/host.js
import { useRouter } from "expo-router";
import { useEffect, useContext, useState } from "react";
import { View, Text, Button, FlatList } from "react-native";
import { GameContext } from "../context/GameContext";
import socket from "../utils/socket";

export default function HostScreen() {
  const router = useRouter();
  const { hostGame, playerName, allStates, myId } = useContext(GameContext);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    hostGame();
    socket.on("start-game", () => {
      setStarted(true);
      router.replace("/game");
    });
    return () => {
      socket.off("start-game");
    };
  }, []);

  const handleStart = () => {
    socket.emit("start-game");
  };

  const playerList = Object.entries(allStates).filter(([id]) => id !== myId);

  return (
    <View style={{ padding: 40 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Welcome, {playerName} (host)
      </Text>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Players Joined:</Text>
      <FlatList
        data={playerList}
        keyExtractor={([id]) => id}
        renderItem={({ item }) => (
          <Text>{item[1].name}</Text>
        )}
      />
      <View style={{ marginTop: 30 }}>
        <Button title="Start Game" onPress={handleStart} disabled={playerList.length === 0} />
      </View>
    </View>
  );
}

