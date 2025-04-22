import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { GameContext } from "../context/GameContext";
import socket from "../utils/socket";
const { width, height } = Dimensions.get("window");

export default function GameScreen() {
  const {
    myId,
    allStates,
    myState,
    myLevers,
    toggleLever,
    leaveGame,
    rule,
    lives,
    instruction,
    score,
  } = useContext(GameContext);
  const router = useRouter();

  useEffect(() => {
    console.log("Updated allStates:", allStates);
  }, [allStates]);

  useEffect(() => {
    const handleViolation = ({ message }) => {
      Alert.alert("Rule Violation", message);
    };

    const handleStartGame = (data) => {
      console.log("Received start-game event:", data);
      if (data?.rule) {
        setRule(data.rule);
      } else {
        console.warn("No rule received in start-game event.");
      }
    };

    socket.on("violation", handleViolation);
    socket.on("start-game", handleStartGame);

    return () => {
      socket.off("violation", handleViolation);
      socket.off("start-game", handleStartGame);
    };
  }, []);

  const handleLeave = () => {
    leaveGame();
    router.replace("/");
  };

  return (
    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.background1}
      resizeMode="fill"
    >
      <ImageBackground
        source={require("../assets/bg_control.png")}
        style={styles.background2}
        resizeMode="fill"
      >
        <View style={styles.screen}>
          <Text style={styles.text}>Turn {instruction || "..."} ON</Text>
        </View>

        <View style={styles.controls}>
          {rule ? (
            <Text style={styles.smalltext}>
              ⚠️ Rule: {rule.dependent} button cannot be ON unless{" "}
              {rule.requires} is ON
            </Text>
          ) : (
            <Text style={styles.smalltext}>Waiting for rule...</Text>
          )}
          <Text style={styles.smalltext}>❤️ Lives: {lives}</Text>
          <Text style={styles.smalltext}>🧮 Score: {score ?? 0}</Text>
          {myLevers.map((lever, index) => (
            <Button
              key={index}
              title={`${lever}: ${myState[index] ? "ON" : "OFF"}`}
              onPress={() => toggleLever(index)}
              color={myState[index] ? "red" : "blue"}
            />
          ))}
        </View>

        <View style={{ padding: 40 }}>
          {/* <Text style={{ fontSize: 24, marginBottom: 20 }}>Control Room</Text> */}

          <Text style={{ marginTop: 30, fontSize: 16 }}>Players:</Text>
          {Object.entries(allStates).map(([id, player]) => (
            <Text key={id}>
              {player.name}: {JSON.stringify(player.state)} —{" "}
              {player.levers.join(", ")}
            </Text>
          ))}

          <View style={{ marginTop: 30 }}>
            <Button title="Leave Game" onPress={handleLeave} />
          </View>
        </View>
      </ImageBackground>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background1: {
    width,
    height,
  },
  background2: {
    width: width,
    height: height * 0.9,
  },
  screen: {
    position: "absolute",
    top: height * 0.14,
    left: width * 0.18,
  },
  controls: {
    marginTop: height * 0.37,
    marginLeft: width * 0.05,
    marginRight: width * 0.05,
  },
  text: {
    fontSize: 24,
    marginVertical: 10,
    color: "white",
  },
  smalltext: {
    fontSize: 16,
    marginBottom: 20,
  },
});
