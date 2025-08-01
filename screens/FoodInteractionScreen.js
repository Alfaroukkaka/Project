// FoodInteractionScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  Modal,
  Switch,
  Linking,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LanguageContext } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const backgroundUri = 'https://sdmntprpolandcentral.oaiusercontent.com/files/00000000-921c-620a-af98-8aad4bc18e75/raw?se=2025-07-28T22%3A31%3A39Z&sp=r&sv=2024-08-04&sr=b&scid=6d9d1348-659c-543f-b3c9-9a056b4dadb6&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-28T19%3A29%3A10Z&ske=2025-07-29T19%3A29%3A10Z&sks=b&skv=2024-08-04&sig=XzlWCkpkIXxTAW/KdVDRLSff3wLkc8QMpA3siJNiCHU%3D';

export default function FoodInteractionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const { language, setLanguage, t, isRTL } = useContext(LanguageContext);
  const { userData = {}, isGuest = true } = route.params || {};
  
  // Initialize state with route params or default values
  const [mode, setMode] = useState(null);
  const [people, setPeople] = useState('');
  const [isNew, setIsNew] = useState(null);
  const [isConsumable, setIsConsumable] = useState(null);
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(route.params.points || 0);
  const [requestReason, setRequestReason] = useState('');
  const [requestPeople, setRequestPeople] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [donationHistory, setDonationHistory] = useState(route.params.donationHistory || []);
  const [activeSection, setActiveSection] = useState(null);
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  
  const [editedUserData, setEditedUserData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '',
    type: userData.type || '',
    address: userData.address || '',
  });
  
  // Set dark mode based on system preference
  useEffect(() => {
    setDarkMode(colorScheme === 'dark');
  }, [colorScheme]);
  
  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);
  
  // Save user data when points or donation history changes
  useEffect(() => {
    saveUserData();
  }, [points, donationHistory]);
  
  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      // If we have points and donation history from route params, use those
      if (route.params.points !== undefined && route.params.donationHistory !== undefined) {
        setPoints(route.params.points);
        setDonationHistory(route.params.donationHistory);
        return;
      }
      
      // Otherwise, try to load from AsyncStorage using user email
      if (userData.email) {
        const usersJson = await AsyncStorage.getItem('users');
        if (usersJson) {
          const users = JSON.parse(usersJson);
          const user = users.find(u => u.email === userData.email);
          
          if (user) {
            setPoints(user.points || 0);
            setDonationHistory(user.donationHistory || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  
  // Save user data to AsyncStorage
  const saveUserData = async () => {
    try {
      // If we have user email, save to their account
      if (userData.email && !isGuest) {
        const usersJson = await AsyncStorage.getItem('users');
        if (usersJson) {
          const users = JSON.parse(usersJson);
          const userIndex = users.findIndex(u => u.email === userData.email);
          
          if (userIndex !== -1) {
            // Update user's points and donation history
            users[userIndex].points = points;
            users[userIndex].donationHistory = donationHistory;
            users[userIndex].lastUpdated = new Date().toISOString();
            
            // Save updated users array
            await AsyncStorage.setItem('users', JSON.stringify(users));
          }
        }
      }
      
      // Also save to current session data
      const sessionData = {
        points,
        donationHistory,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem('userData', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };
  
  // Handle section toggling
  const toggleSection = (sectionName) => {
    if (activeSection === sectionName) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionName);
    }
  };
  
  // Apply dark mode styles with RTL support
  const dynamicStyles = {
    background: { flex: 1 },
    container: { 
      paddingTop: 60,       // Increased top padding from 20 to 60
      paddingHorizontal: 20, 
      paddingBottom: 20, 
      backgroundColor: darkMode ? '#121212' : 'rgba(255,255,255,0.9)',
      direction: isRTL ? 'rtl' : 'ltr',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    userSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingsButton: {
      marginRight: 10,
    },
    backButton: {
      padding: 5,
    },
    spacer: {
      width: 30,
    },
    pointsSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'flex-end',
    },
    questionButton: {
      marginLeft: 5,
      backgroundColor: darkMode ? '#333' : '#e0e0e0',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    questionMark: {
      fontSize: 12,
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#666',
    },
    userInfo: {
      fontSize: 16,
      fontWeight: '500',
      color: darkMode ? '#fff' : '#333',
      textAlign: isRTL ? 'right' : 'left',
    },
    points: { 
      fontSize: 16, 
      fontWeight: 'bold', 
      color: darkMode ? '#4CAF50' : '#2e8b57',
      textAlign: isRTL ? 'left' : 'right',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 20,
      color: darkMode ? '#4CAF50' : '#2e8b57',
    },
    button: {
      backgroundColor: '#2196F3',
      padding: 15,
      borderRadius: 10,
      marginVertical: 10,
      alignItems: 'center',
    },
    buttonText: { 
      color: '#fff', 
      fontWeight: 'bold',
      fontSize: fontSize,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#ccc',
      borderRadius: 6,
      padding: 10,
      marginTop: 5,
      marginBottom: 10,
      backgroundColor: darkMode ? '#1E1E1E' : '#fff',
      color: darkMode ? '#fff' : '#333',
      fontSize: fontSize,
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    question: { 
      fontWeight: 'bold', 
      marginTop: 10,
      color: darkMode ? '#fff' : '#333',
      fontSize: fontSize,
      textAlign: isRTL ? 'right' : 'left',
    },
    switchRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginBottom: 10 
    },
    switchButton: {
      flex: 1,
      padding: 10,
      backgroundColor: darkMode ? '#333' : '#eee',
      marginHorizontal: 5,
      borderRadius: 6,
      alignItems: 'center',
    },
    selected: { 
      backgroundColor: darkMode ? '#2E7D32' : '#a5d6a7' 
    },
    photoButton: {
      backgroundColor: darkMode ? '#333' : '#ddd',
      padding: 10,
      borderRadius: 6,
      marginVertical: 5,
      marginRight: 10,
    },
    preview: {
      width: '100%',
      height: 180,
      borderRadius: 10,
      marginVertical: 10,
    },
    submitButton: {
      backgroundColor: darkMode ? '#2E7D32' : '#2e8b57',
      padding: 15,
      borderRadius: 10,
      marginTop: 15,
      alignItems: 'center',
    },
    submitText: { 
      color: '#fff', 
      fontWeight: 'bold',
      fontSize: fontSize,
      textAlign: 'center',
    },
    aiBox: {
      marginTop: 30,
      backgroundColor: darkMode ? '#1E1E1E' : '#fff',
      padding: 15,
      borderRadius: 10,
      borderColor: darkMode ? '#444' : '#ccc',
      borderWidth: 1,
    },
    aiButton: {
      backgroundColor: '#2196F3',
      padding: 10,
      borderRadius: 6,
      marginTop: 10,
      alignItems: 'center',
    },
    aiResponse: { 
      marginTop: 15, 
      fontStyle: 'italic', 
      color: darkMode ? '#ccc' : '#555',
      fontSize: fontSize,
      textAlign: isRTL ? 'right' : 'left',
    },
    
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      width: '100%',
      backgroundColor: darkMode ? '#1E1E1E' : 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 30,
      elevation: 10,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? '#333' : '#eee',
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#333',
      textAlign: isRTL ? 'right' : 'left',
    },
    
    // Profile Section
    profileSection: {
      alignItems: 'center',
      marginBottom: 25,
    },
    profileImageContainer: {
      position: 'relative',
      marginBottom: 10,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    profileImagePlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: darkMode ? '#333' : '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#2196F3',
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: darkMode ? '#1E1E1E' : 'white',
    },
    profileName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#333',
      textAlign: 'center',
    },
    profileType: {
      fontSize: 14,
      color: darkMode ? '#ccc' : '#666',
      marginTop: 2,
      textAlign: 'center',
    },
    
    // Section Styles
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: darkMode ? '#2C2C2C' : '#f8f8f8',
      borderRadius: 8,
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    sectionTitle: {
      fontWeight: 'bold',
      fontSize: 16,
      flex: 1,
      marginLeft: 10,
      color: darkMode ? '#fff' : '#333',
      textAlign: isRTL ? 'right' : 'left',
    },
    cardContent: {
      backgroundColor: darkMode ? '#2C2C2C' : '#f8f8f8',
      padding: 15,
      borderRadius: 8,
      marginBottom: 15,
    },
    infoText: {
      fontSize: fontSize,
      marginBottom: 8,
      color: darkMode ? '#fff' : '#333',
      textAlign: isRTL ? 'right' : 'left',
    },
    infoTextSmall: {
      fontSize: fontSize - 2,
      color: darkMode ? '#ccc' : '#666',
      marginBottom: 6,
      textAlign: isRTL ? 'right' : 'left',
    },
    editLink: {
      color: '#2196F3',
      textAlign: 'center',
      marginTop: 12,
      fontWeight: '500',
    },
    infoTextItalic: {
      fontStyle: 'italic',
      color: darkMode ? '#999' : '#888',
      marginBottom: 5,
      textAlign: 'center',
    },
    editLabel: {
      fontWeight: 'bold',
      marginTop: 10,
      marginBottom: 5,
      color: darkMode ? '#fff' : '#333',
      textAlign: isRTL ? 'right' : 'left',
    },
    editInput: {
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#ddd',
      borderRadius: 6,
      padding: 10,
      marginBottom: 12,
      backgroundColor: darkMode ? '#1E1E1E' : '#fff',
      fontSize: fontSize,
      color: darkMode ? '#fff' : '#333',
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    editButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
    },
    saveButton: {
      backgroundColor: '#2e8b57',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 6,
      flex: 0.45,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    cancelButton: {
      backgroundColor: '#dc3545',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 6,
      flex: 0.45,
    },
    cancelButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    
    // Settings Styles
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    settingText: {
      fontSize: fontSize,
      color: darkMode ? '#fff' : '#333',
      textAlign: isRTL ? 'right' : 'left',
    },
    settingDescription: {
      fontSize: fontSize - 2,
      color: darkMode ? '#ccc' : '#666',
      marginTop: 5,
      marginBottom: 10,
      textAlign: isRTL ? 'right' : 'left',
    },
    sliderContainer: {
      marginTop: 10,
      marginBottom: 15,
    },
    sliderLabel: {
      fontSize: fontSize - 2,
      color: darkMode ? '#ccc' : '#666',
      marginBottom: 10,
      textAlign: 'center',
    },
    sliderTrack: {
      height: 6,
      backgroundColor: darkMode ? '#444' : '#ddd',
      borderRadius: 3,
      marginVertical: 10,
    },
    sliderProgress: {
      height: 6,
      backgroundColor: '#2196F3',
      borderRadius: 3,
      width: `${((fontSize - 12) / 8) * 100}%`,
    },
    sliderThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#2196F3',
      position: 'absolute',
      top: -7,
      left: `${((fontSize - 12) / 8) * 100}%`,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    sliderButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
    },
    sliderButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: darkMode ? '#333' : '#f0f0f0',
    },
    sliderButtonText: {
      color: darkMode ? '#fff' : '#333',
      fontSize: fontSize - 2,
    },
    sliderButtonActive: {
      backgroundColor: '#2196F3',
    },
    sliderButtonTextActive: {
      color: '#fff',
    },
    
    // Support Styles
    supportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: darkMode ? '#2C2C2C' : '#fff',
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#eee',
    },
    supportButtonText: {
      fontSize: fontSize,
      color: darkMode ? '#fff' : '#333',
      marginLeft: 10,
      textAlign: isRTL ? 'right' : 'left',
    },
    
    // Logout Button
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F44336',
      padding: 15,
      borderRadius: 10,
      marginTop: 10,
      marginBottom: 20,
    },
    logoutButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      marginLeft: 8,
      fontSize: fontSize,
    },
    
    // Points Modal Styles
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      maxHeight: '80%',
    },
    pointsInfoText: {
      fontSize: fontSize,
      lineHeight: 22,
      marginBottom: 15,
      color: darkMode ? '#fff' : '#333',
      textAlign: isRTL ? 'right' : 'left',
    },
    boldText: {
      fontWeight: 'bold',
      color: darkMode ? '#4CAF50' : '#2e8b57',
    },
    closeButton: {
      backgroundColor: '#2196F3',
      padding: 12,
      borderRadius: 8,
      marginTop: 15,
      alignItems: 'center',
    },
    closeButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    sectionTitle: {
      fontSize: fontSize + 2,
      fontWeight: 'bold',
      color: darkMode ? '#4CAF50' : '#2e8b57',
      marginTop: 15,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    subTitle: {
      fontSize: fontSize,
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#333',
      marginTop: 10,
      marginBottom: 5,
      textAlign: isRTL ? 'right' : 'left',
    },
    infoText: {
      fontSize: fontSize,
      lineHeight: 20,
      color: darkMode ? '#fff' : '#444',
      marginBottom: 10,
      textAlign: isRTL ? 'right' : 'left',
    },
    appGuideContainer: {
      marginTop: 30,
      backgroundColor: darkMode ? '#2C2C2C' : '#f8f9fa',
      padding: 20,
      borderRadius: 12,
      borderColor: darkMode ? '#444' : '#e0e0e0',
      borderWidth: 1,
    },
    guideTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      color: darkMode ? '#4CAF50' : '#2e8b57',
    },
    guideSectionTitle: {
      fontSize: fontSize + 2,
      fontWeight: 'bold',
      color: darkMode ? '#4CAF50' : '#2e8b57',
      marginTop: 20,
      marginBottom: 10,
      textAlign: isRTL ? 'right' : 'left',
    },
    guideSubTitle: {
      fontSize: fontSize,
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#333',
      marginTop: 15,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    guideText: {
      fontSize: fontSize,
      lineHeight: 22,
      color: darkMode ? '#fff' : '#444',
      marginBottom: 12,
      textAlign: isRTL ? 'right' : 'left',
    },
    guideBoldText: {
      fontWeight: 'bold',
      color: darkMode ? '#4CAF50' : '#2e8b57',
    },
    
    // Donation History Detail Styles
    donationDetailCard: {
      backgroundColor: darkMode ? '#2C2C2C' : '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#eee',
    },
    donationDetailHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    donationDetailTitle: {
      fontSize: fontSize + 2,
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#333',
      textAlign: isRTL ? 'right' : 'left',
    },
    donationDetailDate: {
      fontSize: fontSize - 2,
      color: darkMode ? '#999' : '#666',
      textAlign: isRTL ? 'left' : 'right',
    },
    donationDetailRow: {
      flexDirection: 'row',
      marginBottom: 5,
    },
    donationDetailLabel: {
      fontSize: fontSize - 1,
      fontWeight: 'bold',
      color: darkMode ? '#ccc' : '#666',
      width: 120,
      textAlign: isRTL ? 'right' : 'left',
    },
    donationDetailValue: {
      fontSize: fontSize - 1,
      color: darkMode ? '#fff' : '#333',
      flex: 1,
      textAlign: isRTL ? 'right' : 'left',
    },
    donationDetailStatus: {
      fontSize: fontSize - 1,
      fontWeight: 'bold',
      color: '#4CAF50',
      marginTop: 10,
      textAlign: isRTL ? 'left' : 'right',
    },
  };
  
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };
  
  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };
  
  const handleProfileImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };
  
  const handleSubmitDonation = () => {
    if (!people || isNew === null || isConsumable === null || !location || !phone || !imageUri) {
      Alert.alert(t('missingInfo'), t('pleaseFillAll'));
      return;
    }
    Alert.alert(t('donationSuccess'), t('donationSuccessMsg'));
    const historyItem = {
      id: Date.now(),
      people,
      isNew,
      isConsumable,
      location,
      phone,
      date: new Date().toLocaleString(),
      status: 'Pending',
      estimatedPickup: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
      driverName: 'Ahmed',
      driverPhone: '+971-50-123-4567',
      foodType: isNew ? 'Prepared Food' : 'Leftovers',
      weight: Math.floor(Math.random() * 10) + 1 + ' kg',
    };
    
    // Update donation history and points
    setDonationHistory(prevHistory => [historyItem, ...prevHistory]);
    setPoints(prevPoints => prevPoints + 20);
    
    // Reset form
    setMode(null);
    setPeople('');
    setIsNew(null);
    setIsConsumable(null);
    setLocation('');
    setPhone('');
    setImageUri(null);
  };
  
  const handleSubmitRequest = () => {
    if (!requestReason || !location || !phone || !requestPeople) {
      Alert.alert(t('missingInfo'), t('pleaseFillAll'));
      return;
    }
    Alert.alert(t('requestSuccess'), t('requestSuccessMsg'));
    setMode(null);
    setRequestReason('');
    setRequestPeople('');
    setLocation('');
    setPhone('');
  };
  
  const handleAIRequest = async () => {
    if (!aiInput.trim()) {
      Alert.alert(t('emptyInput'), t('pleaseEnterQuestion'));
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
      setAiResponse(t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function that clears stored session data
  const handleLogout = async () => {
    try {
      // Clear only session data, not account data
      await AsyncStorage.removeItem('userData');
      
      // Reset local state
      setPoints(0);
      setDonationHistory([]);
      setProfileImage(null);
      
      // Close settings modal
      setSettingsVisible(false);
      
      // Navigate to Welcome screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
      
      Alert.alert(t('logoutSuccess'), t('sessionCleared'));
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert(t('logoutError'), t('tryAgain'));
    }
  };
  
  const handleEditUser = () => {
    setIsEditingUser(true);
    setEditedUserData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      type: userData.type || '',
      address: userData.address || '',
    });
  };
  
  const handleSaveUser = async () => {
    try {
      // Update local user data
      Object.assign(userData, editedUserData);
      setIsEditingUser(false);
      
      // Update user account in AsyncStorage
      if (userData.email && !isGuest) {
        const usersJson = await AsyncStorage.getItem('users');
        if (usersJson) {
          const users = JSON.parse(usersJson);
          const userIndex = users.findIndex(u => u.email === userData.email);
          
          if (userIndex !== -1) {
            // Update user's information
            users[userIndex].name = editedUserData.name;
            users[userIndex].phone = editedUserData.phone;
            users[userIndex].type = editedUserData.type;
            users[userIndex].address = editedUserData.address;
            users[userIndex].lastUpdated = new Date().toISOString();
            
            // Save updated users array
            await AsyncStorage.setItem('users', JSON.stringify(users));
          }
        }
      }
      
      Alert.alert(t('success'), t('accountUpdated'));
    } catch (error) {
      console.error('Error saving user information:', error);
      Alert.alert(t('error'), t('tryAgain'));
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditingUser(false);
    setEditedUserData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      type: userData.type || '',
      address: userData.address || '',
    });
  };
  
  const handleContactSupport = () => {
    Linking.openURL('mailto:support@tawfeer.ae?subject=Support%20Request&body=Hello%20Tawfeer%20Team,');
  };
  
  const handleVisitWebsite = () => {
    Linking.openURL('https://www.tawfeer.ae');
  };
  
  const handleRateApp = () => {
    Alert.alert('Rate Our App', 'Thank you for your feedback! This would open your app store in a real app.');
  };
  
  const handleFontSizeChange = (size) => {
    setFontSize(size);
  };
  
  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground source={{ uri: backgroundUri }} style={dynamicStyles.background}>
        <ScrollView contentContainerStyle={dynamicStyles.container}>
          <View style={dynamicStyles.topRow}>
            {!mode ? (
              <View style={dynamicStyles.userSection}>
                <TouchableOpacity onPress={() => setSettingsVisible(true)} style={dynamicStyles.settingsButton}>
                  <Ionicons name="settings-outline" size={24} color={darkMode ? "#fff" : "black"} />
                </TouchableOpacity>
                <Text style={dynamicStyles.userInfo}>
                  {userData.name || 'Guest'} ({userData.type || 'Guest'})
                </Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setMode(null)} style={dynamicStyles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#2196F3" />
              </TouchableOpacity>
            )}
            <View style={dynamicStyles.spacer} />
            <View style={dynamicStyles.pointsSection}>
              <Text style={dynamicStyles.points}>Points: {points} 🏅</Text>
              <TouchableOpacity onPress={() => setShowPointsInfo(true)} style={dynamicStyles.questionButton}>
                <Text style={dynamicStyles.questionMark}>?</Text>
              </TouchableOpacity>
            </View>
          </View>
          {!mode && (
            <>
              <Text style={dynamicStyles.title}>{t('wouldYouLikeTo')}</Text>
              <TouchableOpacity style={dynamicStyles.button} onPress={() => setMode('donate')}>
                <Text style={dynamicStyles.buttonText}>{t('donateFood')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={dynamicStyles.button} onPress={() => setMode('request')}>
                <Text style={dynamicStyles.buttonText}>{t('requestFood')}</Text>
              </TouchableOpacity>
            </>
          )}
          {mode === 'donate' && (
            <View>
              <Text style={dynamicStyles.question}>{t('howManyPeople')}</Text>
              <TextInput 
                style={dynamicStyles.input} 
                placeholder={t('e.g. 4')} 
                value={people} 
                onChangeText={setPeople} 
                keyboardType="numeric" 
                placeholderTextColor={darkMode ? '#888' : '#999'}
              />
              <Text style={dynamicStyles.question}>{t('isFoodNew')}</Text>
              <View style={dynamicStyles.switchRow}>
                <TouchableOpacity 
                  style={[dynamicStyles.switchButton, isNew === true && dynamicStyles.selected]} 
                  onPress={() => setIsNew(true)}
                >
                  <Text>{t('yes')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[dynamicStyles.switchButton, isNew === false && dynamicStyles.selected]} 
                  onPress={() => setIsNew(false)}
                >
                  <Text>{t('no')}</Text>
                </TouchableOpacity>
              </View>
              <Text style={dynamicStyles.question}>{t('isFoodConsumable')}</Text>
              <View style={dynamicStyles.switchRow}>
                <TouchableOpacity 
                  style={[dynamicStyles.switchButton, isConsumable === true && dynamicStyles.selected]} 
                  onPress={() => setIsConsumable(true)}
                >
                  <Text>{t('yes')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[dynamicStyles.switchButton, isConsumable === false && dynamicStyles.selected]} 
                  onPress={() => setIsConsumable(false)}
                >
                  <Text>{t('no')}</Text>
                </TouchableOpacity>
              </View>
              <Text style={dynamicStyles.question}>{t('uploadPhoto')}</Text>
              <View style={dynamicStyles.switchRow}>
                <TouchableOpacity style={dynamicStyles.photoButton} onPress={handleImagePick}>
                  <Text>{t('selectPhoto')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={dynamicStyles.photoButton} onPress={handleTakePhoto}>
                  <Text>{t('takePhoto')}</Text>
                </TouchableOpacity>
              </View>
              {imageUri && <Image source={{ uri: imageUri }} style={dynamicStyles.preview} />}
              <Text style={dynamicStyles.question}>{t('location')}</Text>
              <TextInput 
                style={dynamicStyles.input} 
                placeholder={t('enterLocation')} 
                value={location} 
                onChangeText={setLocation} 
                placeholderTextColor={darkMode ? '#888' : '#999'}
              />
              <Text style={dynamicStyles.question}>{t('phoneNumber')}</Text>
              <TextInput 
                style={dynamicStyles.input} 
                placeholder={t('enterPhone')} 
                value={phone} 
                onChangeText={setPhone} 
                keyboardType="phone-pad" 
                placeholderTextColor={darkMode ? '#888' : '#999'}
              />
              <TouchableOpacity style={dynamicStyles.submitButton} onPress={handleSubmitDonation}>
                <Text style={dynamicStyles.submitText}>{t('submitDonation')}</Text>
              </TouchableOpacity>
            </View>
          )}
          {mode === 'request' && (
            <View>
              <Text style={dynamicStyles.question}>{t('whyRequesting')}</Text>
              <TextInput 
                style={dynamicStyles.input} 
                multiline 
                placeholder={t('e.g. Lost job, large family, etc.')} 
                value={requestReason} 
                onChangeText={setRequestReason}
                placeholderTextColor={darkMode ? '#888' : '#999'}
              />
              <Text style={dynamicStyles.question}>{t('howManyPeopleRequest')}</Text>
              <TextInput 
                style={dynamicStyles.input} 
                placeholder={t('e.g. 5')} 
                value={requestPeople} 
                onChangeText={setRequestPeople} 
                keyboardType="numeric"
                placeholderTextColor={darkMode ? '#888' : '#999'}
              />
              <Text style={dynamicStyles.question}>{t('location')}</Text>
              <TextInput 
                style={dynamicStyles.input} 
                placeholder={t('enterLocation')} 
                value={location} 
                onChangeText={setLocation}
                placeholderTextColor={darkMode ? '#888' : '#999'}
              />
              <Text style={dynamicStyles.question}>{t('phoneNumber')}</Text>
              <TextInput 
                style={dynamicStyles.input} 
                placeholder={t('enterPhone')} 
                value={phone} 
                onChangeText={setPhone} 
                keyboardType="phone-pad"
                placeholderTextColor={darkMode ? '#888' : '#999'}
              />
              <TouchableOpacity style={dynamicStyles.submitButton} onPress={handleSubmitRequest}>
                <Text style={dynamicStyles.submitText}>{t('submitRequest')}</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Only show AI box and Tawfeer guide when not in donate or request mode */}
          {!mode && (
            <>
              <View style={dynamicStyles.aiBox}>
                <Text style={dynamicStyles.question}>{t('askAI')}</Text>
                <TextInput 
                  style={dynamicStyles.input} 
                  placeholder={t('e.g. tomato, rice, onion — or ask how to make biryani')} 
                  value={aiInput} 
                  onChangeText={setAiInput}
                  placeholderTextColor={darkMode ? '#888' : '#999'}
                />
                <TouchableOpacity style={dynamicStyles.aiButton} onPress={handleAIRequest}>
                  <Text style={dynamicStyles.submitText}>{t('getRecipe')}</Text>
                </TouchableOpacity>
                {loading && <ActivityIndicator size="small" color="#2196F3" style={{ marginTop: 10 }} />}
                {aiResponse !== '' && <Text style={dynamicStyles.aiResponse}>{aiResponse}</Text>}
              </View>
              
              <View style={dynamicStyles.appGuideContainer}>
                <Text style={dynamicStyles.guideTitle}>📱 Tawfeer - Complete Guide</Text>
                
                <Text style={dynamicStyles.guideSectionTitle}>🎯 About Tawfeer</Text>
                <Text style={dynamicStyles.guideText}>
                  Tawfeer is a smart mobile application built in the UAE to combat one of the most serious global challenges: food waste. 
                  It helps individuals, restaurants, supermarkets, and organizations donate or repurpose food instead of wasting it.
                </Text>
                
                <Text style={dynamicStyles.guideSectionTitle}>🌟 Our Goals</Text>
                <Text style={dynamicStyles.guideText}>
                  • Reduce food waste across UAE homes and businesses{'\n'}
                  • Promote donation of safe, edible food{'\n'}
                  • Support UAE Vision 2031 sustainability goals{'\n'}
                  • Use AI to analyze ingredients and give recipe tips{'\n'}
                  • Reward users to encourage repeated contributions{'\n'}
                  • Build a community focused on sustainability
                </Text>
                
                <Text style={dynamicStyles.guideSectionTitle}>📖 How to Use Tawfeer</Text>
                
                <Text style={dynamicStyles.guideSubTitle}>🍽️ Donating Food:</Text>
                <Text style={dynamicStyles.guideText}>
                  1. Click "Donate Food" on the main screen{'\n'}
                  2. Fill in how many people the food can serve{'\n'}
                  3. Specify if the food is new or leftover{'\n'}
                  4. Confirm the food is safe for human consumption{'\n'}
                  5. Take or upload a photo of the food{'\n'}
                  6. Enter your location and phone number{'\n'}
                  7. Submit - earn 20 points and help the community!
                </Text>
                
                <Text style={dynamicStyles.guideSubTitle}>🙏 Requesting Food:</Text>
                <Text style={dynamicStyles.guideText}>
                  1. Click "Request Food" on the main screen{'\n'}
                  2. Explain why you need food assistance{'\n'}
                  3. Specify how many people will be served{'\n'}
                  4. Enter your location and contact information{'\n'}
                  5. Submit your request - we'll contact you soon!
                </Text>
                
                <Text style={dynamicStyles.guideSubTitle}>🤖 AI Recipe Assistant:</Text>
                <Text style={dynamicStyles.guideText}>
                  • Ask AI about cooking with specific ingredients{'\n'}
                  • Get recipe suggestions for leftover food{'\n'}
                  • Learn how to make meals with what you have{'\n'}
                  • Available on every screen for quick help
                </Text>
                
                <Text style={dynamicStyles.guideSubTitle}>⚙️ Settings & Profile:</Text>
                <Text style={dynamicStyles.guideText}>
                  • View and edit your profile information{'\n'}
                  • Check your donation history{'\n'}
                  • Track your points and contributions{'\n'}
                  • Customize notifications and appearance{'\n'}
                  • Get help and support{'\n'}
                  • Logout when needed
                </Text>
                
                <Text style={dynamicStyles.guideSectionTitle}>🏆 Points System</Text>
                <Text style={dynamicStyles.guideText}>
                  Earn 20 points for each food donation. Points track your positive impact on reducing food waste 
                  and supporting the community. The more you contribute, the more you help build a sustainable UAE!
                </Text>
                
                <Text style={dynamicStyles.guideSectionTitle}>🌍 Environmental Impact</Text>
                <Text style={dynamicStyles.guideText}>
                  Every donation through Tawfeer helps:{'\n'}
                  • Reduce methane emissions from food waste{'\n'}
                  • Save water and energy used in food production{'\n'}
                  • Support families and individuals in need{'\n'}
                  • Build a more sustainable UAE community
                </Text>
                
                <Text style={dynamicStyles.guideSectionTitle}>👥 User Types</Text>
                <Text style={dynamicStyles.guideText}>
                  • <Text style={dynamicStyles.guideBoldText}>Household:</Text> Families and individuals{'\n'}
                  • <Text style={dynamicStyles.guideBoldText}>Restaurant:</Text> Food service businesses{'\n'}
                  • <Text style={dynamicStyles.guideBoldText}>Supermarket:</Text> Grocery stores and markets{'\n'}
                  • <Text style={dynamicStyles.guideBoldText}>Organization:</Text> NGOs, companies, institutions{'\n'}
                  • <Text style={dynamicStyles.guideBoldText}>Guest:</Text> Temporary access with limited features
                </Text>
                
                {/* Bottom spacing for better scrolling */}
                <View style={{height: 40}} />
              </View>
            </>
          )}
          
          {/* Settings Modal */}
          <Modal visible={settingsVisible} animationType="slide" transparent>
            <View style={dynamicStyles.modalOverlay}>
              <View style={dynamicStyles.modalContent}>
                <View style={dynamicStyles.modalHeader}>
                  <Text style={dynamicStyles.modalTitle}>{t('settings')}</Text>
                  <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                    <Ionicons name="close" size={24} color={darkMode ? "#fff" : "#333"} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={true}>
                  {/* Profile Section */}
                  <View style={dynamicStyles.profileSection}>
                    <View style={dynamicStyles.profileImageContainer}>
                      {profileImage ? (
                        <Image source={{ uri: profileImage }} style={dynamicStyles.profileImage} />
                      ) : (
                        <View style={dynamicStyles.profileImagePlaceholder}>
                          <FontAwesome5 name="user" size={40} color={darkMode ? "#666" : "#ccc"} />
                        </View>
                      )}
                      <TouchableOpacity style={dynamicStyles.cameraButton} onPress={handleProfileImagePick}>
                        <Ionicons name="camera" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    <Text style={dynamicStyles.profileName}>{userData.name || 'Guest User'}</Text>
                    <Text style={dynamicStyles.profileType}>{userData.type || 'Guest'}</Text>
                  </View>
                  
                  {/* Language Settings */}
                  <TouchableOpacity 
                    style={dynamicStyles.sectionHeader} 
                    onPress={() => toggleSection('languageSettings')}
                  >
                    <Ionicons name="language" size={18} color="#607D8B" />
                    <Text style={dynamicStyles.sectionTitle}> {t('language')} </Text>
                    <Text>{activeSection === 'languageSettings' ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {activeSection === 'languageSettings' && (
                    <View style={dynamicStyles.cardContent}>
                      <View style={dynamicStyles.settingRow}>
                        <TouchableOpacity 
                          style={[
                            dynamicStyles.switchButton, 
                            language === 'en' && dynamicStyles.selected
                          ]}
                          onPress={() => setLanguage('en')}
                        >
                          <Text>{t('english')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[
                            dynamicStyles.switchButton, 
                            language === 'ar' && dynamicStyles.selected
                          ]}
                          onPress={() => setLanguage('ar')}
                        >
                          <Text>{t('arabic')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  
                  {/* User Information */}
                  <TouchableOpacity 
                    style={dynamicStyles.sectionHeader} 
                    onPress={() => toggleSection('userInfo')}
                  >
                    <FontAwesome5 name="user" size={18} color="#2196F3" />
                    <Text style={dynamicStyles.sectionTitle}> {t('userInformation')} </Text>
                    <Text>{activeSection === 'userInfo' ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {activeSection === 'userInfo' && (
                    <View style={dynamicStyles.cardContent}>
                      {!isEditingUser ? (
                        <>
                          <Text style={dynamicStyles.infoText}>Name: {userData.name}</Text>
                          <Text style={dynamicStyles.infoText}>Email: {userData.email}</Text>
                          <Text style={dynamicStyles.infoText}>Phone: {userData.phone}</Text>
                          <Text style={dynamicStyles.infoText}>Type: {userData.type}</Text>
                          <Text style={dynamicStyles.infoText}>Address: {userData.address || 'Not provided'}</Text>
                          <TouchableOpacity onPress={handleEditUser}>
                            <Text style={dynamicStyles.editLink}>{t('edit')}</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <Text style={dynamicStyles.editLabel}>{t('name')}:</Text>
                          <TextInput
                            style={dynamicStyles.editInput}
                            value={editedUserData.name}
                            onChangeText={(text) => setEditedUserData(prev => ({...prev, name: text}))}
                            placeholder={t('enterName')}
                            placeholderTextColor={darkMode ? '#888' : '#999'}
                          />
                          
                          <Text style={dynamicStyles.editLabel}>{t('email')}:</Text>
                          <TextInput
                            style={dynamicStyles.editInput}
                            value={editedUserData.email}
                            onChangeText={(text) => setEditedUserData(prev => ({...prev, email: text}))}
                            placeholder={t('enterEmail')}
                            keyboardType="email-address"
                            placeholderTextColor={darkMode ? '#888' : '#999'}
                          />
                          
                          <Text style={dynamicStyles.editLabel}>{t('phone')}:</Text>
                          <TextInput
                            style={dynamicStyles.editInput}
                            value={editedUserData.phone}
                            onChangeText={(text) => setEditedUserData(prev => ({...prev, phone: text}))}
                            placeholder={t('enterPhone')}
                            keyboardType="phone-pad"
                            placeholderTextColor={darkMode ? '#888' : '#999'}
                          />
                          
                          <Text style={dynamicStyles.editLabel}>{t('type')}:</Text>
                          <TextInput
                            style={dynamicStyles.editInput}
                            value={editedUserData.type}
                            onChangeText={(text) => setEditedUserData(prev => ({...prev, type: text}))}
                            placeholder={t('enterType')}
                            placeholderTextColor={darkMode ? '#888' : '#999'}
                          />
                          
                          <Text style={dynamicStyles.editLabel}>{t('address')}:</Text>
                          <TextInput
                            style={dynamicStyles.editInput}
                            value={editedUserData.address}
                            onChangeText={(text) => setEditedUserData(prev => ({...prev, address: text}))}
                            placeholder={t('enterAddress')}
                            placeholderTextColor={darkMode ? '#888' : '#999'}
                          />
                          
                          <View style={dynamicStyles.editButtonsRow}>
                            <TouchableOpacity style={dynamicStyles.saveButton} onPress={handleSaveUser}>
                              <Text style={dynamicStyles.saveButtonText}>{t('save')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={dynamicStyles.cancelButton} onPress={handleCancelEdit}>
                              <Text style={dynamicStyles.cancelButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </View>
                  )}
                  
                  {/* Donation History */}
                  <TouchableOpacity 
                    style={dynamicStyles.sectionHeader} 
                    onPress={() => toggleSection('donationHistory')}
                  >
                    <FontAwesome5 name="history" size={18} color="#4CAF50" />
                    <Text style={dynamicStyles.sectionTitle}> {t('donationHistory')} </Text>
                    <Text>{activeSection === 'donationHistory' ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {activeSection === 'donationHistory' && (
                    <View style={dynamicStyles.cardContent}>
                      {donationHistory.length === 0 ? (
                        <Text style={dynamicStyles.infoTextItalic}>{t('noDonationsYet')}</Text>
                      ) : (
                        donationHistory.map((item, index) => (
                          <View key={index} style={dynamicStyles.donationDetailCard}>
                            <View style={dynamicStyles.donationDetailHeader}>
                              <Text style={dynamicStyles.donationDetailTitle}>{t('donation')} #{index + 1}</Text>
                              <Text style={dynamicStyles.donationDetailDate}>{item.date}</Text>
                            </View>
                            
                            <View style={dynamicStyles.donationDetailRow}>
                              <Text style={dynamicStyles.donationDetailLabel}>{t('peopleServed')}:</Text>
                              <Text style={dynamicStyles.donationDetailValue}>{item.people}</Text>
                            </View>
                            
                            <View style={dynamicStyles.donationDetailRow}>
                              <Text style={dynamicStyles.donationDetailLabel}>{t('foodType')}:</Text>
                              <Text style={dynamicStyles.donationDetailValue}>{item.foodType}</Text>
                            </View>
                            
                            <View style={dynamicStyles.donationDetailRow}>
                              <Text style={dynamicStyles.donationDetailLabel}>{t('weight')}:</Text>
                              <Text style={dynamicStyles.donationDetailValue}>{item.weight}</Text>
                            </View>
                            
                            <View style={dynamicStyles.donationDetailRow}>
                              <Text style={dynamicStyles.donationDetailLabel}>{t('location')}:</Text>
                              <Text style={dynamicStyles.donationDetailValue}>{item.location}</Text>
                            </View>
                            
                            <View style={dynamicStyles.donationDetailRow}>
                              <Text style={dynamicStyles.donationDetailLabel}>{t('status')}:</Text>
                              <Text style={dynamicStyles.donationDetailValue}>{item.status}</Text>
                            </View>
                            
                            <View style={dynamicStyles.donationDetailRow}>
                              <Text style={dynamicStyles.donationDetailLabel}>{t('estimatedPickup')}:</Text>
                              <Text style={dynamicStyles.donationDetailValue}>{item.estimatedPickup}</Text>
                            </View>
                            
                            <View style={dynamicStyles.donationDetailRow}>
                              <Text style={dynamicStyles.donationDetailLabel}>{t('driver')}:</Text>
                              <Text style={dynamicStyles.donationDetailValue}>{item.driverName} ({item.driverPhone})</Text>
                            </View>
                            
                            <Text style={dynamicStyles.donationDetailStatus}>{t('pointsEarned')}: +20</Text>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                  
                  {/* Notification Settings */}
                  <TouchableOpacity 
                    style={dynamicStyles.sectionHeader} 
                    onPress={() => toggleSection('notificationSettings')}
                  >
                    <Ionicons name="notifications" size={18} color="#FF9800" />
                    <Text style={dynamicStyles.sectionTitle}> {t('notifications')} </Text>
                    <Text>{activeSection === 'notificationSettings' ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {activeSection === 'notificationSettings' && (
                    <View style={dynamicStyles.cardContent}>
                      <View style={dynamicStyles.settingRow}>
                        <Text style={dynamicStyles.settingText}>{t('enableNotifications')}</Text>
                        <Switch
                          value={notificationsEnabled}
                          onValueChange={setNotificationsEnabled}
                          trackColor={{ false: '#767577', true: '#2196F3' }}
                          thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'}
                        />
                      </View>
                      <Text style={dynamicStyles.settingDescription}>
                        {t('notificationsDescription')}
                      </Text>
                    </View>
                  )}
                  
                  {/* Appearance Settings */}
                  <TouchableOpacity 
                    style={dynamicStyles.sectionHeader} 
                    onPress={() => toggleSection('appearanceSettings')}
                  >
                    <Ionicons name="color-palette" size={18} color="#9C27B0" />
                    <Text style={dynamicStyles.sectionTitle}> {t('appearance')} </Text>
                    <Text>{activeSection === 'appearanceSettings' ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {activeSection === 'appearanceSettings' && (
                    <View style={dynamicStyles.cardContent}>
                      <View style={dynamicStyles.settingRow}>
                        <Text style={dynamicStyles.settingText}>{t('darkMode')}</Text>
                        <Switch
                          value={darkMode}
                          onValueChange={setDarkMode}
                          trackColor={{ false: '#767577', true: '#9C27B0' }}
                          thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'}
                        />
                      </View>
                      
                      <View style={dynamicStyles.sliderContainer}>
                        <Text style={dynamicStyles.sliderLabel}>{t('fontSize')}: {fontSize}</Text>
                        
                        <View style={dynamicStyles.sliderTrack}>
                          <View style={dynamicStyles.sliderProgress} />
                          <View style={dynamicStyles.sliderThumb} />
                        </View>
                        
                        <View style={dynamicStyles.sliderButtonsRow}>
                          <TouchableOpacity 
                            style={[
                              dynamicStyles.sliderButton, 
                              fontSize === 12 && dynamicStyles.sliderButtonActive
                            ]}
                            onPress={() => handleFontSizeChange(12)}
                          >
                            <Text style={[
                              dynamicStyles.sliderButtonText,
                              fontSize === 12 && dynamicStyles.sliderButtonTextActive
                            ]}>{t('small')}</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[
                              dynamicStyles.sliderButton, 
                              fontSize === 16 && dynamicStyles.sliderButtonActive
                            ]}
                            onPress={() => handleFontSizeChange(16)}
                          >
                            <Text style={[
                              dynamicStyles.sliderButtonText,
                              fontSize === 16 && dynamicStyles.sliderButtonTextActive
                            ]}>{t('medium')}</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[
                              dynamicStyles.sliderButton, 
                              fontSize === 20 && dynamicStyles.sliderButtonActive
                            ]}
                            onPress={() => handleFontSizeChange(20)}
                          >
                            <Text style={[
                              dynamicStyles.sliderButtonText,
                              fontSize === 20 && dynamicStyles.sliderButtonTextActive
                            ]}>{t('large')}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                  
                  {/* Help & Support */}
                  <TouchableOpacity 
                    style={dynamicStyles.sectionHeader} 
                    onPress={() => toggleSection('helpSupport')}
                  >
                    <FontAwesome5 name="question-circle" size={18} color="#E91E63" />
                    <Text style={dynamicStyles.sectionTitle}> {t('helpSupport')} </Text>
                    <Text>{activeSection === 'helpSupport' ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {activeSection === 'helpSupport' && (
                    <View style={dynamicStyles.cardContent}>
                      <TouchableOpacity style={dynamicStyles.supportButton} onPress={handleContactSupport}>
                        <Ionicons name="mail" size={16} color="#2196F3" />
                        <Text style={dynamicStyles.supportButtonText}>{t('contactSupport')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={dynamicStyles.supportButton} onPress={handleVisitWebsite}>
                        <Ionicons name="globe" size={16} color="#2196F3" />
                        <Text style={dynamicStyles.supportButtonText}>{t('visitWebsite')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={dynamicStyles.supportButton} onPress={() => setShowAppInfo(true)}>
                        <Ionicons name="information-circle" size={16} color="#2196F3" />
                        <Text style={dynamicStyles.supportButtonText}>{t('aboutTawfeer')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={dynamicStyles.supportButton} onPress={handleRateApp}>
                        <Ionicons name="star" size={16} color="#2196F3" />
                        <Text style={dynamicStyles.supportButtonText}>{t('rateApp')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Logout Button */}
                  <TouchableOpacity style={dynamicStyles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out" size={18} color="#fff" />
                    <Text style={dynamicStyles.logoutButtonText}>{t('logout')}</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
          
          {/* Points Information Modal */}
          <Modal visible={showPointsInfo} animationType="slide" transparent>
            <View style={dynamicStyles.modalContainer}>
              <View style={dynamicStyles.modalContent}>
                <Text style={dynamicStyles.modalTitle}>🏅 {t('pointsSystem')}</Text>
                <ScrollView style={dynamicStyles.scrollContent}>
                  <Text style={dynamicStyles.pointsInfoText}>
                    <Text style={dynamicStyles.boldText}>{t('whatArePoints')}</Text>
                    {'\n'}{t('pointsDescription')}
                  </Text>
                  
                  <Text style={dynamicStyles.pointsInfoText}>
                    <Text style={dynamicStyles.boldText}>{t('howToEarnPoints')}</Text>
                    {'\n'}• {t('donateFood')}: +20 {t('pointsPerDonation')}
                    {'\n'}• {t('helpCommunity')}
                    {'\n'}• {t('reduceFoodWaste')}
                  </Text>
                  
                  <Text style={dynamicStyles.pointsInfoText}>
                    <Text style={dynamicStyles.boldText}>{t('purpose')}</Text>
                    {'\n'}• {t('trackImpact')}
                    {'\n'}• {t('encourageParticipation')}
                    {'\n'}• {t('buildCommunity')}
                    {'\n'}• {t('supportUAEVision')}
                  </Text>
                  
                  <Text style={dynamicStyles.pointsInfoText}>
                    <Text style={dynamicStyles.boldText}>{t('benefits')}</Text>
                    {'\n'}• {t('recognition')}
                    {'\n'}• {t('motivation')}
                    {'\n'}• {t('sustainabilityMovement')}
                  </Text>
                </ScrollView>
                
                <TouchableOpacity style={dynamicStyles.closeButton} onPress={() => setShowPointsInfo(false)}>
                  <Text style={dynamicStyles.closeButtonText}>{t('close')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          
          {/* App Information Modal */}
          <Modal visible={showAppInfo} animationType="slide" transparent>
            <View style={dynamicStyles.modalContainer}>
              <View style={[dynamicStyles.modalContent, {height: '85%'}]}>
                <Text style={dynamicStyles.modalTitle}>📱 {t('tawfeerGuide')}</Text>
                <ScrollView style={dynamicStyles.scrollContent} showsVerticalScrollIndicator={true}>
                  
                  <Text style={dynamicStyles.sectionTitle}>🎯 {t('aboutTawfeer')}</Text>
                  <Text style={dynamicStyles.infoText}>
                    {t('tawfeerDescription')}
                  </Text>
                  
                  <Text style={dynamicStyles.sectionTitle}>🌟 {t('ourGoals')}</Text>
                  <Text style={dynamicStyles.infoText}>
                    • {t('reduceFoodWaste')}{'\n'}
                    • {t('promoteDonation')}{'\n'}
                    • {t('supportUAEVision')}{'\n'}
                    • {t('useAI')}{'\n'}
                    • {t('rewardUsers')}{'\n'}
                    • {t('buildCommunity')}
                  </Text>
                  
                  <Text style={dynamicStyles.sectionTitle}>📖 {t('howToUse')}</Text>
                  
                  <Text style={dynamicStyles.subTitle}>🍽️ {t('donatingFood')}:</Text>
                  <Text style={dynamicStyles.infoText}>
                    1. {t('clickDonateFood')}{'\n'}
                    2. {t('fillPeopleServed')}{'\n'}
                    3. {t('specifyFoodType')}{'\n'}
                    4. {t('confirmSafe')}{'\n'}
                    5. {t('uploadPhoto')}{'\n'}
                    6. {t('enterLocationPhone')}{'\n'}
                    7. {t('submitEarnPoints')}
                  </Text>
                  
                  <Text style={dynamicStyles.subTitle}>🙏 {t('requestingFood')}:</Text>
                  <Text style={dynamicStyles.infoText}>
                    1. {t('clickRequestFood')}{'\n'}
                    2. {t('explainNeed')}{'\n'}
                    3. {t('specifyPeople')}{'\n'}
                    4. {t('enterContactInfo')}{'\n'}
                    5. {t('submitRequest')}
                  </Text>
                  
                  <Text style={dynamicStyles.subTitle}>🤖 {t('aiAssistant')}:</Text>
                  <Text style={dynamicStyles.infoText}>
                    • {t('askAboutIngredients')}{'\n'}
                    • {t('getRecipeSuggestions')}{'\n'}
                    • {t('learnToCook')}{'\n'}
                    • {t('availableEverywhere')}
                  </Text>
                  
                  <Text style={dynamicStyles.subTitle}>⚙️ {t('settingsProfile')}:</Text>
                  <Text style={dynamicStyles.infoText}>
                    • {t('viewEditProfile')}{'\n'}
                    • {t('checkHistory')}{'\n'}
                    • {t('trackPoints')}{'\n'}
                    • {t('customizeApp')}{'\n'}
                    • {t('getHelp')}{'\n'}
                    • {t('logout')}
                  </Text>
                  
                  <Text style={dynamicStyles.sectionTitle}>🏆 {t('pointsSystem')}</Text>
                  <Text style={dynamicStyles.infoText}>
                    {t('pointsSystemDescription')}
                  </Text>
                  
                  <Text style={dynamicStyles.sectionTitle}>🌍 {t('environmentalImpact')}</Text>
                  <Text style={dynamicStyles.infoText}>
                    {t('donationHelps')}:{'\n'}
                    • {t('reduceEmissions')}{'\n'}
                    • {t('saveResources')}{'\n'}
                    • {t('supportFamilies')}{'\n'}
                    • {t('buildSustainableUAE')}
                  </Text>
                  
                  <Text style={dynamicStyles.sectionTitle}>👥 {t('userTypes')}</Text>
                  <Text style={dynamicStyles.infoText}>
                    • <Text style={dynamicStyles.boldText}>{t('household')}:</Text> {t('familiesIndividuals')}{'\n'}
                    • <Text style={dynamicStyles.boldText}>{t('restaurant')}:</Text> {t('foodBusinesses')}{'\n'}
                    • <Text style={dynamicStyles.boldText}>{t('supermarket')}:</Text> {t('groceryStores')}{'\n'}
                    • <Text style={dynamicStyles.boldText}>{t('organization')}:</Text> {t('ngosCompanies')}{'\n'}
                    • <Text style={dynamicStyles.boldText}>{t('guest')}:</Text> {t('temporaryAccess')}
                  </Text>
                  
                  <View style={{height: 20}} />
                </ScrollView>
                
                <TouchableOpacity style={dynamicStyles.closeButton} onPress={() => setShowAppInfo(false)}>
                  <Text style={dynamicStyles.closeButtonText}>{t('close')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}