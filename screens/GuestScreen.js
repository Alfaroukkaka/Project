import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';

const backgroundUri = 'https://sdmntprpolandcentral.oaiusercontent.com/files/00000000-921c-620a-af98-8aad4bc18e75/raw?se=2025-07-28T22%3A31%3A39Z&sp=r&sv=2024-08-04&sr=b&scid=6d9d1348-659c-543f-b3c9-9a056b4dadb6&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-28T19%3A29%3A10Z&ske=2025-07-29T19%3A29%3A10Z&sks=b&skv=2024-08-04&sig=XzlWCkpkIXxTAW/KdVDRLSff3wLkc8QMpA3siJNiCHU%3D';

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
  }, [navigation]);
  
  return (
    <ImageBackground source={{ uri: backgroundUri }} style={styles.background}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1976D2" style={styles.loader} />
        <Text style={styles.text}>Loading guest view...</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loader: {
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#000', // Changed from #555 to black for better visibility
  },
});
