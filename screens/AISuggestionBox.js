// screens/AISuggestionBox.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

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
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
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