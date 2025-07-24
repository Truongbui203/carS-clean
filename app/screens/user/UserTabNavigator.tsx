import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import RentalHistoryScreen from './RentalHistoryScreen';
import { Ionicons } from '@expo/vector-icons';
import { DrawerParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

const Tab = createBottomTabNavigator<DrawerParamList>();

export default function UserTabNavigator() {
  const insets = useSafeAreaInsets(); 

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          ...styles.tabBar,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        },
        tabBarIcon: ({ focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = 'home';
          if (route.name === 'Profile') iconName = 'person';
          if (route.name === 'RentalHistory') iconName = 'time';

          return (
            <View style={styles.iconContainer}>
              <Ionicons
                name={iconName}
                size={26}
                color={focused ? '#007aff' : '#ccc'}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="RentalHistory" component={RentalHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
tabBar: {
  position: 'absolute',
  bottom: 0,                 
  left: 20,
  right: 20,
  elevation: 5,
  backgroundColor: '#fff',
  borderRadius: 30,
  height: 70,
  paddingBottom: Platform.OS === 'android' ? 20 : 30, 
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
},
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: Platform.OS === 'android' ? 0 : 5,
  },
});
