import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Profile, UserRole } from '@/types/pharmacy';
import { ALLOWED_USERS } from '@/types/auth';

interface User {
  id: string;
  email: string;
  role: UserRole;
  shopName: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function getUserRole(email: string): Promise<UserRole | null> {
  const normalizedEmail = email.toLowerCase();
  
  if (ALLOWED_USERS[normalizedEmail]) {
    return ALLOWED_USERS[normalizedEmail] as UserRole;
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', normalizedEmail));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role as UserRole;
    }
  } catch (error) {
    console.error('Error fetching user role from Firestore:', error);
  }
  
  return null;
}

function getShopName(role: UserRole): string | null {
  if (role === 'shop1') return 'Shop 1';
  if (role === 'shop2') return 'Shop 2';
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        const role = await getUserRole(firebaseUser.email);
        
        if (role) {
          const shopName = getShopName(role);
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            role: role,
            shopName: shopName,
          };
          
          setUser(userData);
          setProfile({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            role: role,
            shop_name: shopName,
            created_at: new Date().toISOString(),
          });
        } else {
          await firebaseSignOut(auth);
          setUser(null);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const normalizedEmail = email.toLowerCase();
      
      if (!ALLOWED_USERS[normalizedEmail]) {
        return { error: new Error('Access denied. This account is not authorized.') };
      }

      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      let message = 'Login failed';
      
      if (firebaseError.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (firebaseError.code === 'auth/wrong-password') {
        message = 'Invalid password. Please try again.';
      } else if (firebaseError.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (firebaseError.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      } else if (firebaseError.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please try again.';
      }
      
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { error: new Error(firebaseError.message || 'Failed to send reset email') };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { error: new Error('No user logged in') };
      }
      await firebaseUpdatePassword(currentUser, password);
      return { error: null };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { error: new Error(firebaseError.message || 'Failed to update password') };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
