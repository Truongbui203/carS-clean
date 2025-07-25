import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useUser } from '../../contexts/UserContext';
import * as Location from 'expo-location';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { uid } = useUser();
  const DEFAULT_LOCATION = { latitude: 10.9804, longitude: 106.6519 };
const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
const [nearCars, setNearCars] = useState<any[]>([]);
const [nearbyCars, setNearbyCars] = useState<any[]>([]);
const [brandMap, setBrandMap] = useState<Record<string, string>>({});




 function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
useEffect(() => {
  const fetchBrands = async () => {
    const snapshot = await getDocs(collection(db, 'brands'));
    const map: Record<string, string> = {};
    snapshot.forEach(doc => {
      map[doc.id] = doc.data().name?.trim() || '';
    });
    setBrandMap(map);
  };
  fetchBrands();
}, []);


// 1. Lấy vị trí người dùng (mặc định Thủ Dầu Một nếu không được cấp quyền)
useEffect(() => {
  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } else {
      console.warn("Không được cấp quyền vị trí, dùng vị trí mặc định");
      setUserLocation(DEFAULT_LOCATION);
    }
  })();
}, []);

// 2. Lấy danh sách xe và tính điểm rating
useEffect(() => {
  const fetchCars = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'cars'));
      const carData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const ratingSnap = await getDocs(collection(db, 'reviews'));
      const reviews = ratingSnap.docs.map(doc => doc.data());

      const ratingsMap: Record<string, number> = {};
      const countMap: Record<string, number> = {};

      reviews.forEach((review: any) => {
        const { carId, rating } = review;
        if (rating && carId) {
          ratingsMap[carId] = (ratingsMap[carId] || 0) + rating;
          countMap[carId] = (countMap[carId] || 0) + 1;
        }
      });

      const carsWithRating = carData.map(car => {
        const total = ratingsMap[car.id] || 0;
        const count = countMap[car.id] || 0;
        const avgRating = count > 0 ? (total / count).toFixed(1) : '';
        return { ...car, rating: avgRating };
      });
      setCars(carsWithRating);
      const nearby = carsWithRating.filter((car: any) => {
  if (
    car.location &&
    typeof car.location === 'object' &&
    car.location.latitude &&
    car.location.longitude
  ) {
    const distance = getDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      car.location.latitude,
      car.location.longitude
    );
    return distance <= 10;
  }
  return false;
});
setNearbyCars(nearby);

    } catch (error) {
      console.error('Lỗi lấy dữ liệu xe hoặc đánh giá:', error);
    } finally {
      setLoading(false);
    }
  };
  const filteredNearCars = cars.filter(car => {
  if (
    car.location &&
    typeof car.location === 'object' &&
    car.location.latitude &&
    car.location.longitude
  ) {
    const distance = getDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      car.location.latitude,
      car.location.longitude
    );
    return distance <= 10;
  }
  return false;
});
setNearCars(filteredNearCars);



  fetchCars();
}, []);

  const topRatedCars = [...cars]
    .filter(car => typeof car.rating === 'number')
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5);

  const filteredCars = cars.filter((car) => {
  const brandName = brandMap[car.brand]?.trim().toLowerCase();
  const categoryName = car.category?.trim().toLowerCase();
  const carName = car.name?.trim().toLowerCase();

  return (
    (!selectedBrand || brandName === selectedBrand.trim().toLowerCase()) &&
    (!selectedCategory || categoryName === selectedCategory.trim().toLowerCase()) &&
    (!searchTerm || carName.includes(searchTerm.trim().toLowerCase()))
  );
});


  if (loading) return <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Qent</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#999" style={styles.icon} />
        <TextInput
          placeholder="Search your dream car..."
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Ionicons name="filter" size={20} color="#999" />
      </View>

      <Text style={styles.sectionTitle}>Brands</Text>
      <FlatList
        data={[
          { name: 'Toyota', logo: require('../../../assets/images/Toyota.png') },
          { name: 'Lamborghini', logo: require('../../../assets/images/Lamborghini-Logo.png') },
          { name: 'BMW', logo: require('../../../assets/images/BMW.png') },
          { name: 'Ferrari', logo: require('../../../assets/images/ferrari_PNG10665.png') },
          { name: 'Nissan', logo: require('../../../assets/images/Nissan.png') },
          { name: 'Mercedes', logo: require('../../../assets/images/Mercedes.png') },
          { name: 'Honda', logo: require('../../../assets/images/Honda.png') },
          { name: 'Porsche', logo: require('../../../assets/images/Porsche.png') },
        ]}
        keyExtractor={(item) => item.name}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedBrand(selectedBrand === item.name ? null : item.name);
            }}
            style={styles.brandItem}
          >
            <View
              style={[
                styles.brandCircle,
                selectedBrand === item.name && styles.brandSelected,
              ]}
            >
              <Image source={item.logo} style={styles.brandLogoCircle} />
            </View>
            <Text
              style={[
                styles.brandLabel,
                selectedBrand === item.name && { fontWeight: 'bold', color: '#007AFF' },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      <FlatList
        data={[
          { id: 'sedan', label: 'Sedan' },
          { id: 'suv', label: 'SUV' },
          { id: 'sport', label: 'Sports' },
          { id: 'truck', label: 'Truck' },
        ]}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedCategory(selectedCategory === item.id ? null : item.id);
            }}
            style={[
              styles.categoryItem,
              selectedCategory === item.id && styles.categorySelected,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item.id && { color: '#fff' },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 10 }}
      />

      <View style={styles.row}>
  <Text style={styles.sectionLabel}>Best Cars</Text>
  <TouchableOpacity>
    <Text style={styles.viewAll}>View All</Text>
  </TouchableOpacity>
</View>


      <FlatList
        data={[...filteredCars].sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('CarDetail', { carId: item.id });
            }}
            activeOpacity={0.8}
            style={styles.carCard}
          >
            <Image
              source={
                item.image
                  ? { uri: item.image }
                  : require('../../../assets/images/OIP1.jpg')
              }
              style={styles.carImage}
              resizeMode="cover"
            />

            <Text style={styles.carName}>{item.name}</Text>

            <View style={styles.ratingRow}>
              <Text style={styles.ratingValue}>{item.rating || ''}</Text>
              {item.rating ? (
                <Ionicons name="star" size={14} color="#FFA500" style={{ marginLeft: 4 }} />
              ) : null}
            </View>

            <View style={styles.infoRow}>
              
             <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
  <Ionicons name="location-outline" size={14} color="#888" />
  {item.rental?.trim() || 'Không rõ vị trí'}
</Text>
            </View>

            <View style={styles.bottomInfoRow}>
              <View style={styles.iconText}>
                <Ionicons name="person-outline" size={14} color="#888" />
                <Text style={styles.metaText}>{item.ownerName || ''}</Text>
              </View>
              <View style={styles.iconText}>
                <Ionicons name="call-outline" size={14} color="#888" />
                <Text style={styles.metaText}>{item.phone || ''}</Text>
              </View>
            </View>

            <View style={styles.priceWrapper}>
              <Ionicons name="cash-outline" size={14} color="#888" />
              <Text style={styles.priceText}>
                ${item.price?.toLocaleString() || '0'}/Day
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    <View style={{ marginTop: 0, paddingHorizontal: 20 }}>

        
      </View>
<View style={{ paddingHorizontal: 20 }}>
  {/* Tiêu đề Nearby */}
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  }}>
    <Text style={styles.sectionLabel}>Nearby</Text>
    <TouchableOpacity>
      <Text style={styles.viewAll}>View All</Text>
    </TouchableOpacity>
  </View>

  {/* Danh sách Nearby */}
  <FlatList
    data={nearbyCars}
    horizontal
    keyExtractor={(item) => item.id}
    showsHorizontalScrollIndicator={false}
    snapToInterval={296} // width (280) + margin (16)
    decelerationRate="fast"
    renderItem={({ item }) => (
      <TouchableOpacity
        onPress={() => navigation.navigate('CarDetail', { carId: item.id })}
        style={{
          width: 280,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#fff',
          marginRight: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: 160 }}
          resizeMode="cover"
        />
        <View style={{ padding: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }} numberOfLines={1}>{item.name}</Text>

          <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
           <Ionicons name="location-outline" size={14} color="#888" />
<Text style={{ color: '#666', fontSize: 12 }}>
  {item.rental || 'Không rõ vị trí'}
</Text>

          </Text>

          {item.seats && (
            <Text style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
              <Ionicons name="car-outline" size={14} color="#888" /> {item.seats} chỗ
            </Text>
          )}

          <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
            {Number(item.price).toLocaleString('vi-VN')}₫/ngày
          </Text>
        </View>
      </TouchableOpacity>
    )}
    contentContainerStyle={{
      paddingRight: 20,
      paddingBottom: 20,
    }}
  />
</View>


      
       <View style={styles.promoCard}>
        <Text style={styles.promoTitle}>🎉 Ưu đãi tháng 7</Text>
        <Text style={styles.promoText}>Giảm ngay 10% cho lần thuê đầu tiên!</Text>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: { fontSize: 24, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    position: 'absolute',
    top: -2,
    right: -2,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    margin: 20,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 10,
  },
  icon: { marginRight: 6 },
  input: { flex: 1, height: 40 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginLeft: 20 },

  brandLogoCircle: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    
  },

  categoryItem: {
    marginHorizontal: 10,
    backgroundColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  categorySelected: { backgroundColor: '#007bff' },
  categoryText: { fontSize: 14, color: '#333' },
  row: {
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewAll: { color: '#007bff', fontWeight: '600' },
  carCard: {
    width: 200,
    backgroundColor: '#f4f4f4',
    borderRadius: 12,
    padding: 10,
    margin: 10,
  },
  carImage: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8 },
  carName: { fontSize: 16, fontWeight: '600' },
  rating: { color: '#888', fontSize: 14 },
  location: { color: '#666', marginBottom: 8 },
  detailBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },

  brandItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  brandCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandSelected: {
    borderWidth: 2,
    borderColor: '#007bff',
  },
  brandLabel: {
    fontSize: 12,
    color: '#333',
  },
  promoCard: {
  marginHorizontal: 20,
  marginTop: 30,
  padding: 15,
  backgroundColor: '#e6f7ff',
  borderRadius: 10,
},
promoTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 5,
  color: '#007AFF',
},
promoText: {
  fontSize: 14,
  color: '#333',
},
locationTag: {
  backgroundColor: '#f1f1f1',
  paddingHorizontal: 15,
  paddingVertical: 8,
  borderRadius: 20,
  marginRight: 10,
},
locationText: {
  fontSize: 14,
  color: '#333',
},
reasonContainer: {
  marginTop: 30,
  marginHorizontal: 20,
  marginBottom: 40,
},
reasonList: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},
reasonItem: {
  alignItems: 'center',
  width: '30%',
},
reasonText: {
  marginTop: 5,
  fontSize: 12,
  textAlign: 'center',
},
carMeta: {
  fontSize: 13,
  color: '#666',
},
carPrice: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#000',
},
ownerName: {
  fontSize: 13,
  color: '#333',
  marginTop: 2,
},
phone: {
  fontSize: 13,
  color: '#007AFF',
},
ratingRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 2,
},
ratingValue: {
  fontSize: 13,
  color: '#444',
},
infoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},

bottomInfoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 4,
  marginBottom: 4,
},
iconText: {
  flexDirection: 'row',
  alignItems: 'center',
},
metaText: {
  marginLeft: 4,
  fontSize: 13,
  color: '#555',
},
priceWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 2,
},
priceText: {
  marginLeft: 4,
  fontSize: 13,
  fontWeight: 'bold',
  color: '#000',
},
nearbyCard: {
  width: 300,
  backgroundColor: '#fff',
  borderRadius: 16,
  marginRight: 16,
  marginVertical: 10, // ← thêm dòng này
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
sectionLabel: {
  fontSize: 18,
  fontWeight: '600',
  color: '#222',
  marginBottom: 8,
},


nearbyImage: {
  width: '100%',
  height: 160,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
},

});
