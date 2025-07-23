// ✅ app/screens/admin/AdminDrawerNavigator.tsx (ĐÃ SỬA)
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AdminDrawerParamList } from '../../types/navigation';

import AdminHomeScreen from '../admin/AdminHomeScreen';
import AddCarScreen from '../admin/AddCarScreen';
import AddBrandScreen from '../admin/AddBrandScreen';
import UserListScreen from '../admin/UserListScreen';
import CarListScreen from '../admin/CarListScreenAdmin';
import CustomDrawerContent from '../../components/CustomDrawer';

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

export default function AdminDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: true }}
    >
      <Drawer.Screen name="AdminHome" component={AdminHomeScreen} options={{ drawerLabel: 'Trang chủ' }} />
      <Drawer.Screen name="AddCar" component={AddCarScreen} options={{ drawerLabel: 'Thêm xe' }} />
      <Drawer.Screen name="AddBrand" component={AddBrandScreen} options={{ drawerLabel: 'Thêm hãng xe' }} />
      <Drawer.Screen name="UserList" component={UserListScreen} options={{ drawerLabel: 'Người dùng' }} />
      <Drawer.Screen name="CarList" component={CarListScreen} options={{ drawerLabel: 'Danh sách xe' }} />
    </Drawer.Navigator>
  );
}
