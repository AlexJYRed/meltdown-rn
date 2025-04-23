import { useState, useLayoutEffect } from "react";
import {
  View,
  Button,
  Text,
  TextInput,
  Image,
  Pressable,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { GameContext } from "../context/GameContext";
import { useContext } from "react";
const { width, height } = Dimensions.get("window");

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
    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.background}
      resizeMode="fill"
    >
      <SafeAreaView style={styles.safeArea}>
        <Image
          source={require("../assets/tv_name.png")}
          style={styles.tvImage}
          resizeMode="contain"
        />
        <View style={{ padding: 40 }}>
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
              fetch("http://<YOUR_LOCAL_IP>:3000/reset", {
                method: "POST",
              }).catch(() => {
                // fallback to socket
                const socket = require("../utils/socket").default;
                socket.emit("reset-all");
              });
            }}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width,
    height: height * 1.1,
  },
  container: {
    padding: 40,
    alignItems: "center",
  },
  tvImage: {
    width: width * 1,
    marginTop: height * 0.1,
    //marginBottom: height * 0.05,
    height: height * 0.4,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    width: "100%",
    backgroundColor: "#fff",
  },
});
