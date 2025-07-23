import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AddCarScreen from '../screens/admin/AddCarScreen';
import AddBrandScreen from '../screens/admin/AddBrandScreen';
import UserListScreen from '../screens/admin/UserListScreen';
import CustomDrawerContent from '../components/CustomDrawer'; 
import CarListScreen from '../screens/admin/CarListScreen';

const Drawer = createDrawerNavigator();

export default function AdminDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: true }}
    >
      <Drawer.Screen name="AdminHome" component={AdminHomeScreen} options={{ drawerLabel: "Trang chủ" }} />
      <Drawer.Screen name="AddCar" component={AddCarScreen} options={{ drawerLabel: "Thêm xe" }} />
      <Drawer.Screen name="AddBrand" component={AddBrandScreen} options={{ drawerLabel: "Thêm hãng xe" }} />
      <Drawer.Screen name="UserList" component={UserListScreen} options={{ drawerLabel: "Người dùng" }} />
      <Drawer.Screen name="CarList" component={CarListScreen} />

      
    </Drawer.Navigator>
  );
}
