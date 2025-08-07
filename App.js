// App.js
import React, { createContext, useState } from 'react';
import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import all screens
import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import GuestScreen from './screens/GuestScreen';
import VerificationScreen from './screens/VerificationScreen';
import FoodTypeSelectionScreen from './screens/FoodTypeSelectionScreen';
import FoodInteractionScreen from './screens/FoodInteractionScreen';
import AdminScreen from './screens/AdminScreen';
import GovernmentDashboard from './screens/GovernmentDashboard';
import DriverDashboard from './screens/DriverDashboard';
import DriverLoginScreen from './screens/DriverLoginScreen';

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
      driverLogin: "Driver Login",
      
      // LoginScreen translations
      loginSubtitle: "Login to your account",
      emailOrPhone: "Email or Phone",
      enterEmailOrPhone: "Enter Email or Phone",
      enterPassword: "Enter Password",
      forgotPassword: "Forgot Password?",
      dontHaveAccount: "Don't have an account?",
      missingInformation: "Missing Information",
      enterBothFields: "Please enter both fields",
      loginSuccessful: "Login Successful",
      guestUser: "Guest User",
      loginSuccess: "Login Success",
      dataLoaded: "Data loaded successfully",
      loginFailed: "Login Failed",
      invalidCredentials: "Invalid credentials",
      
      // RegisterScreen translations
      createAccount: "Create Account",
      fullName: "Full Name",
      enterFullName: "Enter Full Name",
      phoneNumber: "Phone Number",
      enterPhoneNumber: "Enter Phone Number",
      selectUserType: "Select User Type",
      selectType: "Select Type",
      household: "Household",
      restaurant: "Restaurant",
      supermarket: "Supermarket",
      organization: "Organization",
      other: "Other",
      enterYourType: "Enter Your Type",
      alreadyHaveAccount: "Already have an account?",
      accountCreated: "Account Created",
      accountCreatedSuccess: "Your account has been created successfully!",
      redirectingToApp: "Redirecting to app...",
      missingInfo: "Missing Information",
      completeAllFields: "Please complete all fields",
      userExists: "User Exists",
      emailAlreadyUsed: "This email is already in use",
      
      // FoodInteractionScreen translations
      wouldYouLikeTo: "What would you like to do?",
      howManyPeople: "How many people can this food feed?",
      isFoodNew: "Is the food new or leftover?",
      isFoodConsumable: "Is the food consumable by humans?",
      uploadPhoto: "Upload or Take Photo",
      selectPhoto: "Select Photo",
      takePhoto: "Take Photo",
      location: "Location",
      enterLocation: "Enter Location",
      phoneNumber: "Phone Number",
      enterPhone: "Enter Phone",
      submitDonation: "Submit Donation",
      whyRequesting: "Why are you requesting food?",
      howManyPeopleRequest: "How many people will this serve?",
      submitRequest: "Submit Request",
      askAI: "Ask AI",
      getRecipe: "Get Recipe Suggestions",
      pleaseFillAll: "Please fill all fields",
      donationSuccess: "Donation Successful",
      donationSuccessMsg: "Your donation has been submitted successfully!",
      requestSuccess: "Request Successful",
      requestSuccessMsg: "Your food request has been submitted successfully!",
      emptyInput: "Empty Input",
      pleaseEnterQuestion: "Please enter your food question",
      somethingWentWrong: "Something went wrong. Please try again later.",
      logoutSuccess: "Logout Success",
      sessionCleared: "Session cleared successfully",
      logoutError: "Logout Error",
      tryAgain: "Please try again",
      success: "Success",
      accountUpdated: "Account updated successfully",
      error: "Error",
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
      edit: "Edit",
      name: "Name",
      enterName: "Enter Name",
      email: "Email",
      enterEmail: "Enter Email",
      phone: "Phone",
      enterPhone: "Enter Phone",
      type: "Type",
      enterType: "Enter Type",
      address: "Address",
      enterAddress: "Enter Address",
      save: "Save",
      cancel: "Cancel",
      enableNotifications: "Enable Notifications",
      notificationsDescription: "Receive notifications about donations and requests",
      darkMode: "Dark Mode",
      fontSize: "Font Size",
      small: "Small",
      medium: "Medium",
      large: "Large",
      contactSupport: "Contact Support",
      visitWebsite: "Visit Website",
      aboutTawfeer: "About Tawfeer",
      rateApp: "Rate App",
      pointsSystem: "Points System",
      whatArePoints: "What are Points?",
      pointsDescription: "Points are rewards you earn for contributing to the Tawfeer community through food donations.",
      howToEarnPoints: "How to Earn Points",
      pointsPerDonation: "Points per Donation",
      helpCommunity: "Help the community",
      reduceFoodWaste: "Reduce food waste",
      purpose: "Purpose",
      trackImpact: "Track your impact",
      encourageParticipation: "Encourage participation",
      buildCommunity: "Build community",
      supportUAEVision: "Support UAE Vision",
      benefits: "Benefits",
      recognition: "Recognition",
      motivation: "Motivation",
      sustainabilityMovement: "Sustainability movement",
      noDonationsYet: "No donations yet",
      peopleServed: "People Served",
      foodType: "Food Type",
      weight: "Weight",
      status: "Status",
      estimatedPickup: "Estimated Pickup",
      driver: "Driver",
      pointsEarned: "Points Earned",
      close: "Close",
      tawfeerGuide: "Tawfeer Guide",
      ourGoals: "Our Goals",
      reduceFoodWaste: "Reduce food waste",
      promoteDonation: "Promote donation",
      supportUAEVision: "Support UAE Vision",
      useAI: "Use AI",
      rewardUsers: "Reward users",
      buildCommunity: "Build community",
      howToUse: "How to Use",
      donatingFood: "Donating Food",
      clickDonateFood: "Click Donate Food",
      fillPeopleServed: "Fill how many people served",
      specifyFoodType: "Specify food type",
      confirmSafe: "Confirm safe for consumption",
      uploadPhoto: "Upload photo",
      enterLocationPhone: "Enter location and phone",
      submitEarnPoints: "Submit and earn points",
      requestingFood: "Requesting Food",
      clickRequestFood: "Click Request Food",
      explainNeed: "Explain your need",
      specifyPeople: "Specify how many people",
      enterContactInfo: "Enter contact information",
      submitRequest: "Submit request",
      aiAssistant: "AI Assistant",
      askAboutIngredients: "Ask about ingredients",
      getRecipeSuggestions: "Get recipe suggestions",
      learnToCook: "Learn to cook",
      availableEverywhere: "Available everywhere",
      settingsProfile: "Settings & Profile",
      viewEditProfile: "View and edit profile",
      checkHistory: "Check donation history",
      trackPoints: "Track points",
      customizeApp: "Customize app",
      getHelp: "Get help",
      pointsSystemDescription: "Earn 20 points for each food donation. Points track your positive impact on reducing food waste and supporting the community.",
      environmentalImpact: "Environmental Impact",
      donationHelps: "Every donation helps",
      reduceEmissions: "Reduce methane emissions",
      saveResources: "Save water and energy",
      supportFamilies: "Support families in need",
      buildSustainableUAE: "Build a sustainable UAE",
      userTypes: "User Types",
      familiesIndividuals: "Families and individuals",
      foodBusinesses: "Food service businesses",
      groceryStores: "Grocery stores",
      ngosCompanies: "NGOs and companies",
      temporaryAccess: "Temporary access with limited features",
      confirmDelete: "Confirm Delete",
      deleteUser: "Delete User",
      userDeleted: "User deleted successfully",
      adminReport: "Admin Report",
      generatedOn: "Generated on",
      totalAccounts: "Total Accounts",
      totalDonations: "Total Donations",
      totalPoints: "Total Points",
      activeUsers: "Active Users",
      topUsers: "Top Users",
      confirmLogout: "Confirm Logout",
      logoutConfirmation: "Are you sure you want to logout?",
      adminLoggedOut: "Admin logged out successfully",
      adminDashboard: "Admin Dashboard",
      registeredUsers: "Registered Users",
      recentDonations: "Recent Donations",
      specifyCookedUncooked: "Specify if cooked or uncooked",
      fillDetails: "Fill in the required details",
      yes: "Yes",
      no: "No",
      items: "Items",
      kg: "Kg",
      liters: "Liters",
      orders: "Orders",
      points: "Points",
      cancel: "Cancel",
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
      driverLogin: "تسجيل دخول السائق",
      
      // LoginScreen translations
      loginSubtitle: "تسجيل الدخول إلى حسابك",
      emailOrPhone: "البريد الإلكتروني أو رقم الهاتف",
      enterEmailOrPhone: "أدخل البريد الإلكتروني أو رقم الهاتف",
      enterPassword: "أدخل كلمة المرور",
      forgotPassword: "نسيت كلمة المرور؟",
      dontHaveAccount: "ليس لديك حساب؟",
      missingInformation: "معلومات ناقصة",
      enterBothFields: "الرجاء إدخال كلا الحقلين",
      loginSuccessful: "تم تسجيل الدخول بنجاح",
      guestUser: "مستخدم ضيف",
      loginSuccess: "نجح تسجيل الدخول",
      dataLoaded: "تم تحميل البيانات بنجاح",
      loginFailed: "فشل تسجيل الدخول",
      invalidCredentials: "بيانات اعتماد غير صالحة",
      
      // RegisterScreen translations
      createAccount: "إنشاء حساب",
      fullName: "الاسم الكامل",
      enterFullName: "أدخل الاسم الكامل",
      phoneNumber: "رقم الهاتف",
      enterPhoneNumber: "أدخل رقم الهاتف",
      selectUserType: "اختر نوع المستخدم",
      selectType: "اختر النوع",
      household: "منزل",
      restaurant: "مطعم",
      supermarket: "سوبر ماركت",
      organization: "منظمة",
      other: "آخر",
      enterYourType: "أدخل نوعك",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      accountCreated: "تم إنشاء الحساب",
      accountCreatedSuccess: "تم إنشاء حسابك بنجاح!",
      redirectingToApp: "جاري التحويل إلى التطبيق...",
      missingInfo: "معلومات ناقصة",
      completeAllFields: "يرجى استكمال جميع الحقول",
      userExists: "المستخدم موجود بالفعل",
      emailAlreadyUsed: "البريد الإلكتروني مستخدم بالفعل",
      
      // FoodInteractionScreen translations
      wouldYouLikeTo: "ماذا ترغب في فعله؟",
      howManyPeople: "كم شخصًا يمكن أن يطعم هذا الطعام؟",
      isFoodNew: "هل الطعام جديد أو متبقي؟",
      isFoodConsumable: "هل الطعام صالح للاستهلاك البشري؟",
      uploadPhoto: "تحميل أو التقاط صورة",
      selectPhoto: "اختر صورة",
      takePhoto: "التقاط صورة",
      location: "الموقع",
      enterLocation: "أدخل الموقع",
      phoneNumber: "رقم الهاتف",
      enterPhone: "أدخل رقم الهاتف",
      submitDonation: "إرسال التبرع",
      whyRequesting: "لماذا تطلب الطعام؟",
      howManyPeopleRequest: "كم شخصًا سيرد هذا؟",
      submitRequest: "إرسال الطلب",
      askAI: "اسأل الذكاء الاصطناعي",
      getRecipe: "الحصول على اقتراحات الوصفات",
      pleaseFillAll: "يرجى ملء جميع الحقول",
      donationSuccess: "تم التبرع بنجاح",
      donationSuccessMsg: "تم إرسال تبرعك بنجاح!",
      requestSuccess: "تم إرسال الطلب بنجاح",
      requestSuccessMsg: "تم إرسال طلب الطعام بنجاح!",
      emptyInput: "إدخال فارغ",
      pleaseEnterQuestion: "يرجى إدخال سؤال الطعام",
      somethingWentWrong: "حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقًا.",
      logoutSuccess: "تم تسجيل الخروج بنجاح",
      sessionCleared: "تم مسح الجلسة بنجاح",
      logoutError: "خطأ في تسجيل الخروج",
      tryAgain: "يرجى المحاولة مرة أخرى",
      success: "نجاح",
      accountUpdated: "تم تحديث الحساب بنجاح",
      error: "خطأ",
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
      edit: "تحرير",
      name: "الاسم",
      enterName: "أدخل الاسم",
      email: "البريد الإلكتروني",
      enterEmail: "أدخل البريد الإلكتروني",
      phone: "الهاتف",
      enterPhone: "أدخل رقم الهاتف",
      type: "النوع",
      enterType: "أدخل النوع",
      address: "العنوان",
      enterAddress: "أدخل العنوان",
      save: "حفظ",
      cancel: "إلغاء",
      enableNotifications: "تفعيل الإشعارات",
      notificationsDescription: "تلقي إشعارات حول التبرعات والطلبات",
      darkMode: "الوضع المظلم",
      fontSize: "حجم الخط",
      small: "صغير",
      medium: "متوسط",
      large: "كبير",
      contactSupport: "اتصل بالدعم",
      visitWebsite: "زيارة الموقع",
      aboutTawfeer: "حول تطوير",
      rateApp: "قيم التطبيق",
      pointsSystem: "نظام النقاط",
      whatArePoints: "ما هي النقاط؟",
      pointsDescription: "النقاط هي مكافآت تكسبها لمساهمتك في مجتمع تطوير من خلال التبرعات بالطعام.",
      howToEarnPoints: "كيفية كسب النقاط",
      pointsPerDonation: "نقاط لكل تبرع",
      helpCommunity: "ساعد المجتمع",
      reduceFoodWaste: "قلل هدر الطعام",
      purpose: "الغرض",
      trackImpact: "تتبع تأثيرك",
      encourageParticipation: "شجع المشاركة",
      buildCommunity: "بناء المجتمع",
      supportUAEVision: "دعم رؤية الإمارات",
      benefits: "الفوائد",
      recognition: "الاعتراف",
      motivation: "الدافع",
      sustainabilityMovement: "حركة الاستدامة",
      noDonationsYet: "لا توجد تبرعات حتى الآن",
      peopleServed: "الأشخاص المستفيدون",
      foodType: "نوع الطعام",
      weight: "الوزن",
      status: "الحالة",
      estimatedPickup: "وقت التقدير المقدر",
      driver: "السائق",
      pointsEarned: "النقاط المكتسبة",
      close: "إغلاق",
      tawfeerGuide: "دليل تطوير",
      ourGoals: "أهدافنا",
      reduceFoodWaste: "قلل هدر الطعام",
      promoteDonation: "شجع التبرع",
      supportUAEVision: "دعم رؤية الإمارات",
      useAI: "استخدم الذكاء الاصطناعي",
      rewardUsers: "كافئ المستخدمين",
      buildCommunity: "بناء المجتمع",
      howToUse: "كيفية الاستخدام",
      donatingFood: "التبرع بالطعام",
      clickDonateFood: "انقر على تبرع بالطعام",
      fillPeopleServed: "املأ عدد الأشخاص الذين سيردون",
      specifyFoodType: "حدد نوع الطعام",
      confirmSafe: "تأكد من السلامة للاستهلاك",
      uploadPhoto: "رفع صورة",
      enterLocationPhone: "أدخل الموقع ورقم الهاتف",
      submitEarnPoints: "إرسال واكسب نقاط",
      requestingFood: "طلب الطعام",
      clickRequestFood: "انقر على طلب الطعام",
      explainNeed: "اشرح حاجتك",
      specifyPeople: "حدد عدد الأشخاص",
      enterContactInfo: "أدخل معلومات الاتصال",
      submitRequest: "إرسال الطلب",
      aiAssistant: "مساعد الذكاء الاصطناعي",
      askAboutIngredients: "اسأل عن المكونات",
      getRecipeSuggestions: "احصل على اقتراحات الوصفات",
      learnToCook: "تعلم الطهي",
      availableEverywhere: "متاح في كل مكان",
      settingsProfile: "الإعدادات والملف الشخصي",
      viewEditProfile: "عرض وتحرير الملف الشخصي",
      checkHistory: "تحقق من سجل التبرعات",
      trackPoints: "تتبع النقاط",
      customizeApp: "تخصيص التطبيق",
      getHelp: "احصل على المساعدة",
      pointsSystemDescription: "اكسب 20 نقطة لكل تبرع بالطعام. النقاط تتبع تأثيرك الإيجابي في تقليل هدر الطعام ودعم المجتمع.",
      environmentalImpact: "التأثير البيئي",
      donationHelps: "كل تبرع يساعد",
      reduceEmissions: "تقليل انبعاثات الميثان",
      saveResources: "توفير المياه والطاقة",
      supportFamilies: "دعم الأسر في الحاجة",
      buildSustainableUAE: "بناء الإمارات المستدامة",
      userTypes: "أنواع المستخدمين",
      familiesIndividuals: "العائلات والأفراد",
      foodBusinesses: "مؤسسات خدمات الطعام",
      groceryStores: "محلات البقالة",
      ngosCompanies: "المنظمات والشركات",
      temporaryAccess: "وصول مؤقت مع ميزات محدودة",
      confirmDelete: "تأكيد الحذف",
      deleteUser: "حذف المستخدم",
      userDeleted: "تم حذف المستخدم بنجاح",
      adminReport: "تقرير المشرف",
      generatedOn: "تم إنشاؤه في",
      totalAccounts: "إجمالي الحسابات",
      totalDonations: "إجمالي التبرعات",
      totalPoints: "إجمالي النقاط",
      activeUsers: "المستخدمون النشطون",
      topUsers: "أفضل المستخدمين",
      confirmLogout: "تأكيد تسجيل الخروج",
      logoutConfirmation: "هل أنت متأكد من رغبتك في تسجيل الخروج؟",
      adminLoggedOut: "تم تسجيل خروج المشرف بنجاح",
      adminDashboard: "لوحة تحكم المشرف",
      registeredUsers: "المستخدمون المسجلون",
      recentDonations: "التبرعات الأخيرة",
      specifyCookedUncooked: "حدد إذا كان مطبوخًا أو غير مطبوخ",
      fillDetails: "املأ التفاصيل المطلوبة",
      yes: "نعم",
      no: "لا",
      items: "عناصر",
      kg: "كجم",
      liters: "لتر",
      orders: "الطلبات",
      points: "نقاط",
      cancel: "إلغاء",
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
              headerLeft: () => null, // This removes the back arrow
              gestureEnabled: false, // This disables swipe back gesture
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Admin"
            component={AdminScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GovernmentDashboard"
            component={GovernmentDashboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DriverDashboard"
            component={DriverDashboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DriverLogin"
            component={DriverLoginScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageContext.Provider>
  );
}

// Register the main component
registerRootComponent(App);
