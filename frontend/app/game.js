import { useContext } from "react";
import { View, Text, Button } from "react-native";
import { GameContext } from "../context/GameContext";

export default function GameScreen() {
  const { myId, allStates, toggleButton } = useContext(GameContext);
  const myPlayer = allStates[myId] || {};
  const myState = Array.isArray(myPlayer.state)
    ? myPlayer.state
    : [false, false];

  return (
    <View style={{ padding: 40 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Control Room</Text>

      {myState.map((pressed, index) => (
        <Button
          key={index}
          title={`Button ${index + 1} ${pressed ? "ON" : "OFF"}`}
          onPress={() => toggleButton(index)}
          color={pressed ? "red" : "blue"}
        />
      ))}

      <Text style={{ marginTop: 30, fontSize: 16 }}>Players:</Text>
      {Object.entries(allStates).map(([id, player]) => (
        <Text key={id}>
          {player.name}: {JSON.stringify(player.state)}
        </Text>
      ))}
    </View>
  );
}
