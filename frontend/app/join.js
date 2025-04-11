// app/join.js

import { useEffect, useState, useContext } from "react";
import { View, Text, Button, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import socket from "../utils/socket";
import { GameContext } from "../context/GameContext";

export default function JoinScreen() {
  const [hosts, setHosts] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const router = useRouter();
  const { joinHost } = useContext(GameContext);

  useEffect(() => {
    socket.connect();
    socket.emit("find-hosts");

    socket.on("host-list", (list) => {
      setHosts(list);
    });

    socket.on("start-game", () => {
      router.replace("/game");
    });

    return () => {
      socket.off("host-list");
      socket.off("start-game");
    };
  }, []);

  const handleJoin = (hostId) => {
    joinHost(hostId);
    setWaiting(true);
  };

  return (
    <View style={{ padding: 40 }}>
      {waiting ? (
        <>
          <Text style={{ fontSize: 24, marginBottom: 20 }}>
            Waiting for host to start...
          </Text>
          <ActivityIndicator size="large" />
        </>
      ) : (
        <>
          <Text style={{ fontSize: 24, marginBottom: 20 }}>
            Available Hosts:
          </Text>
          <FlatList
            data={hosts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Button
                title={item.name || item.id}
                onPress={() => handleJoin(item.id)}
              />
            )}
          />
        </>
      )}
    </View>
  );
}
