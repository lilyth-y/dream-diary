import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

export async function addDream(dream: any) {
  return await addDoc(collection(db, 'dreams'), dream);
}

export async function getDreams() {
  const snapshot = await getDocs(collection(db, 'dreams'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
} 