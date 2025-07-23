import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import CheckBox from 'expo-checkbox';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng trong Firestore.');
        return;
      }

      const userData = userSnapshot.data();
      console.log('🔥 Dữ liệu người dùng:', userData);

      if (userData.role === 'admin') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminStack' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'UserStack' }],
        });
      }
    } catch (error: any) {
      console.log('Firebase error:', error.code);
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không chính xác.');
      } else {
        Alert.alert('Đăng nhập thất bại', error.message);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/logo_black.png')} style={styles.logo} />
      <Text style={styles.title}>Qent</Text>

      <View style={styles.textContainer}>
        <Text style={styles.welcome}>Welcome Back</Text>
        <Text style={styles.welcome}>Ready to hit the road.</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email/Phone Number"
          style={styles.input}
          onChangeText={setEmail}
          value={email}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
      </View>

      <View style={styles.optionRow}>
        <View style={styles.checkboxContainer}>
          <CheckBox value={rememberMe} onValueChange={setRememberMe} style={styles.checkbox} />
          <Text style={styles.checkboxLabel}>Remember Me</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgot}>Forgot Password</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.or}>Or</Text>

      <TouchableOpacity style={styles.appleButton}>
        <Text style={styles.appleText}> Apple Pay</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}




const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 50 : 70,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  textContainer: {
    marginTop: 30,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
  },
  inputContainer: {
    marginTop: 30,
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 6,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  forgot: {
    fontSize: 14,
    color: '#007bff',
  },
  loginButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButton: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '600',
  },
  or: {
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 14,
    color: '#888',
  },
  appleButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  appleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
