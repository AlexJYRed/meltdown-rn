import React, { useContext } from 'react';
import { View, Button, Text } from 'react-native';
import { GameContext } from '../context/GameContext';

export default function ButtonPanel() {
  const { myState, allStates, updateButton } = useContext(GameContext);

  return (
    <View style={{ padding: 40 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Your Controls:</Text>
      <Button
        title={`Red Button: ${myState[0] ? 'Pressed' : 'Unpressed'}`}
        color="red"
        onPress={() => updateButton(0)}
        disabled={myState[0]}
      />
      <Button
        title={`Blue Button: ${myState[1] ? 'Pressed' : 'Unpressed'}`}
        color="blue"
        onPress={() => updateButton(1)}
        disabled={myState[1]}
      />

      <Text style={{ marginTop: 30, fontSize: 18 }}>Connected Players:</Text>
      {Object.entries(allStates).map(([id, { name, state }]) => (
        <View key={id}>
          <Text>{name}</Text>
          <Text>
            State: {JSON.stringify(state)}
          </Text>
        </View>
      ))}
    </View>
  );
}
