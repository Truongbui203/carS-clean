import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

type Role = 'admin' | 'user' | null;

interface UserContextProps {
  role: Role;
  uid: string | null;
  loading: boolean;
  user: FirebaseUser | null;
}

// Giá trị mặc định ban đầu cho context
const UserContext = createContext<UserContextProps>({
  role: null,
  uid: null,
  loading: true,
  user: null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          const userData = docSnap.exists() ? docSnap.data() : {};
          setRole((userData as any)?.role ?? 'user');
          setUid(currentUser.uid);
          setUser(currentUser);
        } catch (error) {
          console.error('Lỗi khi lấy dữ liệu user từ Firestore:', error);
          setRole(null);
        }
      } else {
        setRole(null);
        setUid(null);
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ role, uid, loading, user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
