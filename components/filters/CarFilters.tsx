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
    yearFrom: "",
    yearTo: "",
    make: "",
    model: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
  });

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
const [carsData, setCarsData] = useState<any[]>([]);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  /* 🔹 Extrage makes și models automat din Firestore */
  useEffect(() => {
  const fetchData = async () => {
    try {
      const cars = await getCars();
      setCarsData(cars); // salvăm toate mașinile

      const allMakes = new Set<string>();
      const allModels = new Set<string>();

      cars.forEach((car: any) => {
        const make =
          car.make ||
          car.schemaData?.General?.Make ||
          car.schemaData?.Detalii?.Make ||
          car.schemaData?.["Specificații"]?.Marcă ||
          undefined;

        const model =
          car.model ||
          car.schemaData?.General?.Model ||
          car.schemaData?.Detalii?.Model ||
          car.schemaData?.["Specificații"]?.Model ||
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

useEffect(() => {
  if (!filters.make) {
    // dacă nu e selectată nicio marcă, afișăm toate modelele
    const allModels = new Set<string>();
    carsData.forEach((car) => {
      const model =
        car.model ||
        car.schemaData?.General?.Model ||
        car.schemaData?.Detalii?.Model ||
        car.schemaData?.["Specificații"]?.Model ||
        undefined;
      if (model && typeof model === "string" && model.trim() !== "")
        allModels.add(model.trim());
    });
    setModels(Array.from(allModels).sort());
    return;
  }

  // altfel, filtrăm doar modelele care au marca selectată
  const filteredModels = new Set<string>();
  carsData.forEach((car) => {
    const make =
      car.make ||
      car.schemaData?.General?.Make ||
      car.schemaData?.Detalii?.Make ||
      car.schemaData?.["Specificații"]?.Marcă ||
      undefined;

    const model =
      car.model ||
      car.schemaData?.General?.Model ||
      car.schemaData?.Detalii?.Model ||
      car.schemaData?.["Specificații"]?.Model ||
      undefined;

    if (
      make &&
      model &&
      typeof make === "string" &&
      typeof model === "string" &&
      make.trim().toLowerCase() === filters.make.trim().toLowerCase()
    ) {
      filteredModels.add(model.trim());
    }
  });

  setModels(Array.from(filteredModels).sort());
}, [filters.make, carsData]);



  /* 🔹 Actualizare filtre */
  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;
  let updated = { ...filters, [name]: value };

  // 🔹 Dacă se schimbă marca, resetăm modelul
  if (name === "make") {
    updated = { ...updated, model: "" };
  }

  setFilters(updated);
  onFilter(updated);
};


  const handleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-gray-900 text-white rounded-full p-3 flex flex-wrap justify-start md:justify-center gap-3 items-center shadow-lg relative"
    >
      {/* 🔍 Search - acum e în stânga */}
      <div className="flex items-center bg-gray-800 rounded-full overflow-hidden px-3 w-full md:w-auto min-w-[300px] order-first ">
        
        

        <input
          type="text"
          name="query"
          value={filters.query}
          onChange={handleChange}
          placeholder="Search by make, model or year..."
          className="flex-1 bg-transparent outline-none py-2 px-2 text-sm text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Year Range */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleDropdown("years")}
          className={`flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 border border-gray-700 text-sm font-medium ${
            openDropdown === "years" ? "ring-2 ring-red-500" : ""
          }`}
        >
          Years
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              openDropdown === "years" ? "rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openDropdown === "years" && (
          <div className="absolute mt-2 bg-gray-900 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 z-30">
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-400 mb-1">From</label>
              <select
                name="yearFrom"
                value={filters.yearFrom || "1900"}
                onChange={handleChange}
                className="bg-gray-800 text-white rounded-lg px-2 py-1 text-sm outline-none"
              >
                {Array.from({ length: 127 }, (_, i) => 1900 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-gray-400 font-semibold">→</span>

            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-400 mb-1">To</label>
              <select
                name="yearTo"
                value={filters.yearTo || "2026"}
                onChange={handleChange}
                className="bg-gray-800 text-white rounded-lg px-2 py-1 text-sm outline-none"
              >
                {Array.from({ length: 127 }, (_, i) => 1900 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Make */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleDropdown("make")}
          className={`flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 border border-gray-700 text-sm font-medium ${
            openDropdown === "make" ? "ring-2 ring-red-500" : ""
          }`}
        >
          Make
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              openDropdown === "make" ? "rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openDropdown === "make" && (
          <div className="absolute mt-2 bg-gray-900 text-white p-4 rounded-xl shadow-lg flex flex-col gap-2 z-30 w-52">
            <select
              name="make"
              value={filters.make}
              onChange={handleChange}
              className="bg-gray-800 text-white rounded-lg px-2 py-1 text-sm outline-none"
            >
              <option value="">All Makes</option>
              {loading ? (
                <option disabled>Loading...</option>
              ) : (
                makes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))
              )}
            </select>
            <input
              type="text"
              name="make"
              placeholder="Custom make..."
              value={filters.make}
              onChange={handleChange}
              className="bg-gray-800 text-white rounded-lg px-2 py-1 text-sm outline-none placeholder-gray-400"
            />
          </div>
        )}
      </div>

      {/* Model */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleDropdown("model")}
          className={`flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 border border-gray-700 text-sm font-medium ${
            openDropdown === "model" ? "ring-2 ring-red-500" : ""
          }`}
        >
          Model
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              openDropdown === "model" ? "rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openDropdown === "model" && (
          <div className="absolute mt-2 bg-gray-900 text-white p-4 rounded-xl shadow-lg flex flex-col gap-2 z-30 w-52">
            <select
              name="model"
              value={filters.model}
              onChange={handleChange}
              className="bg-gray-800 text-white rounded-lg px-2 py-1 text-sm outline-none"
            >
              <option value="">All Models</option>
              {loading ? (
                <option disabled>Loading...</option>
              ) : (
                models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))
              )}
            </select>
            <input
              type="text"
              name="model"
              placeholder="Custom model..."
              value={filters.model}
              onChange={handleChange}
              className="bg-gray-800 text-white rounded-lg px-2 py-1 text-sm outline-none placeholder-gray-400"
            />
          </div>
        )}
      </div>

      {/* Price */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleDropdown("price")}
          className={`flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 border border-gray-700 text-sm font-medium ${
            openDropdown === "price" ? "ring-2 ring-red-500" : ""
          }`}
        >
          Price
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              openDropdown === "price" ? "rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openDropdown === "price" && (
          <div className="absolute mt-2 bg-gray-900 text-white p-4 rounded-xl shadow-lg flex items-center gap-2 z-30">
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              value={filters.minPrice}
              onChange={handleChange}
              className="bg-gray-800 text-white rounded-lg px-2 py-1 w-20 text-sm outline-none placeholder-gray-400"
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={handleChange}
              className="bg-gray-800 text-white rounded-lg px-2 py-1 w-20 text-sm outline-none placeholder-gray-400"
            />
          </div>
        )}
      </div>

      {/* Sort */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleDropdown("sort")}
          className={`flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 border border-gray-700 text-sm font-medium ${
            openDropdown === "sort" ? "ring-2 ring-red-500" : ""
          }`}
        >
          Sort
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              openDropdown === "sort" ? "rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openDropdown === "sort" && (
          <div className="absolute mt-2 bg-gray-900 text-white p-4 rounded-xl shadow-lg flex flex-col gap-2 z-30 w-52">
            <select
              name="sort"
              value={filters.sort}
              onChange={handleChange}
              className="bg-gray-800 text-white rounded-lg px-2 py-1 text-sm outline-none"
            >
              <option value="">Default</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_low">Price (Low → High)</option>
              <option value="price_high">Price (High → Low)</option>
            </select>
          </div>
        )}
      </div>
    </form>
  );
}
