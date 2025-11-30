"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserRole } from "@/lib/auth";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Landmark,
  Loader2,
} from "lucide-react";

export default function CompaniesListPage() {
  const [role, setRole] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const r = await getUserRole();
      setRole(r);

      if (r === "superadmin") {
        const snap = await getDocs(collection(db, "companies"));
        setCompanies(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }

      setLoading(false);
    };

    load();
  }, []);

  const deleteCompany = async (id: string, name: string) => {
    if (!confirm(`Ștergi compania "${name}"?`)) return;

    setDeleteLoading(id);

    try {
      await deleteDoc(doc(db, "companies", id));
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting company:", err);
      alert("Eroare la ștergere!");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500 text-lg">
        Loading companies...
      </p>
    );

  if (role !== "superadmin")
    return (
      <p className="text-center text-red-500 mt-20 text-lg">
        Access denied.
      </p>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Companies</h1>

        <Link
          href="/dashboard/superadmin/companies/create"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg font-medium shadow hover:bg-blue-700 transition"
        >
          + Add Company
        </Link>
      </div>

      <div className="space-y-6">
        {companies.length === 0 ? (
          <p className="text-gray-500 italic text-center">
            Nu există companii în sistem.
          </p>
        ) : (
          companies.map((company) => (
            <div
              key={company.id}
              className="bg-white border shadow-sm rounded-xl p-6 hover:shadow-md transition relative"
            >
              <div className="flex justify-between items-start gap-4">

                {/* LEFT SIDE — INFO */}
                <div className="flex-1 space-y-2">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 size={20} className="text-blue-600" />
                    {company.name}
                  </h2>

                  <div className="text-gray-700 space-y-1 text-sm">

                    {company.legalName && (
                      <p>
                        <span className="font-medium">Legal: </span>
                        {company.legalName}
                      </p>
                    )}

                    {(company.address || company.city || company.county) && (
                      <p className="flex items-center gap-1">
                        <MapPin size={14} /> {company.address}{" "}
                        {company.city ? `, ${company.city}` : ""}{" "}
                        {company.county ? `, ${company.county}` : ""}
                      </p>
                    )}

                    {company.phone && (
                      <p className="flex items-center gap-1">
                        <Phone size={14} /> {company.phone}
                      </p>
                    )}

                    {company.email && (
                      <p className="flex items-center gap-1">
                        <Mail size={14} /> {company.email}
                      </p>
                    )}

                    {company.website && (
                      <p className="flex items-center gap-1">
                        <Globe size={14} /> {company.website}
                      </p>
                    )}

                    {(company.cif || company.iban || company.bankName) && (
                      <p className="flex items-center gap-1">
                        <Landmark size={14} />
                        <span>
                          {company.cif ? `CIF: ${company.cif}` : ""}
                          {company.iban ? ` / IBAN: ${company.iban}` : ""}
                          {company.bankName ? ` / ${company.bankName}` : ""}
                        </span>
                      </p>
                    )}

                    {company.notes && (
                      <p className="text-gray-600 italic border-l-2 pl-2 mt-2">
                        {company.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex flex-col gap-2">

                  {/* USERS */}
                  <Link
                    href={`/dashboard/superadmin/companies/${company.id}/users`}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm"
                  >
                    <Users size={16} /> Users
                  </Link>

                  {/* ADD USER */}
                  <Link
                    href={`/dashboard/superadmin/companies/${company.id}/users?create=1`}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <UserPlus size={16} /> Add User
                  </Link>

                  {/* EDIT */}
                  <Link
                    href={`/dashboard/superadmin/companies/create?id=${company.id}`}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <Pencil size={16} /> Edit
                  </Link>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteCompany(company.id, company.name)}
                    disabled={deleteLoading === company.id}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {deleteLoading === company.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
