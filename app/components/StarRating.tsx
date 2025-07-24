
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  maxStars?: number;
  rating: number;
  onRatingChange: (rating: number) => void;
}

export default function StarRating({
  maxStars = 5,
  rating,
  onRatingChange,
}: StarRatingProps) {
  return (
    <View style={styles.container}>
      {[...Array(maxStars)].map((_, index) => {
        const starIndex = index + 1;
        return (
          <TouchableOpacity
            key={starIndex}
            onPress={() => onRatingChange(starIndex)}
          >
            <Ionicons
              name={starIndex <= rating ? 'star' : 'star-outline'}
              size={32}
              color="#f1c40f"
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
});
