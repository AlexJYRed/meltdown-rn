import React, { useContext } from "react";
import { TouchableOpacity, Text } from "react-native";
import { GameContext } from "../context/GameContext";

export default function ControlButton({ index, label, color }) {
  const { myState, updateButton } = useContext(GameContext);
  const isPressed = myState[index];

  return (
    <TouchableOpacity
      style={{
        marginBottom: 10,
        padding: 20,
        backgroundColor: isPressed ? "#888" : color,
      }}
      onPress={() => updateButton(index)}
      disabled={isPressed}
    >
      <Text style={{ color: "white" }}>{label}</Text>
    </TouchableOpacity>
  );
}
