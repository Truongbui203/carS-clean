import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { BarChart } from 'react-native-chart-kit';
import { format, subDays, isSameDay } from 'date-fns';

export default function AdminHomeScreen() {
  const [dailyCounts, setDailyCounts] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const snapshot = await getDocs(collection(db, 'rentals'));
      const now = new Date();
      const last7Days: Date[] = [];

      // Lấy 7 ngày gần nhất
      for (let i = 6; i >= 0; i--) {
        last7Days.push(subDays(now, i));
      }

      // Lấy mảng ngày thuê từ rentDate (kiểu string)
      const rentalDates = snapshot.docs
        .map(doc => {
          const dateStr = doc.data().rentDate;
          try {
            return dateStr ? new Date(dateStr) : null;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as Date[];

      // Đếm số đơn mỗi ngày
      const counts = last7Days.map(day =>
        rentalDates.filter(r => isSameDay(r, day)).length
      );

      setLabels(last7Days.map(d => format(d, 'dd/MM')));
      setDailyCounts(counts);
    };

    fetchOrders();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
  <View style={styles.chartCard}>
    <Text style={styles.chartTitle}>📈 Đơn đặt xe 7 ngày gần nhất</Text>
    <BarChart
      data={{
        labels: labels,
        datasets: [{ data: dailyCounts }],
      }}
      width={Dimensions.get('window').width - 48}
      height={260}
      fromZero
      showValuesOnTopOfBars
      yAxisLabel=""
      yAxisSuffix=" đơn"
      chartConfig={{
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
        barPercentage: 0.5,
        propsForLabels: { fontSize: 13 },
        propsForBackgroundLines: { strokeDasharray: '', stroke: '#e6e6e6' },
      }}
      style={styles.chart}
    />
  </View>
</ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f4f7',
    minHeight: '100%',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3, // Android shadow
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 8,
  },
});
