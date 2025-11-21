"use client";
//sterge dupa
import { useState, useEffect } from "react";

export default function MovePage() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingCar, setMovingCar] = useState<string | null>(null);
  const [log, setLog] = useState<string>("");

  useEffect(() => {
    const loadCars = async () => {
      const res = await fetch("/api/move/list");
      const data = await res.json();
      setCars(data.cars);
      setLoading(false);
    };
    loadCars();
  }, []);

  const moveCar = async (carId: string) => {
    setMovingCar(carId);
    setLog("Moving...");

    const res = await fetch(`/api/move/car?id=${carId}`, { method: "POST" });
    const data = await res.json();

    setLog(JSON.stringify(data, null, 2));
    setMovingCar(null);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Move local → Firebase Storage</h1>

      <p>Selectează o mașină:</p>

      <ul className="mt-4 space-y-2">
        {cars.map((car) => (
          <li key={car.id} className="p-3 border rounded flex justify-between">
            <span>{car.id}</span>

            <button
              onClick={() => moveCar(car.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={movingCar === car.id}
            >
              {movingCar === car.id ? "Moving..." : "Move"}
            </button>
          </li>
        ))}
      </ul>

      {log && (
        <pre className="mt-6 p-4 bg-black text-green-400 rounded">
          {log}
        </pre>
      )}
    </div>
  );
}
