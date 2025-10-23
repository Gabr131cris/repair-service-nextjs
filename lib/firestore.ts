// lib/firestore.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { Car } from "./types";

// 🔹 Adaugă o mașină nouă
export async function addCar(car: Car) {
  const carsRef = collection(db, "cars");
  const docRef = await addDoc(carsRef, {
    ...car,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// 🔹 Obține toate mașinile (ordonate descrescător după data adăugării)
export async function getCars(): Promise<Car[]> {
  const q = query(collection(db, "cars"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  const cars = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      schemaData: data.schemaData || {}, // 🔸 fallback sigur
      images: data.images || {},         // 🔸 compatibilitate format vechi
      status: data.status || "pending",  // 🔸 status implicit
      ownerId: data.ownerId || "",       // 🔸 fallback user
      createdAt: data.createdAt || null, // 🔸 data sigură
    } as Car;
  });

  return cars;
}

// 🔹 Obține o mașină după ID
export async function getCarById(id: string): Promise<Car | null> {
  const docRef = doc(db, "cars", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    schemaData: data.schemaData || {},
    images: data.images || {},
    status: data.status || "pending",
    ownerId: data.ownerId || "",
    createdAt: data.createdAt || null,
  } as Car;
}

// 🔹 Actualizează o mașină
export async function updateCar(id: string, data: Partial<Car>) {
  const docRef = doc(db, "cars", id);
  await updateDoc(docRef, data);
}

// 🔹 Șterge o mașină
export async function deleteCar(id: string) {
  const docRef = doc(db, "cars", id);
  await deleteDoc(docRef);
}
