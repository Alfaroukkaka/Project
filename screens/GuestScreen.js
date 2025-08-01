// GuestScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';

const backgroundUri =
  'https://sdmntprpolandcentral.oaiusercontent.com/files/00000000-921c-620a-af98-8aad4bc18e75/raw?se=2025-07-28T21%3A20%3A26Z&sp=r&sv=2024-08-04&sr=b&scid=dfc6604b-bafa-5d4b-9345-ab7ec4f8e607&skoid=a3412ad4-1a13-47ce-91a5-c07730964f35&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-28T18%3A06%3A40Z&ske=2025-07-29T18%3A06%3A40Z&sks=b&skv=2024-08-04&sig=mmdQBfXRs7Lj0oawM9bB0iG/Apj/eLBFsmCKhmAq7nw%3D';

export default function GuestScreen({ navigation }) {
  useEffect(() => {
    const guestUserData = {
      name: 'Guest',
      type: 'Guest',
    };

    navigation.replace('FoodInteraction', {
      userData: guestUserData,
      isGuest: true,
    });
  }, [navigation]); // ✅ Fix: include navigation in dependency array

  return (
    <ImageBackground source={{ uri: backgroundUri }} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.text}>Loading guest view...</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  text: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#666',
  },
});
