"use client";

import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CompanyFormPage() {
  const router = useRouter();
  const params = useSearchParams();

  // Dacă există ID → suntem în modul EDIT
  const companyId = params.get("id");
  const isEdit = Boolean(companyId);

  const [loading, setLoading] = useState(isEdit); // doar dacă edităm
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    legalName: "",
    address: "",
    city: "",
    county: "",
    phone: "",
    email: "",
    cif: "",
    iban: "",
    bankName: "",
    representative: "",
    website: "",
    notes: "",
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------------------------------------------------
        LOAD COMPANY DATA IF EDIT MODE
     --------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      if (!companyId) return;

      const ref = doc(db, "companies", companyId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Compania nu există!");
        router.push("/dashboard/superadmin/companies");
        return;
      }

      const data = snap.data();

      setForm({
        name: data.name || "",
        legalName: data.legalName || "",
        address: data.address || "",
        city: data.city || "",
        county: data.county || "",
        phone: data.phone || "",
        email: data.email || "",
        cif: data.cif || "",
        iban: data.iban || "",
        bankName: data.bankName || "",
        representative: data.representative || "",
        website: data.website || "",
        notes: data.notes || "",
      });

      setLoading(false);
    };

    load();
  }, [companyId, router]);

  /* ---------------------------------------------------
        SAVE COMPANY (Create OR Edit)
     --------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Numele companiei este obligatoriu.");
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        // UPDATE EXISTING COMPANY
        await updateDoc(doc(db, "companies", companyId as string), {
          ...form,
        });

        alert("Compania a fost actualizată!");
      } else {
        // CREATE NEW COMPANY
        await addDoc(collection(db, "companies"), {
          ...form,
          createdAt: serverTimestamp(),
        });
      }

      router.push("/dashboard/superadmin/companies");
    } catch (err) {
      console.error("Error saving company:", err);
      alert("Eroare la salvare, încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-500">
        Se încarcă datele companiei...
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        {isEdit ? "✏️ Editează Compania" : "🏢 Adaugă Companie"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* SECȚIUNEA 1 - DATE GENERALE */}
        <Section title="Date Generale">
          <Input
            label="Nume Companie *"
            value={form.name}
            onChange={(v) => updateField("name", v)}
            placeholder="Ex: Vulcanizare XXL"
            required
          />

          <Input
            label="Denumire Legală (SRL)"
            value={form.legalName}
            onChange={(v) => updateField("legalName", v)}
            placeholder="Ex: XXL AUTOSERVICE SRL"
          />

          <Input
            label="Reprezentant"
            value={form.representative}
            onChange={(v) => updateField("representative", v)}
            placeholder="Ex: Ion Popescu"
          />
        </Section>

        {/* SECȚIUNEA 2 - ADRESĂ */}
        <Section title="Adresă">
          <Input
            label="Adresă"
            value={form.address}
            onChange={(v) => updateField("address", v)}
            placeholder="Ex: Str. Exemplu 12"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Oraș"
              value={form.city}
              onChange={(v) => updateField("city", v)}
              placeholder="Ex: București"
            />

            <Input
              label="Județ"
              value={form.county}
              onChange={(v) => updateField("county", v)}
              placeholder="Ex: Ilfov"
            />
          </div>
        </Section>

        {/* SECȚIUNEA 3 - CONTACT */}
        <Section title="Contact">
          <Input
            label="Telefon"
            value={form.phone}
            onChange={(v) => updateField("phone", v)}
            placeholder="Ex: 0722 123 456"
          />

          <Input
            label="Email"
            value={form.email}
            onChange={(v) => updateField("email", v)}
            placeholder="Ex: contact@firma.ro"
            type="email"
          />

          <Input
            label="Website"
            value={form.website}
            onChange={(v) => updateField("website", v)}
            placeholder="Ex: https://firma.ro"
          />
        </Section>

        {/* SECȚIUNEA 4 - DATE FISCALE */}
        <Section title="Date Fiscale">
          <Input
            label="CIF / CUI"
            value={form.cif}
            onChange={(v) => updateField("cif", v)}
            placeholder="Ex: RO12345678"
          />

          <Input
            label="IBAN"
            value={form.iban}
            onChange={(v) => updateField("iban", v)}
            placeholder="Ex: RO49AAAA1B31007593840000"
          />

          <Input
            label="Banca"
            value={form.bankName}
            onChange={(v) => updateField("bankName", v)}
            placeholder="Ex: BCR"
          />
        </Section>

        {/* SECȚIUNEA 5 - NOTIȚE */}
        <Section title="Notițe interne">
          <Textarea
            value={form.notes}
            onChange={(v) => updateField("notes", v)}
            placeholder="Note interne opționale..."
          />
        </Section>

        {/* SAVE BUTTON */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg flex justify-center items-center gap-2 hover:bg-blue-700 transition"
        >
          {saving && <Loader2 className="animate-spin" size={20} />}
          {isEdit ? "Salvează Modificările" : "Creează Compania"}
        </button>
      </form>
    </div>
  );
}

/* ---------------------------------------------------
      SMALL UI COMPONENTS FOR CLEAN CODE
--------------------------------------------------- */

function Section({ title, children }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow border space-y-4">
      <h2 className="font-semibold text-lg mb-2 text-gray-700">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, required, type = "text" }: any) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function Textarea({ value, onChange, placeholder }: any) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
      placeholder={placeholder}
    ></textarea>
  );
}
