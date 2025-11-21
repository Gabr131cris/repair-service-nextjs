"use client";

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

    // reîncarcă lista
    const reload = await fetch("/api/move/list");
    setCars((await reload.json()).cars);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Move local → Firebase Storage</h1>

      <p>Selectează o mașină:</p>

      <ul className="mt-4 space-y-2">
        {cars.map((car) => (
          <li
  key={car.id}
  className="p-3 border rounded flex justify-between items-center"
>
  <div className="flex flex-col">
    <span className="text-gray-500 text-sm">ID: {car.id}</span>
    <span className="font-semibold">{car.name}</span>
    <span className="text-sm text-gray-600">
      Local folder: {car.tempId || "unknown"}
    </span>
  </div>

  <div className="flex items-center gap-4">
    {car.moved ? (
      <span className="text-green-600 font-bold text-xl">✔</span>
    ) : (
      <span className="text-red-600 font-bold text-xl">✗</span>
    )}

    <button
      onClick={() => moveCar(car.id)}
      className="bg-blue-600 text-white px-4 py-2 rounded"
      disabled={movingCar === car.id || car.moved}
    >
      {movingCar === car.id ? "Moving..." : car.moved ? "Moved" : "Move"}
    </button>
  </div>
</li>

        ))}
      </ul>
      

      {log && (
        <pre className="mt-6 p-4 bg-black text-green-400 rounded overflow-x-auto text-sm">
          {log}
        </pre>
      )}
    </div>
  );
}
