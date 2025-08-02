import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LanguageContext } from '../App';

const backgroundUri = 'https://sdmntprpolandcentral.oaiusercontent.com/files/00000000-921c-620a-af98-8aad4bc18e75/raw?se=2025-07-28T22%3A31%3A39Z&sp=r&sv=2024-08-04&sr=b&scid=6d9d1348-659c-543f-b3c9-9a056b4dadb6&skoid=1e6af1bf-6b08-4a04-8919-15773e7e7024&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-28T19%3A29%3A10Z&ske=2025-07-29T19%3A29%3A10Z&sks=b&skv=2024-08-04&sig=XzlWCkpkIXxTAW/KdVDRLSff3wLkc8QMpA3siJNiCHU%3D';

export default function WelcomeScreen({ navigation }) {
  const { language, setLanguage, t, isRTL } = useContext(LanguageContext);
  const [isGuestView, setIsGuestView] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  
  const userData = {
    name: t('guest'),
    type: t('guest'),
  };
  
  const handleProtectedAction = () => {
    setShowLoginModal(true);
  };
  
  const handleAskAI = () => {
    if (!aiInput.trim()) {
      alert(t('pleaseEnterQuestion'));
      return;
    }
    setAiResponse(
      `🍽️ ${t('aiSuggestionPrefix')} ${aiInput}, ${t('aiSuggestionSuffix')}`
    );
  };
  
  // Guest flow
  if (isGuestView) {
    return (
      <KeyboardAvoidingView 
        style={{flex: 1}} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ImageBackground source={{ uri: backgroundUri }} style={styles.background}>
          <ScrollView contentContainerStyle={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}>
            <View style={styles.topBar}>
              <View style={styles.authButtons}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                  style={styles.topButton}
                >
                  <Text style={styles.topButtonText}>{t('register')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.topButton}
                >
                  <Text style={styles.topButtonText}>{t('login')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.header, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('welcome')} {userData.name} ({userData.type})
            </Text>
            <Text style={[styles.subheader, { textAlign: isRTL ? 'right' : 'left' }]}>{t('chooseAction')}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={handleProtectedAction}
              >
                <Text style={styles.buttonText}>{t('donateFood')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={handleProtectedAction}
              >
                <Text style={styles.buttonText}>{t('requestFood')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.guideButton}
              onPress={() => setShowGuideModal(true)}
            >
              <Text style={styles.guideButtonText}>{t('viewTawfeerGuide')}</Text>
            </TouchableOpacity>
            <View style={styles.descriptionBox}>
              <Text style={[styles.descriptionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('aboutTawfeer')}</Text>
              <Text style={[styles.descriptionText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('tawfeerDescription')}
              </Text>
              <Text style={[styles.descriptionText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('tawfeerHelp')}
              </Text>
              <Text style={[styles.descriptionText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('tawfeerSolution')}
              </Text>
              <Text style={[styles.descriptionText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('tawfeerFeatures')}
              </Text>
              <Text style={[styles.goalHeader, { textAlign: isRTL ? 'right' : 'left' }]}>{t('tawfeerGoals')}</Text>
              <Text style={[styles.goalText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('goal1')}
              </Text>
              <Text style={[styles.goalText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('goal2')}
              </Text>
              <Text style={[styles.goalText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('goal3')}
              </Text>
              <Text style={[styles.goalText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('goal4')}
              </Text>
              <Text style={[styles.goalText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('goal5')}
              </Text>
            </View>
            <View style={styles.aiBox}>
              <Text style={[styles.aiTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('askAIQuestion')}
              </Text>
              <TextInput
                placeholder={t('aiPlaceholder')}
                style={[styles.aiInput, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}
                value={aiInput}
                onChangeText={setAiInput}
                placeholderTextColor="#888"
              />
              <TouchableOpacity style={styles.askButton} onPress={handleAskAI}>
                <Text style={styles.askButtonText}>{t('askAI')}</Text>
              </TouchableOpacity>
              {aiResponse ? (
                <Text style={[styles.aiAnswer, { textAlign: isRTL ? 'right' : 'left' }]}>{aiResponse}</Text>
              ) : null}
            </View>
            <Modal
              transparent
              visible={showLoginModal}
              animationType="fade"
              onRequestClose={() => setShowLoginModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Text style={[styles.modalTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('loginRequired')}</Text>
                  <Text style={[styles.modalMessage, { textAlign: isRTL ? 'right' : 'left' }]}>{t('loginFirst')}</Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setShowLoginModal(false);
                      navigation.navigate('Login');
                    }}
                  >
                    <Text style={styles.modalButtonText}>{t('ok')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal
              transparent
              visible={showGuideModal}
              animationType="fade"
              onRequestClose={() => setShowGuideModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.guideModalBox}>
                  <Text style={[styles.modalTitle, { textAlign: isRTL ? 'right' : 'left' }]}>📱 {t('tawfeerGuide')}</Text>
                  <ScrollView style={styles.guideModalContent}>
                    
                    <Text style={[styles.guideSectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>🎯 {t('aboutTawfeer')}</Text>
                    <Text style={[styles.guideText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {t('tawfeerGuideDescription')}
                    </Text>
                    
                    <Text style={[styles.guideSectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>🌟 {t('ourGoals')}</Text>
                    <Text style={[styles.guideText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      • {t('reduceFoodWaste')}{'\n'}
                      • {t('promoteDonation')}{'\n'}
                      • {t('supportUAEVision')}{'\n'}
                      • {t('useAI')}{'\n'}
                      • {t('rewardUsers')}{'\n'}
                      • {t('buildCommunity')}
                    </Text>
                    
                    <Text style={[styles.guideSectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>📖 {t('howToUse')}</Text>
                    
                    <Text style={[styles.guideSubTitle, { textAlign: isRTL ? 'right' : 'left' }]}>🍽️ {t('donatingFood')}:</Text>
                    <Text style={[styles.guideText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      1. {t('clickDonateFood')}{'\n'}
                      2. {t('fillPeopleServed')}{'\n'}
                      3. {t('specifyFoodType')}{'\n'}
                      4. {t('confirmSafe')}{'\n'}
                      5. {t('uploadPhoto')}{'\n'}
                      6. {t('enterLocationPhone')}{'\n'}
                      7. {t('submitEarnPoints')}
                    </Text>
                    
                    <Text style={[styles.guideSubTitle, { textAlign: isRTL ? 'right' : 'left' }]}>🙏 {t('requestingFood')}:</Text>
                    <Text style={[styles.guideText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      1. {t('clickRequestFood')}{'\n'}
                      2. {t('explainNeed')}{'\n'}
                      3. {t('specifyPeople')}{'\n'}
                      4. {t('enterContactInfo')}{'\n'}
                      5. {t('submitRequest')}
                    </Text>
                    
                    <Text style={[styles.guideSubTitle, { textAlign: isRTL ? 'right' : 'left' }]}>🤖 {t('aiAssistant')}:</Text>
                    <Text style={[styles.guideText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      • {t('askAboutIngredients')}{'\n'}
                      • {t('getRecipeSuggestions')}{'\n'}
                      • {t('learnToCook')}{'\n'}
                      • {t('availableEverywhere')}
                    </Text>
                    
                    <Text style={[styles.guideSubTitle, { textAlign: isRTL ? 'right' : 'left' }]}>⚙️ {t('settingsProfile')}:</Text>
                    <Text style={[styles.guideText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      • {t('viewEditProfile')}{'\n'}
                      • {t('checkHistory')}{'\n'}
                      • {t('trackPoints')}{'\n'}
                      • {t('logout')}
                    </Text>
                    
                    <Text style={[styles.guideSectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>🏆 {t('pointsSystem')}</Text>
                    <Text style={[styles.guideText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {t('pointsSystemDescription')}
                    </Text>
                    
                    <Text style={[styles.guideSectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>🌍 {t('environmentalImpact')}</Text>
                    <Text style={[styles.guideText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {t('donationHelps')}:{'\n'}
                      • {t('reduceEmissions')}{'\n'}
                      • {t('saveResources')}{'\n'}
                      • {t('supportFamilies')}{'\n'}
                      • {t('buildSustainableUAE')}
                    </Text>
                    
                    <Text style={[styles.guideSectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>👥 {t('userTypes')}</Text>
                    <Text style={[styles.guideText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      • <Text style={styles.guideBoldText}>{t('household')}:</Text> {t('familiesIndividuals')}{'\n'}
                      • <Text style={styles.guideBoldText}>{t('restaurant')}:</Text> {t('foodBusinesses')}{'\n'}
                      • <Text style={styles.guideBoldText}>{t('supermarket')}:</Text> {t('groceryStores')}{'\n'}
                      • <Text style={styles.guideBoldText}>{t('organization')}:</Text> {t('ngosCompanies')}{'\n'}
                      • <Text style={styles.guideBoldText}>{t('guest')}:</Text> {t('temporaryAccess')}
                    </Text>
                    
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowGuideModal(false)}
                  >
                    <Text style={styles.modalButtonText}>{t('close')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={{ height: 60 }} />
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
  
  // Default welcome box
  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground
        source={{ uri: backgroundUri }}
        style={styles.background}
        blurRadius={3}
      >
        <View style={styles.overlay}>
          <View style={styles.welcomeBox}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>🍽️</Text>
              </View>
              <Text style={styles.appName}>Tawfeer</Text>
            </View>
            <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{t('welcomeToTawfeer')}</Text>
            <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('welcomeSubtitle')}
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.buttonText}>{t('login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.buttonText}>{t('register')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setIsGuestView(true);
              setShowGuideModal(true);
            }}>
              <Text style={[styles.guestText, { textAlign: isRTL ? 'right' : 'left' }]}>{t('continueAsGuest')}</Text>
            </TouchableOpacity>
            <Text style={[styles.footerText, { textAlign: isRTL ? 'right' : 'left' }]}>{t('madeWithLove')}</Text>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  // Background and layout
  background: { 
    flex: 1, 
    justifyContent: 'center',
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: { 
    padding: 20, 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    flexGrow: 1,
  },
  
  // Logo and branding
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
  
  // Welcome box
  welcomeBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: width * 0.85,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#2E7D32',
    marginBottom: 10,
  },
  subtitle: { 
    fontSize: 16, 
    color: '#555', 
    marginTop: 5,
    lineHeight: 22,
  },
  
  // Buttons
  loginButton: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 12,
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  registerButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16,
  },
  guestText: { 
    color: '#1976D2', 
    textDecorationLine: 'underline', 
    marginTop: 15,
    fontSize: 16,
  },
  footerText: { 
    fontSize: 12, 
    color: '#888', 
    marginTop: 25,
  },
  
  // Top bar
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginBottom: 20,
  },
  authButtons: { 
    flexDirection: 'row', 
  },
  topButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  topButtonText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Guest view content
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 15,
    color: '#2E7D32',
  },
  subheader: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginVertical: 15, 
    color: '#1976D2',
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    marginBottom: 25,
  },
  selectButton: { 
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  guideButton: { 
    backgroundColor: '#2E7D32', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  guideButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16,
  },
  
  // Description box
  descriptionBox: { 
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginTop: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  descriptionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#2E7D32', 
    marginBottom: 15,
  },
  descriptionText: { 
    fontSize: 16, 
    color: '#333', 
    marginBottom: 12, 
    lineHeight: 24,
  },
  goalHeader: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 20, 
    marginBottom: 10,
  },
  goalText: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 8, 
    lineHeight: 24,
  },
  
  // AI box
  aiBox: {
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  aiTitle: { 
    fontWeight: 'bold', 
    fontSize: 18, 
    marginBottom: 12,
    color: '#1976D2',
  },
  aiInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
    fontSize: 16,
  },
  askButton: { 
    backgroundColor: '#1976D2', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  askButtonText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  aiAnswer: { 
    marginTop: 15, 
    fontStyle: 'italic', 
    color: '#555',
    fontSize: 16,
    lineHeight: 24,
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  guideModalBox: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '85%',
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  guideModalContent: {
    marginBottom: 20,
  },
  guideText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 24,
  },
  guideSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
    marginBottom: 10,
  },
  guideSubTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  guideBoldText: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15,
    color: '#2E7D32',
  },
  modalMessage: { 
    fontSize: 16, 
    marginBottom: 25, 
    color: '#555',
    lineHeight: 24,
  },
  modalButton: { 
    backgroundColor: '#1976D2', 
    paddingVertical: 12, 
    paddingHorizontal: 30, 
    borderRadius: 8,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16,
  },
});
