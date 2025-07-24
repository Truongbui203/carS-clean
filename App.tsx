// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './app/AppNavigator';
import { navigationRef } from './app/utils/navigationRef';
import { UserProvider } from './app/contexts/UserContext';

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}
