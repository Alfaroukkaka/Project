import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from 'react-native';

const backgroundUri = 'https://sdmntprpolandcentral.oaiusercontent.com/files/00000000-921c-620a-af98-8aad4bc18e75/raw?se=2025-07-28T22%3A31%3A39Z&sp=r&sv=2024-08-04&sr=b&scid=6d9d1348-659c-543f-b3c9-9a056b4dadb6&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-28T19%3A29%3A10Z&ske=2025-07-29T19%3A29%3A10Z&sks=b&skv=2024-08-04&sig=XzlWCkpkIXxTAW/KdVDRLSff3wLkc8QMpA3siJNiCHU%3D';

export default function AISuggestionBox() {
  const [ingredients, setIngredients] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleGetSuggestions = () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setTimeout(() => {
      // Fake AI Response Logic
      const ideas = [
        {
          title: 'Chicken Biryani',
          steps: [
            'Marinate the chicken with yogurt and spices for 30 minutes.',
            'Fry onions until golden brown.',
            'Layer rice, marinated chicken, and fried onions.',
            'Add saffron milk and cook on low heat for 25 minutes.'
          ]
        },
        {
          title: 'Tomato Chicken Curry',
          steps: [
            'Sauté onions, garlic, and ginger.',
            'Add chopped tomatoes and cook till soft.',
            'Add chicken and spices and simmer till done.',
            'Serve with rice.'
          ]
        },
        {
          title: 'Vegetable Rice Mix',
          steps: [
            'Boil rice and set aside.',
            'Sauté vegetables like tomato, potato, and canned peas.',
            'Mix with cooked rice and season.'
          ]
        }
      ];
      setSuggestions(ideas);
      setLoading(false);
    }, 1500);
  };
  
  return (
    <ImageBackground source={{ uri: backgroundUri }} style={styles.background}>
      <View style={styles.card}>
        <Text style={styles.label}>Ask AI: What can I cook with...</Text>
        <TextInput
          placeholder="e.g. rice, chicken, tomato"
          style={styles.input}
          value={ingredients}
          onChangeText={setIngredients}
        />
        <TouchableOpacity
          onPress={handleGetSuggestions}
          style={[styles.button, ingredients.trim() && styles.buttonActive]}
        >
          <Text style={styles.buttonText}>{loading ? 'Thinking...' : 'Get Recipe Suggestions'}</Text>
        </TouchableOpacity>
        <ScrollView style={styles.results}>
          {suggestions.map((item, idx) => (
            <View key={idx} style={styles.recipeBox}>
              <Text style={styles.recipeTitle}>🍽️ {item.title}</Text>
              {item.steps.map((step, i) => (
                <Text key={i} style={styles.recipeStep}>▪️ {step}</Text>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonActive: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  results: {
    marginTop: 10,
  },
  recipeBox: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  recipeTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  recipeStep: {
    fontSize: 14,
    marginLeft: 5,
  },
});
