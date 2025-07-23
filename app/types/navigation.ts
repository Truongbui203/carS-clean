// ✅ types/navigation.ts (ĐÃ SỬA - không dùng tiếng Việt làm key)
import { NavigatorScreenParams } from '@react-navigation/native';

// Drawer stack bên trong AdminStack
export type AdminDrawerParamList = {
  AdminHome: undefined;
  AddCar: undefined;
  AddBrand: undefined;
  UserList: undefined;
  CarList: undefined;
  
};

// Stack chứa drawer + các màn khác như EditCar
export type AdminStackParamList = {
  AdminDrawer: NavigatorScreenParams<AdminDrawerParamList>;
  EditCar: { carId: string };
};

// RootStackParamList - cấp cao nhất
export type RootStackParamList = {
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  

  Home: undefined;
  Profile: undefined;
  CarDetail: { carId: string };
  EditProfile: undefined;
  RentalHistory: undefined;
   UserStack: NavigatorScreenParams<DrawerParamList>; 

  // Nested navigate với params
  AdminStack: NavigatorScreenParams<AdminStackParamList>;
};
export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  RentalHistory: undefined;
  EditProfile: undefined;
};
