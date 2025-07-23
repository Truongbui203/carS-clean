import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import { getAuth, signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const auth = getAuth();
  const user = auth.currentUser;
  const isFocused = useIsFocused();

  const [userData, setUserData] = useState<any>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setImageUri(data?.photoURL || null);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setImageUri(uri);

      if (user) {
        try {
          await updateProfile(user, { photoURL: uri });
          await updateDoc(doc(db, 'users', user.uid), { photoURL: uri });
          Alert.alert('Thành công', 'Cập nhật ảnh đại diện!');
        } catch (err) {
          Alert.alert('Lỗi', 'Không thể lưu ảnh đại diện');
        }
      }
    }
  };

  const handleResetPassword = () => {
    if (user?.email) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => Alert.alert('Email đã được gửi để đặt lại mật khẩu'))
        .catch((err) => Alert.alert('Lỗi', err.message));
    }
  };

  const handleLogout = () => {
    signOut(auth).catch((err) => Alert.alert('Lỗi đăng xuất', err.message));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Quay lại */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Avatar */}
      <TouchableOpacity onPress={handlePickImage}>
        <Image
          source={{ uri: imageUri || 'https://i.pravatar.cc/150' }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {/* Thông tin người dùng */}
      <Text style={styles.name}>
        {userData?.name || 'Guest User'}
      </Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.country}>{userData?.country || ''}</Text>

      {/* Các nút */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.buttonText}>✏️ Cập nhật thông tin</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>🔑 Đổi mật khẩu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RentalHistory')}>
          <Text style={styles.buttonText}>📖 Lịch sử thuê xe</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#eee' }]} onPress={handleLogout}>
          <Text style={[styles.buttonText, { color: '#d00' }]}>🚪 Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 80,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  country: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  section: {
    width: '90%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007bff11',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: '#007bff55',
    borderWidth: 1,
  },
  buttonText: {
    color: '#007bff',
    fontSize: 16,
    textAlign: 'center',
  },
});
