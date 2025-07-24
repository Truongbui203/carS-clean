// app/hooks/useRequireAuth.ts
import { useUser } from '../contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useEffect } from 'react';

type Navigation = StackNavigationProp<RootStackParamList>;

export const useRequireAuth = () => {
  const { uid, loading } = useUser();
  const navigation = useNavigation<Navigation>();

  const checkAuth = () => {
    if (loading) return false;

    if (!uid) {
      // Dùng setTimeout để tránh gọi navigation trong render cycle
      setTimeout(() => {
        navigation.navigate('SignIn');
      }, 0);
      return false;
    }

    return true;
  };

  return checkAuth;
};
