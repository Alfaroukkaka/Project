// WelcomeScreen.js
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
import { LanguageContext } from '../App'; // Import the context

const backgroundUri =
  'https://image.shutterstock.com/image-photo/assortment-vibrant-gourmet-dishes-showcasing-600nw-2473449039.jpg';

export default function WelcomeScreen({ navigation }) {
  const { language, setLanguage, t, isRTL } = useContext(LanguageContext); // Use the context
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
            <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{t('welcomeToTawfeer')}</Text>
            <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('welcomeSubtitle')}
            </Text>
            <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>🍽️</Text>
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
  background: { flex: 1, justifyContent: 'center' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeBox: {
    backgroundColor: 'white',
    width: width * 0.85,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32' },
  subtitle: { fontSize: 14, color: '#444', marginTop: 5 },
  loginButton: {
    backgroundColor: '#1e88e5',
    padding: 14,
    borderRadius: 10,
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#43a047',
    padding: 14,
    borderRadius: 10,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  guestText: { color: '#333', textDecorationLine: 'underline', marginTop: 15 },
  footerText: { fontSize: 12, color: '#888', marginTop: 25 },
  container: { padding: 20, backgroundColor: 'rgba(255,255,255,0.9)', flexGrow: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
  authButtons: { flexDirection: 'row' },
  topButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  topButtonText: { color: '#fff', fontWeight: 'bold' },
  header: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
  subheader: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#2e8b57' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 20 },
  selectButton: { backgroundColor: '#ccc', padding: 12, borderRadius: 8, minWidth: 120 },
  guideButton: { 
    backgroundColor: '#43a047', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 20,
    alignItems: 'center',
  },
  guideButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  descriptionBox: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginTop: 20 },
  descriptionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2e8b57', marginBottom: 10 },
  descriptionText: { fontSize: 14, color: '#333', marginBottom: 8, lineHeight: 20 },
  goalHeader: { fontSize: 16, fontWeight: 'bold', color: '#000', marginTop: 12, marginBottom: 6 },
  goalText: { fontSize: 14, color: '#444', marginBottom: 4, lineHeight: 20 },
  aiBox: {
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  aiTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  aiInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  askButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, alignItems: 'center' },
  askButtonText: { color: '#fff', fontWeight: 'bold' },
  aiAnswer: { marginTop: 12, fontStyle: 'italic', color: '#444' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  guideModalBox: {
    backgroundColor: '#fff',
    width: '85%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
  },
  guideModalContent: {
    marginBottom: 15,
  },
  guideText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  guideSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e8b57',
    marginTop: 12,
    marginBottom: 6,
  },
  guideSubTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  guideBoldText: {
    fontWeight: 'bold',
    color: '#2e8b57',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 14, marginBottom: 20, color: '#444' },
  modalButton: { backgroundColor: '#2196F3', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8 },
  modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});


