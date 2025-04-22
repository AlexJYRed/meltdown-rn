// app/join.js
import { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  Image,
  ImageBackground,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import socket from "../utils/socket";
import { GameContext } from "../context/GameContext";
const { width, height } = Dimensions.get("window");

export default function JoinScreen() {
  const [hosts, setHosts] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const router = useRouter();
  const { joinHost, allStates } = useContext(GameContext);

  useEffect(() => {
    socket.connect();
    socket.emit("find-hosts");

    socket.on("host-list", (list) => setHosts(list));
    socket.on("players", () => {}); // triggers context updates
    socket.on("start-game", () => router.replace("/game"));

    return () => {
      socket.off("host-list");
      socket.off("players");
      socket.off("start-game");
    };
  }, []);

  const handleJoin = (hostId) => {
    joinHost(hostId);
    setWaiting(true);
  };

  const joinedPlayers = Object.values(allStates);

  return (
    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.background}
      resizeMode="fill"
    >
      <View style={{ padding: 40 }}>
        {waiting ? (
          <>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>
              Waiting for host to start...
            </Text>
            <FlatList
              data={joinedPlayers}
              keyExtractor={(item, index) => item.name + index}
              renderItem={({ item }) => <Text>{item.name}</Text>}
            />
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width,
    height,
  },
});
