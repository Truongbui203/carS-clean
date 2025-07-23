import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

type CarDetailRouteProp = RouteProp<RootStackParamList, 'CarDetail'>;

type Car = {
  id?: string;
  name: string;
  location: string;
  price: number;
  brand: string;
  category: string;
  image: string;
};

export default function CarDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<CarDetailRouteProp>();
  const { carId } = route.params;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const carDoc = await getDoc(doc(db, 'cars', carId));
        if (carDoc.exists()) {
          const data = carDoc.data() as Car;
          setCar({ ...data, id: carDoc.id });
        } else {
          Alert.alert('Không tìm thấy xe', 'Dữ liệu không tồn tại trong hệ thống.');
        }
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết xe:', err);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu xe.');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [carId]);

  const handleRentCar = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) return Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
      if (!car?.id) return Alert.alert('Lỗi', 'Thông tin xe không hợp lệ.');

      await addDoc(collection(db, 'rentals'), {
        userId: user.uid,
        carId: car.id,
        carName: car.name,
        image: car.image,
        rentDate: new Date().toISOString(),
        duration: 3,
        status: 'active',
      });

      Alert.alert('Thành công', 'Đã thuê xe thành công!');
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể thuê xe.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 100 }} />;
  }

  if (!car) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy thông tin xe.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="heart-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: car.image }} style={styles.carImage} resizeMode="cover" />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.rowBetween}>
          <Text style={styles.carName}>{car.name}</Text>
          <Text style={styles.carPrice}>
            {car.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}/ngày
          </Text>
        </View>

        <Text style={styles.description}>
          Takes You To The Most Iconic Destinations Around The World. Experience Natural And Cultural Wonders
        </Text>

        <View style={styles.row}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Ionicons name="star" size={16} color="#FFD700" />
          <Ionicons name="star" size={16} color="#FFD700" />
          <Ionicons name="star" size={16} color="#FFD700" />
          <Ionicons name="star-half" size={16} color="#FFD700" />
          <Text style={styles.rating}>4.9</Text>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specBox}>
            <Ionicons name="speedometer" size={24} color="#007AFF" />
            <Text style={styles.specText}>90L</Text>
          </View>
          <View style={styles.specBox}>
            <Ionicons name="cog" size={24} color="#007AFF" />
            <Text style={styles.specText}>Manual</Text>
          </View>
          <View style={styles.specBox}>
            <Ionicons name="people" size={24} color="#007AFF" />
            <Text style={styles.specText}>2 People</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.rentButton} onPress={handleRentCar}>
          <Text style={styles.rentButtonText}>Rent Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  iconButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  carImage: { width: '100%', height: '100%' },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carName: { fontSize: 22, fontWeight: 'bold' },
  carPrice: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  description: { marginTop: 10, fontSize: 14, color: '#555' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  rating: { marginLeft: 8, fontSize: 14, color: '#333' },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  specBox: { alignItems: 'center' },
  specText: { marginTop: 6, fontSize: 14, color: '#333' },
  rentButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  rentButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
