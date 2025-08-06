import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Modal,
  Keyboard,
  ImageBackground,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LanguageContext } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const backgroundUri = 'https://sdmntprpolandcentral.oaiusercontent.com/files/00000000-921c-620a-af98-8aad4bc18e75/raw?se=2025-07-28T22%3A31%3A39Z&sp=r&sv=2024-08-04&sr=b&scid=6d9d1348-659c-543f-b3c9-9a056b4dadb6&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-28T19%3A29%3A10Z&ske=2025-07-29T19%3A29%3A10Z&sks=b&skv=2024-08-04&sig=XzlWCkpkIXxTAW/KdVDRLSff3wLkc8QMpA3siJNiCHU%3D';

export default function RegisterScreen({ navigation }) {
  const { language, setLanguage, t, isRTL } = useContext(LanguageContext);
  const [userType, setUserType] = useState('');
  const [otherType, setOtherType] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  const saveCredentials = async (userData) => {
    try {
      // Get existing users or initialize empty array
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      // Check if user already exists
      const userExists = users.some(user => user.email === userData.email);
      
      if (userExists) {
        Alert.alert(t('userExists'), t('emailAlreadyUsed'));
        return false;
      }
      
      // Add new user
      users.push(userData);
      
      // Save updated users array
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      // Update dashboard data with new user registration
      await updateDashboardWithUser(userData);
      
      return true;
    } catch (error) {
      console.error('Error saving credentials:', error);
      return false;
    }
  };
  
  const updateDashboardWithUser = async (userData) => {
    try {
      const dashboardDataJson = await AsyncStorage.getItem('dashboardData');
      const dashboardData = dashboardDataJson ? JSON.parse(dashboardDataJson) : {
        donations: [],
        users: []
      };
      
      // Add new user registration to dashboard
      dashboardData.users.push({
        date: new Date().toISOString(),
        type: 'user',
        user: userData.name,
        userEmail: userData.email,
        userType: userData.type,
      });
      
      await AsyncStorage.setItem('dashboardData', JSON.stringify(dashboardData));
    } catch (error) {
      console.error('Error updating dashboard with user:', error);
    }
  };
  
  const handleRegister = async () => {
    const finalType = userType === t('other') ? otherType : userType;
    if (!finalType || !name || !email || !phone || !password) {
      Alert.alert(t('missingInfo'), t('completeAllFields'));
      return;
    }
    
    const userData = {
      name,
      email,
      phone,
      password, // In a real app, you should hash the password
      type: finalType,
      createdAt: new Date().toISOString(),
      points: 0,
      donationHistory: [],
    };
    
    // Save credentials to AsyncStorage
    const saved = await saveCredentials(userData);
    
    if (!saved) {
      return;
    }
    
    // Show success modal
    setShowSuccessModal(true);
    
    // Auto-login after 2 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
      
      // Navigate to FoodInteraction with user data
      navigation.navigate('FoodInteraction', {
        userData: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          type: userData.type,
        },
        isGuest: false,
        points: 0,
        donationHistory: [],
      });
    }, 2000);
  };
  
  return (
    <ImageBackground source={{ uri: backgroundUri }} style={styles.background}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -200}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scroll, 
            { paddingBottom: keyboardHeight + 20 }
          ]}
        >
          {/* Logo/Icon Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>🍽️</Text>
            </View>
            <Text style={styles.appName}>Tawfeer</Text>
            <Text style={styles.tagline}>{t('createAccount')}</Text>
          </View>
          
          {/* Register Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>{t('register')}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('fullName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('enterFullName')}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#888"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('email')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('enterEmail')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#888"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('phoneNumber')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('enterPhoneNumber')}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#888"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('password')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('enterPassword')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#888"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('selectUserType')}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={userType}
                  onValueChange={(value) => setUserType(value)}
                  style={styles.picker}
                >
                  <Picker.Item label={t('selectType')} value="" />
                  <Picker.Item label={t('household')} value="Household" />
                  <Picker.Item label={t('restaurant')} value="Restaurant" />
                  <Picker.Item label={t('supermarket')} value="Supermarket" />
                  <Picker.Item label={t('organization')} value="Organization" />
                  <Picker.Item label={t('other')} value="Other" />
                </Picker>
              </View>
            </View>
            
            {userType === t('other') && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('enterYourType')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('enterYourType')}
                  value={otherType}
                  onChangeText={setOtherType}
                  placeholderTextColor="#888"
                />
              </View>
            )}
            
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>{t('register')}</Text>
            </TouchableOpacity>
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>{t('alreadyHaveAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>{t('login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('madeWithLove')}</Text>
          </View>
        </ScrollView>
        
        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.successIconContainer}>
                <Text style={styles.successIcon}>✓</Text>
              </View>
              <Text style={styles.successTitle}>{t('accountCreated')}</Text>
              <Text style={styles.successMessage}>{t('accountCreatedSuccess')}</Text>
              <Text style={styles.redirectingText}>{t('redirectingToApp')}</Text>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // Background and layout
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  scroll: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 30,
  },
  
  // Logo and branding
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  // Form container
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  
  // Input fields
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  
  // Buttons
  registerButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  
  // Footer
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  redirectingText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
