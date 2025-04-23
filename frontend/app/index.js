// app/index.js

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

  return (
    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.background}
      resizeMode="fill"
    >
      <SafeAreaView style={styles.safeArea}>
        <Image
          source={require("../assets/tv_title.png")}
          style={styles.tvImage}
          resizeMode="contain"
        />
        <Pressable onPress={() => router.push("/home")}>
          <Image
            source={require("../assets/arrow_play.png")}
            style={{
              width: width * 0.4,
              height: 100,
              marginTop: height * 0.2,
            }}
            resizeMode="contain"
          />
        </Pressable>
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
  tvImage: {
    width: width * 1.5,
    marginTop: height * 0.1,
    marginBottom: height * 0.05,
    height: height * 0.4,
  },
  safeArea: {
    alignItems: "center",
  },
});

export const options = {
  headerShown: false,
};
