// screens/LoginScreen.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { LanguageContext } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const backgroundUri = 'https://sdmntprpolandcentral.oaiusercontent.com/files/00000000-921c-620a-af98-8aad4bc18e75/raw?se=2025-07-28T22%3A31%3A39Z&sp=r&sv=2024-08-04&sr=b&scid=6d9d1348-659c-543f-b3c9-9a056b4dadb6&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-28T19%3A29%3A10Z&ske=2025-07-29T19%3A29%3A10Z&sks=b&skv=2024-08-04&sig=XzlWCkpkIXxTAW/KdVDRLSff3wLkc8QMpA3siJNiCHU%3D';

export default function LoginScreen({ navigation }) {
  const { language, setLanguage, t, isRTL } = useContext(LanguageContext);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  
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
  
  const getUserAccount = async (email, password) => {
    try {
      // Get stored users
      const usersJson = await AsyncStorage.getItem('users');
      if (!usersJson) {
        return null;
      }
      
      const users = JSON.parse(usersJson);
      
      // Find user with matching email and password
      const user = users.find(u => 
        (u.email === email || u.phone === email) && u.password === password
      );
      
      return user || null;
    } catch (error) {
      console.error('Error getting user account:', error);
      return null;
    }
  };
  
  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert(t('missingInformation'), t('enterBothFields'));
      return;
    }
    
    setLoading(true);
    
    try {
      // Check for admin credentials
      if (emailOrPhone === 'admin123' && password === '123') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Admin' }],
        });
        return;
      }
      
      // Check for government credentials
      if (emailOrPhone === 'gov123' && password === '123') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'GovernmentDashboard' }],
        });
        return;
      }
      
      // Check for hardcoded credentials (for quick access)
      if (emailOrPhone === '123' && password === '123') {
        Alert.alert(t('loginSuccessful'), t('welcomeToTawfeer'));
        navigation.navigate('FoodInteraction', {
          userData: {
            name: t('guestUser'),
            email: 'guest@example.com',
            phone: '123',
            type: t('guest'),
          },
          isGuest: false,
        });
        return;
      }
      
      // Get user account
      const userAccount = await getUserAccount(emailOrPhone, password);
      
      if (userAccount) {
        Alert.alert(t('loginSuccess'), t('dataLoaded'));
        navigation.navigate('FoodInteraction', {
          userData: {
            name: userAccount.name,
            email: userAccount.email,
            phone: userAccount.phone,
            type: userAccount.type,
          },
          isGuest: false,
          // Pass points and donation history
          points: userAccount.points || 0,
          donationHistory: userAccount.donationHistory || [],
          activeOrders: userAccount.activeOrders || [],
          messages: userAccount.messages || [],
        });
      } else {
        Alert.alert(t('loginFailed'), t('invalidCredentials'));
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ImageBackground source={{ uri: backgroundUri }} style={styles.background}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -200}
      >
        <SafeAreaView style={styles.safeArea}>
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
              <Text style={styles.tagline}>{t('loginSubtitle')}</Text>
            </View>
            
            {/* Login Form */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>{t('login')}</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('emailOrPhone')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('enterEmailOrPhone')}
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  keyboardType="default"
                  autoCapitalize="none"
                  placeholderTextColor="#888"
                  editable={!loading}
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
                  editable={!loading}
                />
              </View>
              
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>{t('login')}</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>{t('dontHaveAccount')}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>{t('register')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('madeWithLove')}</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(248,249,250,0.85)',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2e8b57',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e8b57',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
