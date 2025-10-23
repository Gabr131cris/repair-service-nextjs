"use client";
import { useState } from "react";
import { Search } from "lucide-react";

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
    price: "",
    sort: "",
  });

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

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-gray-900 text-gray-900 rounded-full p-2 flex flex-wrap justify-center gap-2 md:gap-3 items-center shadow-lg"
    >
      {/* 🔍 Search bar */}
      <div className="flex items-center bg-white rounded-full overflow-hidden px-3 w-full md:w-auto min-w-[250px]">
        <input
          type="text"
          name="query"
          value={filters.query}
          onChange={handleChange}
          placeholder="Search by year, make or model"
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
      <select
        name="year"
        value={filters.year}
        onChange={handleChange}
        className="rounded-full px-4 py-2 bg-white text-sm font-medium text-gray-900 border border-gray-200 hover:border-red-400 focus:ring-2 focus:ring-red-500 outline-none transition"
      >
        <option value="">Year</option>
        <option value="2025">2025+</option>
        <option value="2020">2020+</option>
        <option value="2015">2015+</option>
        <option value="2010">2010+</option>
      </select>

      {/* Make */}
      <select
        name="make"
        value={filters.make}
        onChange={handleChange}
        className="rounded-full px-4 py-2 bg-white text-sm font-medium text-gray-900 border border-gray-200 hover:border-red-400 focus:ring-2 focus:ring-red-500 outline-none transition"
      >
        <option value="">Make</option>
        <option value="Ford">Ford</option>
        <option value="Chevrolet">Chevrolet</option>
        <option value="Dodge">Dodge</option>
        <option value="Cadillac">Cadillac</option>
        <option value="Buick">Buick</option>
      </select>

      {/* Model */}
      <select
        name="model"
        value={filters.model}
        onChange={handleChange}
        className="rounded-full px-4 py-2 bg-white text-sm font-medium text-gray-900 border border-gray-200 hover:border-red-400 focus:ring-2 focus:ring-red-500 outline-none transition"
      >
        <option value="">Model</option>
        <option value="Mustang">Mustang</option>
        <option value="Camaro">Camaro</option>
        <option value="Charger">Charger</option>
        <option value="Corvette">Corvette</option>
      </select>

      {/* Price Range */}
      <select
        name="price"
        value={filters.price}
        onChange={handleChange}
        className="rounded-full px-4 py-2 bg-white text-sm font-medium text-gray-900 border border-gray-200 hover:border-red-400 focus:ring-2 focus:ring-red-500 outline-none transition"
      >
        <option value="">Price Range</option>
        <option value="0-20000">Up to €20,000</option>
        <option value="20000-50000">€20,000 – €50,000</option>
        <option value="50000-100000">€50,000 – €100,000</option>
        <option value="100000+">€100,000+</option>
      </select>

      {/* Sort By */}
      <select
        name="sort"
        value={filters.sort}
        onChange={handleChange}
        className="rounded-full px-4 py-2 bg-white text-sm font-medium text-gray-900 border border-gray-200 hover:border-red-400 focus:ring-2 focus:ring-red-500 outline-none transition"
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
