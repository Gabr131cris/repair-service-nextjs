"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// importăm toate template-urile
import Templates from "@/components/print-templates";


export default function BillTemplateSettingsPage() {
  const { companyId } = useParams();
  const [selected, setSelected] = useState("yellow");

  // simulăm date pentru preview
  const fakeBill = {
    number: "12345",
    date: "2025-01-01",
    customer: "Client Test",
    vehicle: "BMW X5",
  };

  const fakeCompany = {
    name: "Service Auto SRL",
    address: "Str. Exemplu 123",
    phone: "0722123123",
  };

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "companySettings", companyId));
      if (snap.exists()) {
        setSelected(snap.data().selectedTemplate || "yellow");
      }
    };

    load();
  }, []);

  const save = async () => {
    await setDoc(
      doc(db, "companySettings", companyId),
      { selectedTemplate: selected },
      { merge: true }
    );

    alert("Template salvat!");
  };

  const TemplatePreview = Templates[selected];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Selectează template pentru facturi
      </h1>

      {/* SELECTOR */}
      <select
        className="border p-2 rounded w-full mb-6"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="yellow">Galben (default)</option>
        <option value="blue">Albastru</option>
        <option value="black">Negru Minimal</option>
      </select>

      <button
        onClick={save}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-10"
      >
        Salvează
      </button>

      {/* PREVIEW */}
      <h2 className="text-xl font-semibold mb-4">Preview</h2>

      <div className="border p-4 rounded shadow bg-white scale-90 origin-top-left">
        <TemplatePreview bill={fakeBill} company={fakeCompany} />
      </div>
    </div>
  );
}
