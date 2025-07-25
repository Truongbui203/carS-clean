import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../services/firebase';  

export default function SignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      // 1. Đăng ký tài khoản
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Lưu thông tin vào Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        role: 'user',
        country: country,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Account created !');
      navigation.reset({
  index: 0,
  routes: [{ name: 'UserStack' }],
});

    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>Qent</Text>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        placeholder="Email Address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          style={[styles.input, { paddingRight: 40 }]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Country"
        style={styles.input}
        value={country}
        onChangeText={setCountry}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.primaryText}>{loading ? 'Signing up...' : 'Sign up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={styles.secondaryText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={styles.grayButton}>
        <Text style={styles.grayButtonText}> Apple pay</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.grayButton}>
        <Text style={styles.grayButtonText}>G Google Pay</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Already have an account? <Text style={styles.link}>Login.</Text>
      </Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f3f3f3',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 14,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    color: '#888',
  },
  grayButton: {
    backgroundColor: '#f3f3f3',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  grayButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  link: {
    color: '#007bff',
  },
});
