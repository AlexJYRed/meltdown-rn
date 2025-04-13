// app/index.js

import { useState } from "react";
import { View, Button, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { GameContext } from "../context/GameContext";
import { useContext } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const { setPlayerName } = useContext(GameContext);
  const [nameInput, setNameInput] = useState("");

  const handleNavigate = (path) => {
    const trimmedName = nameInput.trim();
    if (trimmedName.length > 0) {
      setPlayerName(trimmedName);
      router.push(path);
    } else {
      alert("Please enter your name first.");
    }
  };

  return (
    <View style={{ padding: 40 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Meltdown</Text>

      <TextInput
        placeholder="Enter your name"
        value={nameInput}
        onChangeText={setNameInput}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />

      <Button title="Host Game" onPress={() => handleNavigate("/host")} />
      <View style={{ height: 20 }} />
      <Button title="Join Game" onPress={() => handleNavigate("/join")} />

      <Button
        title="⚠️ Reset Server"
        color="darkred"
        onPress={() => {
          fetch("http://<YOUR_LOCAL_IP>:3000/reset", { method: "POST" }).catch(
            () => {
              // fallback to socket
              const socket = require("../utils/socket").default;
              socket.emit("reset-all");
            }
          );
        }}
      />
    </View>
  );
}
