import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CarListScreen = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  const fetchCars = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'cars'));
      const carData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCars(carData);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu xe:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tự động reload dữ liệu mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchCars();
    }, [])
  );

  const confirmDelete = (carId: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa xe này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'cars', carId));
              Alert.alert('✅ Thành công', 'Xe đã được xóa');
              fetchCars();
            } catch (error) {
              Alert.alert('❌ Lỗi', 'Không thể xóa xe');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />;
  }

  return (
    <FlatList
      data={cars}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.noImage}>Không có hình ảnh</Text>
          )}
          <Text style={styles.title}>Tên xe: {item.name}</Text>
          <Text>Hãng: {item.brand}</Text>
          <Text>Giá: {item.price}</Text>
          <Text>Loại: {item.category || 'Không có'}</Text>
          {item.location && typeof item.location === 'object' ? (
            <Text>Vị trí: {item.location.latitude}, {item.location.longitude}</Text>
          ) : (
            <Text>Vị trí: Không xác định</Text>
          )}
          <Text>Liên hệ: {item.phone || 'Chưa có'}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate('AdminStack', {
                  screen: 'EditCar',
                  params: { carId: item.id },
                })
              }
            >
              <Text style={styles.btnText}>Sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDelete(item.id)}
            >
              <Text style={styles.btnText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

export default CarListScreen;

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 16,
    borderRadius: 10,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  noImage: {
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
