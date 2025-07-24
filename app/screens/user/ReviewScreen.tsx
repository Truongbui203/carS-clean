import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import StarRating from '../../components/StarRating'; // ✅ Import đúng component bạn đang dùng

export default function ReviewScreen() {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0); // ✅ đảm bảo luôn là số
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { carId, carName } = route.params || {};
  const userId = getAuth().currentUser?.uid;

  const handleSubmit = async () => {
    if (!rating) return Alert.alert('Vui lòng chọn số sao');
    if (!userId || !carId) return Alert.alert('Thiếu thông tin người dùng hoặc xe');

    try {
      await addDoc(collection(db, 'reviews'), {
        userId,
        carId,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });
      Alert.alert('Đánh giá thành công!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Lỗi khi gửi đánh giá', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đánh giá xe "{carName || ''}"</Text>

      <StarRating
        rating={rating}
        onRatingChange={(value) => {
          if (typeof value === 'number') setRating(value);
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập bình luận của bạn"
        multiline
        numberOfLines={4}
        value={comment}
        onChangeText={setComment}
      />

      <Button title="GỬI ĐÁNH GIÁ" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 16,
    borderRadius: 8,
    textAlignVertical: 'top',
  },
});
