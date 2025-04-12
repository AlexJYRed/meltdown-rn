import React, { useContext } from "react";
import { View, Button, Text } from "react-native";
import { GameContext } from "../context/GameContext";

export default function ButtonPanel() {
  const { myId, allStates, toggleLever } = useContext(GameContext);
  const myPlayer = allStates[myId] || {};
  const myState = myPlayer.state || [false, false, false, false];
  const leverNames = myPlayer.levers || [
    "Lever 1",
    "Lever 2",
    "Lever 3",
    "Lever 4",
  ];

  return (
    <View style={{ padding: 40 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Your Levers:</Text>
      {myState.map((pressed, index) => (
        <Button
          key={index}
          title={`${leverNames[index]}: ${pressed ? "ON" : "OFF"}`}
          color={pressed ? "green" : "gray"}
          onPress={() => toggleLever(index)}
          disabled={pressed}
        />
      ))}

      <Text style={{ marginTop: 30, fontSize: 18 }}>Connected Players:</Text>
      {Object.entries(allStates).map(([id, { name, state, levers }]) => (
        <View key={id}>
          <Text>{name}</Text>
          <Text>Levers: {levers?.join(", ")}</Text>
          <Text>State: {JSON.stringify(state)}</Text>
        </View>
      ))}
    </View>
  );
}
