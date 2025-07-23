import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDJ6gjUKJkP68J7QTiuViJUAQ-S8IQR3R0",
  authDomain: "car1-eebd0.firebaseapp.com",
  projectId: "car1-eebd0",
  storageBucket: "car1-eebd0.appspot.com",
  messagingSenderId: "61526502797",
  appId: "1:61526502797:web:ca29cf96e2b9997c7061c4",
  measurementId: "G-RKB4S9THG9"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Collection phải là 'users' đúng như Firestore của bạn
export async function getUserInfo(uid: string) {
  const ref = doc(db, 'users', uid);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data() : null;
}
