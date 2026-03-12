import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase'; // Ensure this path correctly points to your firebase config file

type ShopId = string;

// Helper to convert Firestore snapshots to arrays
const mapSnapshot = (snapshot: any) => {
  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
    // Convert Firestore timestamps to ISO strings for your frontend logic
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  }));
};

export const api = {
  shops: {
    list: async () => {
      const querySnapshot = await getDocs(collection(db, 'shops'));
      return mapSnapshot(querySnapshot);
    },
  },
  
  stock: {
    list: async () => {
      const querySnapshot = await getDocs(collection(db, 'stock'));
      return mapSnapshot(querySnapshot);
    },
    byShop: async (shopId: ShopId) => {
      const q = query(collection(db, 'stock'), where('shopId', '==', String(shopId)));
      const querySnapshot = await getDocs(q);
      return mapSnapshot(querySnapshot);
    },
    create: async (shopId: ShopId, data: any) => {
      const docRef = await addDoc(collection(db, 'stock'), {
        ...data,
        shopId: String(shopId),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    },
    update: async (id: string, data: any) => {
      const docRef = doc(db, 'stock', String(id));
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
    delete: async (id: string) => {
      await deleteDoc(doc(db, 'stock', String(id)));
    },
  },
  
  sales: {
    list: async () => {
      const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return mapSnapshot(querySnapshot);
    },
    byShop: async (shopId: ShopId) => {
      const q = query(
        collection(db, 'sales'), 
        where('shopId', '==', String(shopId)),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return mapSnapshot(querySnapshot);
    },
    create: async (shopId: ShopId, data: any) => {
      await addDoc(collection(db, 'sales'), {
        ...data,
        shopId: String(shopId),
        createdAt: serverTimestamp(),
      });
    },
  },
  
  restockHistory: {
    byShop: async (shopId: ShopId) => {
      const q = query(
        collection(db, 'restock_history'), 
        where('shopId', '==', String(shopId)),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return mapSnapshot(querySnapshot);
    },
    create: async (shopId: ShopId, data: any) => {
      await addDoc(collection(db, 'restock_history'), {
        ...data,
        shopId: String(shopId),
        createdAt: serverTimestamp(),
      });
    },
  },
  
  stockRemovalHistory: {
    byShop: async (shopId: ShopId) => {
      const q = query(
        collection(db, 'stock_removal_history'), 
        where('shopId', '==', String(shopId)),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return mapSnapshot(querySnapshot);
    },
    create: async (shopId: ShopId, data: any) => {
      await addDoc(collection(db, 'stock_removal_history'), {
        ...data,
        shopId: String(shopId),
        createdAt: serverTimestamp(),
      });
    },
  },
};
