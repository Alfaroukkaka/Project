import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export const handleImagePick = async (setImageUri) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 1,
  });
  if (!result.canceled) setImageUri(result.assets[0].uri);
};

export const handleTakePhoto = async (setImageUri) => {
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 1,
  });
  if (!result.canceled) setImageUri(result.assets[0].uri);
};

export const handleSubmitDonation = ({
  people,
  isNew,
  isConsumable,
  location,
  phone,
  imageUri,
  setDonationHistory,
  donationHistory,
  setPoints,
  setMode,
  setPeople,
  setIsNew,
  setIsConsumable,
  setLocation,
  setPhone,
  setImageUri,
}) => {
  if (!people || isNew === null || isConsumable === null || !location || !phone || !imageUri) {
    Alert.alert('Missing Information', 'Please fill in all fields and upload a photo.');
    return;
  }

  Alert.alert(
    '🎉 Donation Successful!',
    'Thank you for your generous contribution! 🎁\n\nYou’ve earned +20 points 🏆 and our driver will soon come to collect the food. 🚗🍽️'
  );

  const historyItem = {
    id: Date.now(),
    people,
    isNew,
    isConsumable,
    location,
    phone,
    date: new Date().toLocaleString(),
  };

  setDonationHistory([historyItem, ...donationHistory]);
  setPoints((prev) => prev + 20);
  setMode(null);
  setPeople('');
  setIsNew(null);
  setIsConsumable(null);
  setLocation('');
  setPhone('');
  setImageUri(null);
};

export const handleSubmitRequest = ({
  requestReason,
  requestPeople,
  location,
  phone,
  setMode,
  setRequestReason,
  setRequestPeople,
  setLocation,
  setPhone,
}) => {
  if (!requestReason || !location || !phone || !requestPeople) {
    Alert.alert('Missing Info', 'Please fill in all fields');
    return;
  }

  Alert.alert('✅ Request Submitted', 'Your food request has been submitted. We will contact you soon!');
  setMode(null);
  setRequestReason('');
  setRequestPeople('');
  setLocation('');
  setPhone('');
};

export const handleAIRequest = async ({
  aiInput,
  setLoading,
  setAiResponse,
}) => {
  if (!aiInput.trim()) {
    Alert.alert('Empty Input', 'Please enter your food question.');
    return;
  }

  try {
    setLoading(true);
    setAiResponse('');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful cooking assistant.' },
          { role: 'user', content: aiInput },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer YOUR_OPENAI_KEY',
        },
      }
    );
    const reply = response.data.choices[0].message.content;
    setAiResponse(reply);
  } catch (error) {
    console.error(error);
    setAiResponse('Something went wrong. Please try again later.');
  } finally {
    setLoading(false);
  }
};

export const handleLogout = (navigation, setSettingsVisible) => {
  setSettingsVisible(false);
  navigation.navigate('Welcome');
};
