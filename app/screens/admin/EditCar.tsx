import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { AdminStackParamList } from '../../types/navigation';

type EditCarRouteProp = RouteProp<AdminStackParamList, 'EditCar'>;

export default function EditCarScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditCarRouteProp>();
  const { carId } = route.params;
const [ownerName, setOwnerName] = useState('');

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');

  const fetchCar = async () => {
    try {
      const docRef = doc(db, 'cars', carId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setBrand(data.brand || '');
        setPrice(data.price || '');
        setLocation(data.location || '');
        setPhone(data.phone || '');
        setImage(data.image || '');
        setOwnerName(data.ownerName || '');

      } else {
        Alert.alert('Không tìm thấy xe');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu xe:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    }
  };

  useEffect(() => {
    fetchCar();
  }, []);

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, 'cars', carId), {
        name,
        brand,
        price,
        location,
        phone,
        image,
          ownerName, 
      });

      Alert.alert('Thành công', 'Cập nhật thông tin xe thành công!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật xe');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chỉnh sửa thông tin xe</Text>

      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <Text style={styles.noImage}>Không có hình ảnh</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Tên xe"
        value={name}
        onChangeText={setName}
      />
      <TextInput
  style={styles.input}
  placeholder="Tên chủ xe"
  value={ownerName}
  onChangeText={setOwnerName}
/>

      <TextInput
        style={styles.input}
        placeholder="Hãng xe"
        value={brand}
        onChangeText={setBrand}
      />
      <TextInput
        style={styles.input}
        placeholder="Giá"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Vị trí"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  noImage: {
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
