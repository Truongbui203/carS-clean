import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { RootStackParamList } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';


type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  return (
   <ImageBackground
  source={require('../../assets/images/bg.png')}
  style={styles.background}
  resizeMode="cover"
>
  {/* Overlay chỉ trên phần trên */}
  <LinearGradient
  colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.2)', 'transparent']}
  style={styles.gradientOverlay}
/>

  {/* Logo */}
  <View style={styles.logoContainer}>
    <View style={styles.logoWrapper}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logoImage}
      />
    </View>
  </View>

  {/* Nội dung */}
  <View style={styles.container}>
    <Text style={styles.title}>Lets Start</Text>
    <Text style={styles.subtitle}>A New Experience</Text>
    <Text style={styles.subtitle}>With Car rental.</Text>

    <TouchableOpacity style={styles.button} onPress={() => navigation.replace('SignIn')}>
      <Text style={styles.buttonText}>Get Started</Text>
    </TouchableOpacity>
  </View>
</ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  logoContainer: {
  position: 'absolute',
  top: 50,
  left: 30,
  zIndex: 10,
},

logoWrapper: {
  width: 60,
  height: 60,
  backgroundColor: '#fff',
  borderRadius: 30,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 5, // hiệu ứng đổ bóng Android
  shadowColor: '#000', // hiệu ứng đổ bóng iOS
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
},

logoImage: {
  width: 32,
  height: 32,
  resizeMode: 'contain',
},
  icon: {
    width: 30,
    height: 30,
    tintColor: '#000',
  },
  container: {
    padding: 30,
  },
  title: {
    color: '#fff',
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '600',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#1a1a1a',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  topOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 500, // chiều cao vùng bạn muốn làm mờ
  backgroundColor: 'rgba(0, 0, 0, 0.84)',
  zIndex: 1},
  gradientOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 500, // tuỳ theo mức phủ bạn muốn
  zIndex: 1,
},
  
});
