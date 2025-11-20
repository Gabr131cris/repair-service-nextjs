"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getCars } from "@/lib/firestore";

export default function CarFiltersSold({
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
          const make = car.make || car.schemaData?.Details?.Make || undefined;

          const model =
            car.model || car.schemaData?.Details?.Model || undefined;

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
      const make = car.make || car.schemaData?.Details?.Make || undefined;

      const model = car.model || car.schemaData?.Details?.Model || undefined;

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
    ></form>
  );
}
