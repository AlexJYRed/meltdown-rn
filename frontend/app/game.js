import { useContext, useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { GameContext } from "../context/GameContext";
import socket from "../utils/socket";

export default function GameScreen() {
  const { myId, allStates, myState, myLevers, toggleLever, leaveGame, rule } =
    useContext(GameContext);
  const router = useRouter();


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
    <View style={{ padding: 40 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Control Room</Text>

      {myLevers.map((lever, index) => (
        <Button
          key={index}
          title={`${lever}: ${myState[index] ? "ON" : "OFF"}`}
          onPress={() => toggleLever(index)}
          color={myState[index] ? "red" : "blue"}
        />
      ))}

      {rule ? (
        <Text style={{ fontSize: 18, marginBottom: 20 }}>
          ⚠️ Rule: {rule.dependent} lever cannot be ON unless {rule.requires} is
          ON
        </Text>
      ) : (
        <Text style={{ fontSize: 18, marginBottom: 20, color: "gray" }}>
          Waiting for rule...
        </Text>
      )}

      <Text style={{ marginTop: 30, fontSize: 16 }}>Players:</Text>
      {Object.entries(allStates).map(([id, player]) => (
        <Text key={id}>
          {player.name}: {JSON.stringify(player.state)} —{" "}
          {player.levers?.join(", ")}
        </Text>
      ))}

      <View style={{ marginTop: 30 }}>
        <Button title="Leave Game" onPress={handleLeave} />
      </View>
    </View>
  );
}
