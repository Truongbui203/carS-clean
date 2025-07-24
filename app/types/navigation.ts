// types/navigation.ts
import { NavigatorScreenParams } from '@react-navigation/native';

// Drawer cho User
export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  RentalHistory: undefined;
  EditProfile: undefined;
};
export type TabParamList = {
  HomeTab: undefined;
  RentalHistory: undefined;
  Profile: undefined;
};

// Drawer cho Admin
export type AdminDrawerParamList = {
  AdminHome: undefined;
  AddCar: undefined;
  AddBrand: undefined;
  UserList: undefined;
  CarList: undefined;
};

// Stack của Admin bao gồm Drawer và các màn riêng
export type AdminStackParamList = {
  AdminDrawer: NavigatorScreenParams<AdminDrawerParamList>;
  EditCar: { carId: string };
  RentalHistoryScreen: { userId: string };
};

// Root Stack - điều hướng chính toàn bộ app
export type RootStackParamList = {
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;

  Home: undefined;
  Profile: undefined;
  CarDetail: { carId: string };
  EditProfile: undefined;
  RentalHistory: { userId?: string };
  ReviewScreen: { carId: string; carName: string };

  UserStack: NavigatorScreenParams<DrawerParamList>;
  AdminStack: NavigatorScreenParams<AdminStackParamList>;
  
  
};
