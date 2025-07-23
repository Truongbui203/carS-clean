import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types/navigation';


import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/user/HomeScreen';
import ProfileScreen from './screens/user/ProfileScreen';
import CarDetailScreen from './screens/user/CarDetailScreen';
import AdminStackNavigator from './screens/admin/AdminStackNavigator';
import RentalHistoryScreen from './screens/user/RentalHistoryScreen'
import UserStackNavigator from './screens/user/UserDrawerNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const role = userDoc.exists() ? userDoc.data().role : 'user';
          setUserRole(role);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return null;

return (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {!isAuthenticated ? (
      <>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </>
    ) : userRole === 'admin' ? (
      <>
        <Stack.Screen name="AdminStack" component={AdminStackNavigator} />
      </>
    ) : (
      <>
        <Stack.Screen name="UserStack" component={UserStackNavigator} />
        <Stack.Screen name="CarDetail" component={CarDetailScreen} />
      </>
    )}
  </Stack.Navigator>
);

}
