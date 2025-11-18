"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { ArrowRight, Loader2 } from "lucide-react";

export default function SchemaMigratorPage() {
  const [newSchema, setNewSchema] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [changes, setChanges] = useState<any>({});
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);

  // ===========================
  // LOAD NEW SCHEMA + CARS
  // ===========================
  useEffect(() => {
    const loadData = async () => {
      const schemaSnap = await getDocs(collection(db, "car_schemas"));
      const schema = schemaSnap.docs
        .map((d) => d.data())
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const carSnap = await getDocs(collection(db, "cars"));
      const allCars = carSnap.docs.map((d) => ({
        id: d.id,
        schemaData: d.data().schemaData ?? {},
      }));

      setNewSchema(schema);
      setCars(allCars);

      // compute differences
      const diff = computeDifferences(allCars, schema);
      setChanges(diff);

      setLoading(false);
    };

    loadData();
  }, []);

  // ===========================
  // DETECT CHANGES AUTOMATICALLY
  // ===========================
  const computeDifferences = (cars: any[], schema: any[]) => {
    const result: any = {};

    const newSections = schema.map((s) => s.title);
    const fieldToSection: any = {};

    schema.forEach((s) => {
      s.fields.forEach((f: any) => {
        fieldToSection[f.name] = s.title;
      });
    });

    cars.forEach((car) => {
      const carMoves = [];

      Object.entries(car.schemaData).forEach(([oldSection, fields]: any) => {
        if (!newSections.includes(oldSection)) {
          Object.entries(fields).forEach(([fieldName, value]) => {
            const newLocation = fieldToSection[fieldName];

            if (newLocation) {
              carMoves.push({
                field: fieldName,
                from: oldSection,
                to: newLocation,
                value,
                checked: true,
              });
            }
          });
        }
      });

      result[car.id] = carMoves;
    });

    return result;
  };

  // ===========================
  // MIGRATE ONE CAR
  // ===========================
  const migrateOneCar = async (carId: string) => {
    const car = cars.find((c) => c.id === carId);
    const carMoves = changes[carId];

    let updated = { ...car.schemaData };

    carMoves.forEach((m: any) => {
      if (!m.checked) return;

      if (!updated[m.to]) updated[m.to] = {};
      updated[m.to][m.field] = m.value;

      if (updated[m.from]) delete updated[m.from][m.field];
    });

    await updateDoc(doc(db, "cars", carId), {
      schemaData: updated,
    });

    alert("Car migrated!");
  };

  // ===========================
  // MIGRATE ALL CARS
  // ===========================
  const migrateAll = async () => {
    setMigrating(true);

    const batch = writeBatch(db);

    cars.forEach((car) => {
      const carMoves = changes[car.id];
      let updated = { ...car.schemaData };

      carMoves.forEach((m: any) => {
        if (!m.checked) return;

        if (!updated[m.to]) updated[m.to] = {};
        updated[m.to][m.field] = m.value;

        if (updated[m.from]) delete updated[m.from][m.field];
      });

      batch.update(doc(db, "cars", car.id), {
        schemaData: updated,
      });
    });

    await batch.commit();
    setMigrating(false);
    alert("All cars migrated!");
  };

  if (loading)
    return (
      <div className="text-center p-10">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    );

  const selectedCar = cars.find((c) => c.id === selectedCarId);
  const selectedMoves = changes[selectedCarId] || [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Schema Migrator</h1>

      {/* GLOBAL MIGRATION BUTTON */}
      <button
        disabled={migrating}
        onClick={migrateAll}
        className="mb-10 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {migrating ? (
          <Loader2 className="w-4 h-4 animate-spin inline" />
        ) : (
          "Migrate ALL cars automatically"
        )}
      </button>


      {/* SELECT CAR */}
      <div className="mb-6">
        <label className="font-semibold block mb-2">Select car</label>
        <select
          value={selectedCarId}
          onChange={(e) => setSelectedCarId(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">Select a car...</option>

          {cars.map((car) => (
            <option key={car.id} value={car.id}>
              {car.id}
            </option>
          ))}
        </select>
      </div>

      {/* IF NO CAR SELECTED */}
      {!selectedCarId && (
        <p className="text-gray-500">Select a car to begin migration.</p>
      )}

      {/* CAR MIGRATION UI */}
      {selectedCar && (
        <div className="border p-5 rounded-lg bg-gray-50 shadow mt-4">
          <h2 className="font-bold text-xl mb-4">Car: {selectedCar.id}</h2>

          {selectedMoves.length === 0 ? (
            <p className="text-green-700">No fields to migrate</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6 mb-4">
                {/* OLD DATA */}
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">
                    OLD STRUCTURE (from database)
                  </h3>
                  <div className="bg-white p-3 rounded border text-sm">
                    {Object.entries(selectedCar.schemaData).map(
                      ([sec, fields]: any) => (
                        <div key={sec} className="mb-2">
                          <b>{sec}</b>
                          <ul className="ml-4 list-disc">
                            {Object.entries(fields).map(([k, v]) => (
                              <li key={k}>
                                {k}: <b>{String(v)}</b>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* NEW DATA */}
                <div>
                  <h3 className="font-semibold mb-2 text-green-600">
                    NEW SCHEMA STRUCTURE
                  </h3>
                  <div className="bg-white p-3 rounded border text-sm">
                    {newSchema.map((sec) => (
                      <div key={sec.title} className="mb-2">
                        <b>{sec.title}</b>
                        <ul className="ml-4 list-disc">
                          {sec.fields.map((f: any) => (
                            <li key={f.name}>{f.name}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MOVES */}
              <h3 className="font-semibold mb-2">Detected Moves</h3>

              {selectedMoves.map((m: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white p-3 border rounded mb-2"
                >
                  <input
                    type="checkbox"
                    checked={m.checked}
                    onChange={(e) => {
                      m.checked = e.target.checked;
                      setChanges({ ...changes });
                    }}
                  />

                  <span className="font-medium">{m.field}</span>

                  <span className="px-2 py-1 bg-red-200 rounded text-sm">
                    {m.from}
                  </span>

                  <ArrowRight size={16} />

                  <span className="px-2 py-1 bg-green-200 rounded text-sm">
                    {m.to}
                  </span>

                  <span className="ml-auto text-sm">
                    Value: <b>{String(m.value)}</b>
                  </span>
                </div>
              ))}

              <button
                onClick={() => migrateOneCar(selectedCar.id)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Migrate selected fields for this car
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
