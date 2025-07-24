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
import { Ionicons, Feather } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRequireAuth } from '../../hooks/useRequireAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

interface UserData {
  fullName?: string;
  photoURL?: string;
  [key: string]: any;
}

export default function ProfileScreen({ navigation }: Props) {
  const auth = getAuth();
  const user = auth.currentUser;
  const isFocused = useIsFocused();
  const checkAuth = useRequireAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAuth()) return;

    const fetchUserData = async () => {
      if (!user) return;
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setImageUri(data.photoURL || null);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    if (isFocused) fetchUserData();
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
    signOut(auth)
      .then(() => navigation.replace('SignIn'))
      .catch((err) => Alert.alert('Lỗi đăng xuất', err.message));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <TouchableOpacity onPress={handlePickImage}>
        <Image
          source={imageUri ? { uri: imageUri } : require('../../../assets/images/OIP1.jpg')}
          style={styles.avatar}
        />
      </TouchableOpacity>

      <Text style={styles.name}>{userData?.fullName || 'Người dùng'}</Text>
      <Text style={styles.username}>{user?.email}</Text>

      <View style={styles.list}>
        <ListItem
          icon="settings-outline"
          label="Cập nhật thông tin"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <ListItem
          icon="lock-closed-outline"
          label="Đổi mật khẩu"
          onPress={handleResetPassword}
        />
        <ListItem
          icon="book-outline"
          label="Lịch sử thuê xe"
          onPress={() => navigation.navigate('RentalHistory', { userId: user?.uid })}
        />
        <ListItem
          icon="log-out-outline"
          label="Đăng xuất"
          onPress={handleLogout}
          isLogout
        />
      </View>
    </ScrollView>
  );
}

function ListItem({
  icon,
  label,
  onPress,
  isLogout = false,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  isLogout?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={isLogout ? '#d00' : '#555'} />
        <Text style={[styles.rowText, isLogout && { color: '#d00' }]}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  avatar: {
    width: 100, height: 100, borderRadius: 50, marginBottom: 10,
  },
  name: {
    fontSize: 18, fontWeight: 'bold',
  },
  username: {
    color: 'gray',
  },
  editBtn: {
    backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginTop: 10,
  },
  editBtnText: {
    color: '#fff',
  },
  list: {
    marginTop: 30, width: '100%',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee',
  },
  rowLeft: {
    flexDirection: 'row', alignItems: 'center',
  },
  rowText: {
    marginLeft: 10, fontSize: 16,
  },
});
