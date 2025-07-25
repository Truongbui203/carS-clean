import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Image, Alert, Platform, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

type BrandItem = {
  label: string;
  value: string;
  categories?: string[];
};

const AddCarScreen = () => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState({ latitude: 10.762622, longitude: 106.660172 });
  const [image, setImage] = useState<string | null>(null);

  const [brandOptions, setBrandOptions] = useState<BrandItem[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]); // Cập nhật kiểu category
  const [openBrand, setOpenBrand] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      const querySnapshot = await getDocs(collection(db, 'brands'));
      const options: BrandItem[] = querySnapshot.docs.map((doc) => ({
        label: doc.data().name,
        value: doc.id,
        categories: doc.data().categories || [],
      }));
      setBrandOptions(options);
    };
    fetchBrands();
  }, []);

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
        location,
        image,
        createdAt: new Date(),
      });

      Alert.alert('✅ Thành công', 'Xe đã được thêm');
      setName('');
      setBrand(null);
      setCategory(null);
      setCategoryOptions([]);
      setPrice('');
      setLocation({ latitude: 10.762622, longitude: 106.660172 });
      setImage(null);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true} // Đảm bảo khả năng cuộn khi có nhiều nội dung
    >
      <TouchableOpacity onPress={handleAddCar} style={styles.button}>
        <Text style={styles.buttonText}>Lưu Xe</Text>
      </TouchableOpacity>
      
      <TextInput
        placeholder="Tên xe"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      {/* Dropdown cho hãng xe */}
      <DropDownPicker
        open={openBrand}
        value={brand}
        items={brandOptions}
        setOpen={setOpenBrand}
        setValue={setBrand}
        setItems={setBrandOptions}
        onChangeValue={(value) => {
          setBrand(value);
          const selectedBrand = brandOptions.find((item) => item.value === value);
          setCategoryOptions(selectedBrand?.categories || []);
          setCategory(null);
        }}
        placeholder="Chọn hãng xe"
        style={styles.dropdown}
      />

      {/* Dropdown cho loại xe */}
      <DropDownPicker
        open={openCategory}
        value={category}
        items={categoryOptions.map((cat) => ({ label: cat, value: cat }))}
        setOpen={setOpenCategory}
        setValue={setCategory}
        setItems={setCategoryOptions}
        placeholder="Chọn loại xe"
        style={styles.dropdown}
      />

      <TextInput
        placeholder="Giá thuê"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />

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
        <Marker coordinate={location} draggable onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)} />
      </MapView>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Chọn ảnh xe</Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
};

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
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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

export default AddCarScreen;
