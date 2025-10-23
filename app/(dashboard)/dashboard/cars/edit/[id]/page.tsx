"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import DynamicCarForm from "@/components/forms/CarForm"; // presupunem că ai componenta acolo

export default function EditCarPage() {
  const { id } = useParams();
  const router = useRouter();
  const [carData, setCarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;
      const ref = doc(db, "cars", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setCarData({ id, ...snap.data() });
      }
      setLoading(false);
    };
    fetchCar();
  }, [id]);

  const handleUpdate = async (updatedData: any) => {
    if (!id) return;
    const ref = doc(db, "cars", id as string);
    await updateDoc(ref, {
      schemaData: updatedData,
      updatedAt: new Date().toISOString(),
    });
    alert("✅ Anunț actualizat!");
    router.push("/dashboard/cars");
  };

  if (loading) return <p className="text-center mt-6">Se încarcă...</p>;
  if (!carData) return <p className="text-center text-red-500">Anunțul nu a fost găsit.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Editează anunțul</h1>

      {/* Refolosim formularul existent */}
      <DynamicCarForm initialData={carData.schemaData} onSubmit={handleUpdate} />
    </div>
  );
}
