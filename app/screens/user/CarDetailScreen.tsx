import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StyleSheet } from 'react-native';

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
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);

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

  useEffect(() => {
    if (car?.price && duration > 0) {
      setTotalPrice(car.price * duration);
    }
  }, [car?.price, duration]);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const q = query(collection(db, 'reviews'), where('carId', '==', carId));
        const snapshot = await getDocs(q);

        let total = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          if (typeof data.rating === 'number') total += data.rating;
        });

        const avg = snapshot.size > 0 ? total / snapshot.size : 0;
        setAverageRating(avg);
      } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
      }
    };

    fetchRating();
  }, [carId]);

  const isCarAvailable = async (
    carId: string,
    startDate: Date,
    duration: number
  ): Promise<boolean> => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration - 1);

    const q = query(
      collection(db, 'rentals'),
      where('carId', '==', carId),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);

    for (const doc of snapshot.docs) {
      const rentStart = new Date(doc.data().rentDate);
      const rentEnd = new Date(rentStart);
      rentEnd.setDate(rentEnd.getDate() + (doc.data().duration ?? 1) - 1);

      const isOverlapping = startDate <= rentEnd && endDate >= rentStart;
      if (isOverlapping) return false;
    }

    return true;
  };

  const handleRentCar = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) return Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
      if (!car?.id) return Alert.alert('Lỗi', 'Thông tin xe không hợp lệ.');

      const available = await isCarAvailable(car.id, startDate, duration);
      if (!available) {
        return Alert.alert('Xe đang được thuê trong khoảng thời gian này!');
      }

      await addDoc(collection(db, 'rentals'), {
        userId: user.uid,
        carId: car.id,
        carName: car.name,
        image: car.image,
        rentDate: startDate.toISOString(),
        duration,
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
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <Text>Không tìm thấy thông tin xe.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <Image source={{ uri: car.image }} style={{ width: '100%', height: 200 }} resizeMode="cover" />

      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{car.name}</Text>
          <Text style={{ fontSize: 16, color: '#007AFF' }}>
            {car.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}/ngày
          </Text>
        </View>

        <Text style={{ marginVertical: 8 }}>
          Takes You To The Most Iconic Destinations Around The World. Experience Natural And Cultural Wonders
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons
              key={i}
              name={averageRating >= i ? 'star' : averageRating >= i - 0.5 ? 'star-half' : 'star-outline'}
              size={16}
              color="#FFD700"
            />
          ))}
          <Text style={{ marginLeft: 6 }}>{averageRating.toFixed(1)}</Text>
        </View>

        {/* Thông số */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="speedometer" size={24} color="#007AFF" />
            <Text>90L</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="cog" size={24} color="#007AFF" />
            <Text>Manual</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="people" size={24} color="#007AFF" />
            <Text>2 People</Text>
          </View>
        </View>

        {/* Ngày thuê */}
        <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Ngày bắt đầu thuê:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={{ fontSize: 16, color: '#007AFF' }}>
            {startDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}

        {/* Số ngày thuê */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>Số ngày thuê:</Text>
          <TouchableOpacity onPress={() => setDuration(prev => Math.max(1, prev - 1))} style={{ padding: 6, marginHorizontal: 8 }}>
            <Ionicons name="remove-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 16 }}>{duration}</Text>
          <TouchableOpacity onPress={() => setDuration(prev => prev + 1)} style={{ padding: 6, marginLeft: 8 }}>
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <Text style={{ marginTop: 10, fontWeight: 'bold' }}>
          Tổng tiền:{' '}
          {totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </Text>

        {/* Nút thuê */}
        <TouchableOpacity
          onPress={handleRentCar}
          style={{ marginTop: 20, backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Rent Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    backgroundColor: '#ffffffee',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#eaeaea',
  },
  carImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    backgroundColor: '#fff',
    marginTop: -20,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  carPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  rating: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
  },
  specBox: {
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 13,
    color: '#555',
  },
  rentButton: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
