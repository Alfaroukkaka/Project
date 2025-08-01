import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';

export default function VerificationScreen({ route, navigation }) {
  const { userData } = route.params;
  const [pinInput, setPinInput] = useState('');

  const handleVerify = async () => {
    try {
      const res = await fetch('https://<your-backend>/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email, pin: pinInput })
      });
      const result = await res.json();
      if (result.verified) {
        navigation.replace('FoodInteraction', {
          userData,
          isGuest: false,
          points: 0,
          donationHistory: []
        });
      } else {
        Alert.alert('Error', 'Invalid or expired PIN');
      }
    } catch {
      Alert.alert('Error', 'Verification failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Enter PIN sent to {userData.email}</Text>
      <TextInput
        style={styles.input}
        placeholder="6‑digit PIN"
        keyboardType="numeric"
        maxLength={6}
        value={pinInput}
        onChangeText={setPinInput}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
}
