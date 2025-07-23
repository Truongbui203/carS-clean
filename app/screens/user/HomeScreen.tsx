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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'cars'));
        const carData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCars(carData);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu xe từ Firestore:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const filteredCars = cars.filter((car) => {
    return (
      (!selectedBrand || car.brand?.toLowerCase() === selectedBrand.toLowerCase()) &&
      (!selectedCategory || car.category?.toLowerCase() === selectedCategory.toLowerCase()) &&
      (!searchTerm || car.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  if (loading) return <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Qent</Text>
        
      </View>

      {/* Search Bar */}
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

      {/* Brands */}
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
              if (selectedBrand === item.name) {
                setSelectedBrand(null);
              } else {
                setSelectedBrand(item.name);
              }
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

      {/* Categories */}
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
              if (selectedCategory === item.id) {
                setSelectedCategory(null);
              } else {
                setSelectedCategory(item.id);
              }
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

      {/* Car List */}
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>Best Cars</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCars}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.carCard}>
            <Image
  source={
    item.image
      ? { uri: item.image }
      : require('../../../assets/images/OIP1.jpg') // dùng ảnh mặc định nếu không có
  }
  style={styles.carImage}
  resizeMode="cover"
/>

            <Text style={styles.carName}>{item.name}</Text>
            <Text style={styles.rating}>⭐ {item.rating || '5.0'}</Text>
            <Text style={styles.location}>
  {item.location && typeof item.location === 'object'
    ? `Lat: ${item.location.latitude}, Lng: ${item.location.longitude}`
    : 'Không rõ vị trí'}
</Text>

            <TouchableOpacity
              style={styles.detailBtn}
              onPress={() => navigation.navigate('CarDetail', { carId: item.id })}
            >
              <Text style={{ color: '#fff' }}>Details</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Ưu đãi đặc biệt */}
      <View style={styles.promoCard}>
        <Text style={styles.promoTitle}>🎉 Ưu đãi tháng 7</Text>
        <Text style={styles.promoText}>Giảm ngay 10% cho lần thuê đầu tiên!</Text>
      </View>

      {/* Top địa điểm */}
      <View style={{ marginHorizontal: 20, marginTop: 30 }}>
        <Text style={styles.sectionTitle}>Top địa điểm</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Bình Dương', 'Cần Thơ'].map((city) => (
            <TouchableOpacity key={city} style={styles.locationTag}>
              <Text style={styles.locationText}>{city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lý do chọn chúng tôi */}
      <View style={styles.reasonContainer}>
        <Text style={styles.sectionTitle}>Tại sao chọn Qent?</Text>
        <View style={styles.reasonList}>
          <View style={styles.reasonItem}>
            <Ionicons name="car-sport" size={24} color="#007AFF" />
            <Text style={styles.reasonText}>100+ xe mới</Text>
          </View>
          <View style={styles.reasonItem}>
            <Ionicons name="time" size={24} color="#007AFF" />
            <Text style={styles.reasonText}>Giao xe đúng giờ</Text>
          </View>
          <View style={styles.reasonItem}>
            <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
            <Text style={styles.reasonText}>Bảo hiểm đầy đủ</Text>
          </View>
        </View>
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
  
  // 👇 Đổi tên lại, không trùng
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

});
