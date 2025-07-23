import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDrawerNavigator from './AdminDrawerNavigator';
import EditCarScreen from './EditCar';
import { AdminStackParamList } from '../../types/navigation';
import RentalHistoryScreen from '../user/RentalHistoryScreen'; 


const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="AdminDrawer" component={AdminDrawerNavigator} />
      <Stack.Screen name="EditCar" component={EditCarScreen} />
      <Stack.Screen name="RentalHistoryScreen" component={RentalHistoryScreen} />
    </Stack.Navigator>
  );
}
