import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ImageBackground,
  ScrollView,
  Button,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const backgroundUri = 'https://sdmntprpolandcentral.oaiusercontent.com/files/00000000-921c-620a-af98-8aad4bc18e75/raw?se=2025-07-28T21%3A20%3A26Z&sp=r&sv=2024-08-04&sr=b&scid=dfc6604b-bafa-5d4b-9345-ab7ec4f8e607&skoid=a3412ad4-1a13-47ce-91a5-c07730964f35&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-28T18%3A06%3A40Z&ske=2025-07-29T18%3A06%3A40Z&sks=b&skv=2024-08-04&sig=mmdQBfXRs7Lj0oawM9bB0iG/Apj/eLBFsmCKhmAq7nw%3D';

export default function FoodInteractionScreen({ route }) {
  const { userData } = route.params || {};
  const [action, setAction] = useState('');
  const [feedCount, setFeedCount] = useState('');
  const [isNew, setIsNew] = useState('');
  const [isConsumable, setIsConsumable] = useState('');
  const [image, setImage] = useState(null);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const generateRecipeSuggestions = () => {
    if (!aiInput.trim()) {
      Alert.alert('Please type ingredients first');
      return;
    }

    // Simulated AI response
    const ingredients = aiInput.trim().toLowerCase();
    const suggestionsList = [
      {
        title: 'Tomato & Potato Stew',
        steps: [
          'Chop tomatoes and potatoes into cubes.',
          'Heat oil, sauté onions, then add tomatoes.',
          'Add potatoes, water, and seasoning.',
          'Simmer for 25 minutes until soft.',
        ],
      },
      {
        title: 'Canned Mix Salad',
        steps: [
          'Open and drain canned goods.',
          'Mix with chopped fresh tomato and cooked potato.',
          'Add olive oil, salt, lemon juice.',
          'Chill and serve cold.',
        ],
      },
      {
        title: 'Vegetable Bake',
        steps: [
          'Preheat oven to 180°C.',
          'Layer sliced potatoes and tomatoes in tray.',
          'Add herbs and drizzle oil.',
          'Bake for 35–40 minutes until golden.',
        ],
      },
    ];

    setSuggestions(suggestionsList);
  };

  return (
    <ImageBackground source={{ uri: backgroundUri }} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Hello {userData?.name || 'Guest'} ({userData?.type || 'User'})</Text>

        <Text style={styles.subheader}>Choose Action:</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.selectButton, action === 'donate' && styles.activeButton]}
            onPress={() => setAction('donate')}
          >
            <Text style={styles.buttonText}>Donate Food</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectButton, action === 'request' && styles.activeButton]}
            onPress={() => setAction('request')}
          >
            <Text style={styles.buttonText}>Request Food</Text>
          </TouchableOpacity>
        </View>

        {action === 'donate' && (
          <>
            <TextInput
              placeholder="How many people can this food feed?"
              value={feedCount}
              onChangeText={setFeedCount}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Is the food new or leftover?"
              value={isNew}
              onChangeText={setIsNew}
              style={styles.input}
            />
            <TextInput
              placeholder="Is the food consumable by humans? (yes/no)"
              value={isConsumable}
              onChangeText={setIsConsumable}
              style={styles.input}
            />
            <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
              <Text style={styles.uploadButtonText}>📷 Upload or Take Photo</Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Your Location"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
            />
            <TextInput
              placeholder="Your Phone Number"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </>
        )}

        <Text style={styles.subheader}>🥣 Get Recipe Suggestions</Text>
        <TextInput
          placeholder="e.g. I have tomato, potato, and canned beans"
          value={aiInput}
          onChangeText={setAiInput}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={generateRecipeSuggestions}
          style={[
            styles.suggestionButton,
            aiInput.trim() && styles.suggestionButtonActive,
          ]}
        >
          <Text style={styles.buttonText}>Get Recipe Suggestions</Text>
        </TouchableOpacity>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((s, idx) => (
              <View key={idx} style={styles.recipeCard}>
                <Text style={styles.recipeTitle}>{s.title}</Text>
                {s.steps.map((step, stepIdx) => (
                  <Text key={stepIdx} style={styles.recipeStep}>• {step}</Text>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.88)',
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  subheader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#2e8b57',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  activeButton: {
    backgroundColor: '#2196F3',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  suggestionButton: {
    backgroundColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  suggestionButtonActive: {
    backgroundColor: '#2196F3',
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  recipeCard: {
    backgroundColor: '#eef6fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  recipeStep: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
});