import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';

export default function RentalHistoryScreen() {
  const [rentals, setRentals] = useState<any[]>([]);
  const route = useRoute<any>();
  const navigation = useNavigation();
  const fallbackUser = getAuth().currentUser;
  const userId = route?.params?.userId ?? fallbackUser?.uid;

  useEffect(() => {
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

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
          renderItem={({ item }) => (
            <View style={styles.card}>
              {renderImage(item.image)}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.carName ?? 'Không rõ tên xe'}</Text>
                <Text>
                  Ngày thuê:{' '}
                  {item.rentDate
                    ? new Date(item.rentDate).toLocaleDateString()
                    : 'Không rõ'}
                </Text>
                <Text>Thời hạn: {item.duration ?? '?'} ngày</Text>
                <Text>Trạng thái: {item.status ?? 'Không rõ'}</Text>
              </View>
            </View>
          )}
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
