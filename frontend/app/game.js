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
  console.log("Re-rendering GameScreen");

  const {
    myId,
    allStates,
    myState,
    myLevers,
    toggleLever,
    leaveGame,
    rule,
    setRule,
    instruction,
    setInstruction,
    lives,
    setLives,
    score,
    setScore,
  } = useContext(GameContext);

  const router = useRouter();

  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    console.log("Updated allStates:", allStates);
    setForceRender((prev) => !prev);
  }, [allStates]);

  useEffect(() => {
    const handleViolation = ({ message }) => {
      Alert.alert("Rule Violation", message);
    };

    const handleStartGame = ({ rule, instruction, score, lives }) => {
      console.log("Received start-game:", {
        rule,
        instruction,
        score,
        lives,
      });
      if (rule) setRule(rule);
      if (instruction) setInstruction(instruction);
      if (typeof score === "number") setScore(score);
      if (typeof lives === "number") setLives(lives);
    };

    socket.on("violation", handleViolation);
    socket.on("start-game", handleStartGame);

    const handlePlayersUpdate = ({
      players,
      rules,
      lives,
      score,
      instruction,
    }) => {
      console.log("Received players update:", players);

      // Update context state
      setScore(score);
      setLives(lives);
      setInstruction(instruction);
    };

    socket.on("players", handlePlayersUpdate);

    return () => {
      socket.off("violation", handleViolation);
      socket.off("start-game", handleStartGame);
      socket.off("players", handlePlayersUpdate);
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
          <Text style={{ color: "black" }}>myId: {myId}</Text>
          <Text style={{ color: "black" }}>
            my state: {JSON.stringify(allStates[myId]?.state)}
          </Text>

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
          {myLevers.map((lever, index) => {
            // fallback: use myState first, fall back to allStates[myId] if available
            const isOn =
              myState[index] ?? allStates[myId]?.state?.[index] ?? false;

            return (
              <Button
                key={index}
                title={`${lever}: ${isOn ? "ON" : "OFF"}`}
                onPress={() => toggleLever(index)}
                color={isOn ? "red" : "blue"}
              />
            );
          })}
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
    height: height * 1.1,
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
