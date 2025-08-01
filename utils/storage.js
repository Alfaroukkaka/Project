// utils/storage.js or similar
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveCredentials = async (userData) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Failed to save credentials:', error);
    return false;
  }
};
