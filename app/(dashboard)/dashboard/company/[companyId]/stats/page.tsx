"use client";

import { useEffect, useState } from "react";
import { getUserRole } from "@/lib/auth";
import { useParams } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Helper - convert Firestore date
const formatDate = (ts: Timestamp) => {
  try {
    return ts.toDate().toLocaleString("ro-RO");
  } catch (e) {
    return "-";
  }
};

export default function StatsPage() {
  const { companyId } = useParams();

  const [bills, setBills] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [employees, setEmployees] = useState<string[]>([]);

  const [filterType, setFilterType] = useState("day");
  const [filterDate, setFilterDate] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("all");

  const [userRole, setUserRole] = useState("company_admin");
  const [search, setSearch] = useState("");

  /* =====================================================
      LOAD ALL BILLS + EMPLOYEES
  ===================================================== */
  const loadData = async () => {
    const billsRef = collection(db, "companyBills", companyId as string, "bills");

    const q = query(billsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const items = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setBills(items);

    // Extract employees (creators)
    const setEmpl = new Set<string>();
    items.forEach((b) => {
      if (b.createdBy) setEmpl.add(b.createdBy);
    });
    setEmployees(Array.from(setEmpl));

    setFiltered(items);
  };

  useEffect(() => {
  (async () => {
    const role = await getUserRole();
    setUserRole(role);
  })();
}, []);

  useEffect(() => {
    loadData();
  }, []);

  /* =====================================================
      FILTER LOGIC
  ===================================================== */
  useEffect(() => {
  let list = [...bills];

  /* ------------------------------
     FILTRARE DUPĂ DATĂ
  ------------------------------ */
  if (filterDate) {
    const selected = new Date(filterDate);

    list = list.filter((bill) => {
      const date = bill.createdAt?.toDate();
      if (!date) return false;

      switch (filterType) {
        case "day":
          return (
            date.getDate() === selected.getDate() &&
            date.getMonth() === selected.getMonth() &&
            date.getFullYear() === selected.getFullYear()
          );
        case "month":
          return (
            date.getMonth() === selected.getMonth() &&
            date.getFullYear() === selected.getFullYear()
          );
        case "year":
          return date.getFullYear() === selected.getFullYear();
        case "week": {
          const first = selected;
          const weekStart = new Date(first);
          weekStart.setDate(first.getDate() - first.getDay() + 1);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return date >= weekStart && date <= weekEnd;
        }
      }

      return true;
    });
  }

  /* ------------------------------
     FILTRARE ANGAJAT
  ------------------------------ */
  if (employeeFilter !== "all") {
    list = list.filter((b) => b.createdBy === employeeFilter);
  }

  /* ------------------------------
     FILTRARE TEXT (client + număr)
  ------------------------------ */
  /* ------------------------------
   FILTRARE TEXT UNIVERSALĂ
   (client, auto, număr înmatriculare)
------------------------------ */
if (search.trim() !== "") {
  const s = search.toLowerCase();

  list = list.filter((bill) => {
    const form = bill.form || {};
    let found = false;

    Object.values(form).forEach((section: any) => {
      if (typeof section !== "object") return;

      Object.values(section).forEach((value: any) => {
        if (!value) return;

        const val = String(value).toLowerCase();

        // 💥 MATCH DUPĂ VALOARE
        if (val.includes(s)) found = true;

        // 💥 MATCH SPECIAL PENTRU NUMĂR DE ÎNMATRICULARE
        // detectează combinații litere+cifre
        if (/^[a-z0-9]{2,10}$/i.test(val) && val.includes(s)) {
          found = true;
        }
      });
    });

    return found;
  });
}


  setFiltered(list);
}, [filterDate, filterType, employeeFilter, bills, search]);


  /* =====================================================
      DELETE BILL
  ===================================================== */
  const deleteBill = async (id: string) => {
    if (!confirm("Sigur ștergi factura?")) return;

    await deleteDoc(doc(db, "companyBills", companyId as string, "bills", id));

    setBills(bills.filter((b) => b.id !== id));
    setFiltered(filtered.filter((b) => b.id !== id));
  };

  /* =====================================================
      CALCUL TOTAL
  ===================================================== */
  const totalRevenue = filtered.reduce(
    (sum, b) => sum + (b.form?.calculatedTotal || 0),
    0
  );

  /* =====================================================
      UI
  ===================================================== */
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Statistici încasări</h1>

      {/* FILTERS */}
      <div className="grid md:grid-cols-4 grid-cols-1 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Tip filtru</label>
          <select
            className="border p-2 rounded w-full"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="day">Zi</option>
            <option value="week">Săptămână</option>
            <option value="month">Lună</option>
            <option value="year">An</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Selectează data</label>
          <input
            type="date"
            className="border p-2 rounded w-full"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Filtru angajat</label>
          <select
            className="border p-2 rounded w-full"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="all">Toți</option>
            {employees.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div>
  <label className="block font-medium mb-1">Căutare</label>
  <input
    type="text"
    placeholder="Caută după nume client, număr înmatriculare..."
    className="border p-2 rounded w-full"
    value={search}
    onChange={(e) => setSearch(e.target.value.toLowerCase())}
  />
</div>

        <div className="flex flex-col justify-end">
          <div className="text-lg font-bold">
            Total:{" "}
            <span className="text-green-600">{totalRevenue.toFixed(2)} lei</span>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 text-left">Factura</th>
              <th className="p-3 text-left">Creată la</th>
              <th className="p-3 text-left">Creată de</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-center">Actiuni</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((bill) => (
              <tr key={bill.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <a
                    href={`/print/${companyId}/${bill.id}`}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    Deschide factură
                  </a>
                </td>

                <td className="p-3">{formatDate(bill.createdAt)}</td>

                <td className="p-3">{bill.createdBy || "-"}</td>

                <td className="p-3 text-right font-semibold">
                  {(bill.form?.calculatedTotal || 0).toFixed(2)} lei
                </td>

                <td className="p-3 text-center">
                  {userRole === "company_admin" && (
                    <button
                      onClick={() => deleteBill(bill.id)}
                      className="text-red-600 hover:underline"
                    >
                      Șterge
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
                  Nicio factură găsită.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
