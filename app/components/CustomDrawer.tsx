import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { auth, getUserInfo } from '../services/firebase';

export default function CustomDrawer(props: any) {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user?.uid) {
        const data = await getUserInfo(user.uid);
        setUserData(data);
        console.log('🔥 Dữ liệu người dùng:', data);
      }
    };
    fetchUser();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* Admin Info */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Image
            source={require('../../assets/images/BMW.png')}
            style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
          />
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
            {userData?.fullName || 'Admin'}
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            {userData?.email || 'admin@example.com'}
          </Text>
        </View>

        {/* Menu Items */}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
          onPress={() => props.navigation.navigate('AdminHome')}
        >
          <Ionicons name="home" size={20} />
          <Text style={{ marginLeft: 12, fontSize: 15 }}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
          onPress={() => props.navigation.navigate('AddCar')}
        >
          <Ionicons name="car" size={20} />
          <Text style={{ marginLeft: 12, fontSize: 15 }}>Thêm xe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
          onPress={() => props.navigation.navigate('AddBrand')}
        >
          <MaterialIcons name="branding-watermark" size={20} />
          <Text style={{ marginLeft: 12, fontSize: 15 }}>Thêm hãng xe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
          onPress={() => props.navigation.navigate('UserList')}
        >
          <Ionicons name="people" size={20} />
          <Text style={{ marginLeft: 12, fontSize: 15 }}>Người dùng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
          onPress={() => props.navigation.navigate('CarList')}
        >
          <Ionicons name="list" size={20} />
          <Text style={{ marginLeft: 12, fontSize: 15 }}>Danh sách xe</Text>
        </TouchableOpacity>

        {/* Đăng xuất */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#d9534f',
            padding: 12,
            marginTop: 30,
            borderRadius: 8,
            justifyContent: 'center',
          }}
          onPress={() => {
            auth.signOut();
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'SignIn' }],
            });
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8, fontWeight: 'bold' }}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}
