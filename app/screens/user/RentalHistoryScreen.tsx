import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { db } from '../../services/firebase';
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { navigationRef } from '../../utils/navigationRef';

export default function RentalHistoryScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'RentalHistory'>>();
  const [rentals, setRentals] = useState<any[]>([]);
  const fallbackUser = getAuth().currentUser;
  const userId = route?.params?.userId ?? fallbackUser?.uid;
  const checkAuth = useRequireAuth();

  useEffect(() => {
    if (!checkAuth()) return;

    if (!userId) {
      console.warn('Không có userId để truy vấn lịch sử thuê');
      return;
    }

    const fetchRentalHistory = async () => {
      try {
        const q = query(collection(db, 'rentals'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRentals(data);
      } catch (err) {
        console.error('Lỗi khi lấy lịch sử thuê:', err);
      }
    };

    fetchRentalHistory();
  }, [userId]);

  const renderImage = (imageUri: string | null | undefined) => {
    if (imageUri && typeof imageUri === 'string') {
      return (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          onError={() => console.warn('Không load được ảnh:', imageUri)}
        />
      );
    } else {
      return (
        <Image
          source={{ uri: 'https://via.placeholder.com/80x60?text=No+Image' }}
          style={styles.image}
        />
      );
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const startDate = item.rentDate ? new Date(item.rentDate) : null;
    const endDate =
      startDate && item.duration
        ? new Date(startDate.getTime() + (item.duration - 1) * 24 * 60 * 60 * 1000)
        : null;

    return (
      <TouchableOpacity
        onPress={() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate('ReviewScreen', {
              carId: item.carId,
              carName: item.carName,
            });
          } else {
            console.warn('navigationRef chưa sẵn sàng');
          }
        }}
      >
        <View style={styles.card}>
          {renderImage(item.image)}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.carName ?? 'Không rõ tên xe'}</Text>
            <Text>
              Ngày thuê:{' '}
              {startDate ? startDate.toLocaleDateString() : 'Không rõ'}
            </Text>
            <Text>
              Ngày kết thúc:{' '}
              {endDate ? endDate.toLocaleDateString() : 'Không rõ'}
            </Text>
            <Text>Thời hạn: {item.duration ?? '?'} ngày</Text>
            <Text>Trạng thái: {item.status ?? 'Không rõ'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigationRef.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử thuê xe</Text>
      </View>

      {rentals.length === 0 ? (
        <Text style={styles.empty}>Chưa có lịch sử thuê xe.</Text>
      ) : (
        <FlatList
          data={rentals}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  card: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    gap: 10,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
});
