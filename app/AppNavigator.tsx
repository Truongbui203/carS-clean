import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { auth, db } from './services/firebase';
import { RootStackParamList } from './types/navigation';
import ReviewScreen from '../app/screens/user/ReviewScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import CarDetailScreen from './screens/user/CarDetailScreen';
import AdminStackNavigator from './screens/admin/AdminStackNavigator';
import RentalHistoryScreen from './screens/user/RentalHistoryScreen';
import ProfileScreen from './screens/user/ProfileScreen';
import UserTabNavigator from './screens/user/UserTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const WithSafeAreaUserTab = (props: any) => (
  <SafeAreaProvider>
    <UserTabNavigator {...props} />
  </SafeAreaProvider>
);
const WithSafeAreaCarDetail = (props: any) => (
  <SafeAreaProvider>
    <CarDetailScreen {...props} />
  </SafeAreaProvider>
);
const WithSafeAreaRentalHistory = (props: any) => (
  <SafeAreaProvider>
    <RentalHistoryScreen {...props} />
  </SafeAreaProvider>
);
const WithSafeAreaProfile = (props: any) => (
  <SafeAreaProvider>
    <ProfileScreen {...props} />
  </SafeAreaProvider>
);
const WithSafeAreaAdminStack = (props: any) => (
  <SafeAreaProvider>
    <AdminStackNavigator {...props} />
  </SafeAreaProvider>
);

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      setShowOnboarding(!seen);
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          const data = docSnap.data();
          setUserRole(data?.role || 'user');
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Lỗi lấy role:', error);
          setUserRole('user');
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!loading) {
      if (showOnboarding) setInitialRoute('Onboarding');
      else if (!isAuthenticated) setInitialRoute('UserStack'); // ✅ Cho khách vào tab bar
      else setInitialRoute(userRole === 'admin' ? 'AdminStack' : 'UserStack');
    }
  }, [loading, isAuthenticated, userRole, showOnboarding]);

  if (initialRoute === null) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      {/* Public screens */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* Main navigators */}
      <Stack.Screen name="UserStack" component={WithSafeAreaUserTab} />
      <Stack.Screen name="AdminStack" component={WithSafeAreaAdminStack} />

      {/* Other screens */}
      <Stack.Screen name="CarDetail" component={WithSafeAreaCarDetail} />
      <Stack.Screen name="RentalHistory" component={WithSafeAreaRentalHistory} />
      <Stack.Screen name="Profile" component={WithSafeAreaProfile} />
      <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
    </Stack.Navigator>
  );
}
