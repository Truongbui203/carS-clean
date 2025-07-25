import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Image, Alert, Platform, KeyboardAvoidingView, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { onSnapshot } from 'firebase/firestore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


type BrandItem = {
  label: string;
  value: string;
  categories?: string[];
};

type CategoryItem = {
  label: string;
  value: string;
};

const DEFAULT_LOCATION = {
  latitude: 11.0535,
  longitude: 106.7010,
};


const AddCarScreen = () => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [image, setImage] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [brandOptions, setBrandOptions] = useState<BrandItem[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryItem[]>([]);
  const [openBrand, setOpenBrand] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
const geocodeAddress = async () => {
  if (!address.trim()) {
    Alert.alert('Vui lòng nhập địa chỉ');
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MyCarApp/1.0 (test@example.com)',
      },
    });

    if (!res.ok) {
      console.error('Fetch error:', res.status, res.statusText);
      Alert.alert('Lỗi khi tìm vị trí', `HTTP ${res.status} – ${res.statusText}`);
      return;
    }

    const data = await res.json();
    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      setLocation({ latitude: lat, longitude: lon });
      Alert.alert('✅ Đã xác định vị trí');
    } else {
      Alert.alert('Không tìm thấy địa chỉ');
    }
  } catch (error: any) {
    console.error('Exception khi fetch vị trí:', error);
    Alert.alert('Lỗi khi tìm vị trí', error.message);
  }
};



  useEffect(() => {
    const fetchBrands = async () => {
      const querySnapshot = await getDocs(collection(db, 'brands'));
      const options: BrandItem[] = querySnapshot.docs
        .map((doc): BrandItem | null => {
          const data = doc.data();
          const name = data.name?.trim();
          if (!name) return null;
          return {
            label: name,
            value: doc.id,
            categories: Array.isArray(data.categories) ? data.categories : [],
          };
        })
        .filter((item): item is BrandItem => item !== null);
      setBrandOptions(options);
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (err) {
        Alert.alert('Lỗi định vị', 'Đang dùng vị trí mặc định (TP.TDM)')
        setLocation(DEFAULT_LOCATION);
      }
    })();
  }, []);

  const onBrandChange = (value: string | null) => {
    setBrand(value);
    const selected = brandOptions.find((b) => b.value === value);
    if (selected?.categories?.length) {
      setCategoryOptions(
        selected.categories.map((c) => ({ label: c, value: c }))
      );
    } else {
      setCategoryOptions([]);
    }
    setCategory(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddCar = async () => {
    if (!name || !brand || !price || !location) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin và xác nhận vị trí');
      return;
    }

    try {
 await addDoc(collection(db, 'cars'), {
  name,
  brand,
  category: category || null,
  price: Number(price),
  location: {
    latitude: location.latitude,
    longitude: location.longitude,
  },
  rental: address || null,
  image,
  createdAt: new Date(),
});




      Alert.alert(' Thành công', 'Xe đã được thêm');
      setName('');
      setBrand(null);
      setCategory(null);
      setCategoryOptions([]);
      setPrice('');
      setLocation(DEFAULT_LOCATION);
      setImage(null);
    } catch (error: any) {
      Alert.alert(' Lỗi', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <Text style={styles.title}>➕ Thêm Xe Mới</Text>

        <TextInput
          placeholder="Tên xe"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <View style={{ zIndex: 3000 }}>
          <DropDownPicker
            open={openBrand}
            value={brand}
            items={brandOptions}
            setOpen={setOpenBrand}
            setValue={setBrand}
            setItems={setBrandOptions}
            onChangeValue={onBrandChange}
            placeholder="Chọn hãng xe"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            listMode="MODAL"
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>

        <View style={{ zIndex: 2000 }}>
          <DropDownPicker
            open={openCategory}
            value={category}
            items={categoryOptions}
            setOpen={setOpenCategory}
            setValue={setCategory}
            setItems={setCategoryOptions}
            placeholder="Chọn loại xe (tùy chọn)"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            listMode="SCROLLVIEW"
            zIndex={2000}
            zIndexInverse={1000}
          />
        </View>

        <TextInput
          placeholder="Giá thuê (VD: 1000000)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
  placeholder="Nhập địa chỉ "
  value={address}
  onChangeText={setAddress}
  style={styles.input}
/>

<TouchableOpacity onPress={geocodeAddress} style={styles.button}>
  <Text style={styles.buttonText}> Tìm </Text>
</TouchableOpacity>


        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={(e) => setLocation(e.nativeEvent.coordinate)}
        >
          <Marker
            coordinate={location}
            draggable
            onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
          />
        </MapView>

        <Text style={styles.debugText}>
          1 Vị trí: {location.latitude}, {location.longitude}
        </Text>

        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>Chọn ảnh xe</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAddCar} style={styles.button}>
          <Text style={styles.buttonText}>Lưu Xe</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddCarScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  dropdown: {
    borderColor: '#ccc',
    marginBottom: 16,
  },
  dropdownContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  debugText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
  },
  imagePicker: {
    height: 180,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageText: {
    color: '#888',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
