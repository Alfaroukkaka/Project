// App.js
import React, { createContext, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import GuestScreen from './screens/GuestScreen';
import VerificationScreen from './screens/VerificationScreen';
import FoodTypeSelectionScreen from './screens/FoodTypeSelectionScreen';
import FoodInteractionScreen from './screens/FoodInteractionScreen';
import AdminScreen from './screens/AdminScreen'; // Fixed import path

// Create Language Context
export const LanguageContext = createContext();
const Stack = createNativeStackNavigator();
export default function App() {
  const [language, setLanguage] = useState('en'); // 'en' for English, 'ar' for Arabic
  
  // Translation object
  const translations = {
    en: {
      // WelcomeScreen translations
      welcome: "Welcome",
      guest: "Guest",
      chooseAction: "Choose Action:",
      donateFood: "Donate Food",
      requestFood: "Request Food",
      viewTawfeerGuide: "View Tawfeer Complete Guide",
      aboutTawfeer: "📱 About Tawfeer",
      tawfeerDescription: "Tawfeer is a smart mobile application built in the UAE to combat one of the most serious global challenges: food waste.",
      tawfeerHelp: "It helps individuals, restaurants, supermarkets, and organizations donate or repurpose food instead of wasting it.",
      tawfeerSolution: "Whether you're a household with leftovers or a supermarket with unsold items, Tawfeer provides a simple solution to reduce waste, support communities, and protect the environment.",
      tawfeerFeatures: "You can even use AI to get recipe suggestions, check food usability through photos, and earn reward points for each contribution.",
      tawfeerGoals: "🎯 Tawfeer Goals",
      goal1: "- Reduce food waste across UAE homes and businesses",
      goal2: "- Promote donation of safe, edible food",
      goal3: "- Support UAE Vision 2031 sustainability goals",
      goal4: "- Use AI to analyze ingredients and give recipe tips",
      goal5: "- Reward users to encourage repeated contributions",
      askAIQuestion: "🤖 Ask AI a food-related question:",
      aiPlaceholder: "e.g. What can I cook with rice and tomato?",
      askAI: "Ask AI",
      aiSuggestionPrefix: "Here's an idea: If you have",
      aiSuggestionSuffix: "try making a hearty soup or mixed stir-fry!",
      loginRequired: "Login Required",
      loginFirst: "You must login first.",
      ok: "OK",
      welcomeToTawfeer: "Welcome to Tawfeer",
      welcomeSubtitle: "Reduce food waste, help the community, and earn rewards 🌍",
      login: "Login",
      register: "Register",
      continueAsGuest: "Continue as Guest",
      madeWithLove: "Made with ❤️ for UAE",
      // Common translations
      settings: "Settings",
      userInformation: "User Information",
      donationHistory: "Donation History",
      notifications: "Notifications",
      appearance: "Appearance",
      helpSupport: "Help & Support",
      logout: "Logout",
      language: "Language",
      english: "English",
      arabic: "العربية",
      // Add more translations as needed
    },
    ar: {
      // WelcomeScreen translations
      welcome: "مرحباً",
      guest: "ضيف",
      chooseAction: "اختر الإجراء:",
      donateFood: "تبرع بالطعام",
      requestFood: "اطلب طعام",
      viewTawfeerGuide: "عرض دليل تطوير الكامل",
      aboutTawfeer: "📱 حول تطوير",
      tawfeerDescription: "تطوير هو تطبيق ذكي تم بناؤه في الإمارات لمواجهة أحد التحديات العالمية الخطيرة: هدر الطعام.",
      tawfeerHelp: "يساعد الأفراد والمطاعم ومحلات السوبر ماركت والمنظمات على التبرع بالطعام أو إعادة استخدامه بدلاً من هدره.",
      tawfeerSolution: "سواء كنت أسرة لديها بقايا طعام أو سوبر ماركت لديه مواد غير مباعة، يوفر تطوير حلاً بسيطاً لتقليل الهدر ودعم المجتمعات وحماية البيئة.",
      tawfeerFeatures: "يمكنك حتى استخدام الذكاء الاصطناعي للحصول على اقتراحات للوصفات، وفحص صلاحية الطعام من خلال الصور، وكسب نقاط المكافأة لكل مساهمة.",
      tawfeerGoals: "🎯 أهداف تطوير",
      goal1: "- تقليل هدر الطعام في منازل وشركات الإمارات",
      goal2: "- الترويج للتبرع بالطعام الآمن الصالح للأكل",
      goal3: "- دعم أهداف استدامة رؤية الإمارات 2031",
      goal4: "- استخدام الذكاء الاصطناعي لتحليل المكونات وإعطاء نصائح للوصفات",
      goal5: "- مكافأة المستخدمين لتشجيع المساهمات المتكررة",
      askAIQuestion: "🤖 اسأل الذكاء الاصطناعي سؤالاً متعلقاً بالطعام:",
      aiPlaceholder: "مثال: ماذا يمكنني أن أطبخ مع الأرز والطماطم؟",
      askAI: "اسأل الذكاء الاصطناعي",
      aiSuggestionPrefix: "إليك فكرة: إذا كان لديك",
      aiSuggestionSuffix: "جرب صنع حساء غني أو تقليب مختلط!",
      loginRequired: "مطلوب تسجيل الدخول",
      loginFirst: "يجب عليك تسجيل الدخول أولاً.",
      ok: "موافق",
      welcomeToTawfeer: "مرحباً بك في تطوير",
      welcomeSubtitle: "قلل هدر الطعام، ساعد المجتمع، واكسب مكافآت 🌍",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      continueAsGuest: "متابعة كضيف",
      madeWithLove: "صُنع بـ ❤️ من أجل الإمارات",
      // Common translations
      settings: "الإعدادات",
      userInformation: "معلومات المستخدم",
      donationHistory: "سجل التبرعات",
      notifications: "الإشعارات",
      appearance: "المظهر",
      helpSupport: "المساعدة والدعم",
      logout: "تسجيل الخروج",
      language: "اللغة",
      english: "English",
      arabic: "العربية",
      // Add more translations as needed
    }
  };
  
  // Helper function to get translations
  const t = (key) => translations[language][key] || key;
  
  // Determine if RTL layout is needed
  const isRTL = language === 'ar';
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Guest" 
            component={GuestScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Verification" 
            component={VerificationScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="FoodTypeSelection" 
            component={FoodTypeSelectionScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="FoodInteraction" 
            component={FoodInteractionScreen}
            options={{
              headerLeft: () => null,  // This removes the back arrow
              gestureEnabled: false,   // This disables swipe back gesture
              headerShown: false,
            }}
          />
          {/* Add AdminScreen to the stack */}
          <Stack.Screen 
            name="Admin" 
            component={AdminScreen} 
            options={{ headerShown: false }} 
          />
          
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageContext.Provider>
  );
}