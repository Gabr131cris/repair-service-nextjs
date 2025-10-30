"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getCars } from "@/lib/firestore";

export default function CarFilters({
  onFilter,
}: {
  onFilter: (filters: any) => void;
}) {
  const [filters, setFilters] = useState({
    query: "",
    year: "",
    make: "",
    model: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
  });

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /* 🔹 Extrage makes și models automat din Firestore */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cars = await getCars();
        const allMakes = new Set<string>();
        const allModels = new Set<string>();

        cars.forEach((car: any) => {
          // ✅ Am extins toate locurile posibile unde pot fi Make/Model
          const make =
            car.make ||
            car.Make ||
            car.MAKE ||
            car.schemaData?.General?.Make ||
            car.schemaData?.Detalii?.Make || // <-- adăugat
            car.schemaData?.["Specificații"]?.Marcă ||
            car.schemaData?.Make ||
            undefined;

          const model =
            car.model ||
            car.Model ||
            car.MODEL ||
            car.schemaData?.General?.Model ||
            car.schemaData?.Detalii?.Model || // <-- adăugat
            car.schemaData?.["Specificații"]?.Model ||
            car.schemaData?.Model ||
            undefined;

          if (make && typeof make === "string" && make.trim() !== "")
            allMakes.add(make.trim());
          if (model && typeof model === "string" && model.trim() !== "")
            allModels.add(model.trim());
        });

        setMakes(Array.from(allMakes).sort());
        setModels(Array.from(allModels).sort());
      } catch (err) {
        console.error("❌ Eroare la încărcarea filtrelor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* 🔹 Actualizare filtre */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    onFilter(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  /* ---------- UI ---------- */
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-gray-900 text-gray-900 rounded-full p-2 flex flex-wrap justify-center gap-2 md:gap-3 items-center shadow-lg"
    >
      {/* 🔍 Search */}
      <div className="flex items-center bg-white rounded-full overflow-hidden px-3 w-full md:w-auto min-w-[250px]">
        <input
          type="text"
          name="query"
          value={filters.query}
          onChange={handleChange}
          placeholder="Search by make, model or year..."
          className="flex-1 bg-transparent outline-none py-2 px-2 text-sm text-gray-800"
        />
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Year */}
      <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-red-500 transition">
        <select
          name="year"
          value={filters.year}
          onChange={handleChange}
          className="bg-transparent text-sm font-medium text-gray-900 outline-none"
        >
          <option value="">Year</option>
          <option value="2025">2025+</option>
          <option value="2020">2020+</option>
          <option value="2015">2015+</option>
          <option value="2010">2010+</option>
        </select>
        <input
          type="number"
          name="year"
          placeholder="Custom"
          min="1900"
          max="2026"
          value={filters.year}
          onChange={handleChange}
          className="w-16 bg-transparent outline-none text-sm text-gray-700"
        />
      </div>

      {/* Make */}
      <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-red-500 transition">
        <select
          name="make"
          value={filters.make}
          onChange={handleChange}
          className="bg-transparent text-sm font-medium text-gray-900 outline-none"
        >
          <option value="">Make</option>
          {loading ? (
            <option disabled>Loading...</option>
          ) : makes.length > 0 ? (
            makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))
          ) : (
            <option disabled>No makes found</option>
          )}
        </select>
        <input
          type="text"
          name="make"
          placeholder="Custom"
          value={filters.make}
          onChange={handleChange}
          className="w-20 bg-transparent outline-none text-sm text-gray-700"
        />
      </div>

      {/* Model */}
      <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-red-500 transition">
        <select
          name="model"
          value={filters.model}
          onChange={handleChange}
          className="bg-transparent text-sm font-medium text-gray-900 outline-none"
        >
          <option value="">Model</option>
          {loading ? (
            <option disabled>Loading...</option>
          ) : models.length > 0 ? (
            models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))
          ) : (
            <option disabled>No models found</option>
          )}
        </select>
        <input
          type="text"
          name="model"
          placeholder="Custom"
          value={filters.model}
          onChange={handleChange}
          className="w-20 bg-transparent outline-none text-sm text-gray-700"
        />
      </div>

      {/* Price range */}
      <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-red-500 transition">
        <span className="text-xs text-gray-500">$</span>
        <input
          type="number"
          name="minPrice"
          placeholder="Min"
          value={filters.minPrice}
          onChange={handleChange}
          className="w-16 bg-transparent outline-none text-sm text-gray-700"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          name="maxPrice"
          placeholder="Max"
          value={filters.maxPrice}
          onChange={handleChange}
          className="w-16 bg-transparent outline-none text-sm text-gray-700"
        />
      </div>

      {/* Sort */}
      <select
        name="sort"
        value={filters.sort}
        onChange={handleChange}
        className="rounded-full px-4 py-2 bg-white text-sm font-medium text-gray-900 border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition"
      >
        <option value="">Sort By</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="price_low">Price (Low → High)</option>
        <option value="price_high">Price (High → Low)</option>
      </select>
    </form>
  );
}
