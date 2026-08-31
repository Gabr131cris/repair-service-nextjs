"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Loader2, Save } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Templates, { TemplateName } from "@/components/print-templates";
import PageHelpDropdown from "@/components/dashboard/PageHelpDropdown";

const fakeSchema = { sections: [
  { id: "invoice", title: "Numar Factura", type: "custom", fields: [{ id: "number", name: "Numar" }] },
  { id: "client", title: "Detalii Client", type: "custom", fields: [{ id: "name", name: "Nume" }, { id: "phone", name: "Telefon" }, { id: "plate", name: "Număr auto" }] },
  { id: "vehicle", title: "Tip Auto", type: "vehicle_categories", vehicleCategories: [{ id: "car", name: "Autoturism", sizes: ["R17"] }] },
  { id: "services", title: "Servicii", type: "services", services: [{ id: "mount", name: "Demontat / montat anvelopă" }, { id: "balance", name: "Echilibrare roată" }] },
  { id: "details", title: "Detalii Anvelopa", type: "details_values", detailFields: [{ id: "pressure", name: "Presiune" }, { id: "profile", name: "Profil" }] },
] };
const fakeBill = { id: "FAC-00125", createdAt: new Date(), form: { invoice: { number: "FAC-00125" }, client: { name: "Andrei Popescu", phone: "0722 123 456", plate: "SB 01 ABC" }, vehicle: { category: "car", size: "R17" }, services: { mount: 4, balance: 4 }, details: { pressure: "2.4 bar", profile: "6 mm" } } };
const fakeCompany = { name: "Service Auto Exemplu SRL", address: "Str. Atelierului 12, Sibiu", phone: "0750 461 113", cif: "RO12345678", schema: fakeSchema, servicePrices: { car: { R17: { mount: 25, balance: 20 } } } };
const options: Array<{ id: TemplateName; name: string; description: string; color: string }> = [
  { id: "yellow", name: "Galben Clasic", description: "Aspect energic, cu secțiuni evidențiate și structură familiară.", color: "bg-amber-400" },
  { id: "blue", name: "Albastru Profesional", description: "Design aerisit, modern și potrivit pentru comunicarea cu clientul.", color: "bg-blue-600" },
  { id: "black", name: "Negru Minimal", description: "Document sobru, compact și optimizat pentru imprimare alb-negru.", color: "bg-slate-950" },
  { id: "emerald", name: "Verde Emerald", description: "Aspect premium și echilibrat, cu accente elegante și contrast puternic.", color: "bg-emerald-700" },
  { id: "burgundy", name: "Burgundy Executive", description: "Stil rafinat pentru un document distinct și profesional.", color: "bg-rose-900" },
];

export default function BillTemplateSettingsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [selected, setSelected] = useState<TemplateName>("yellow");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getDoc(doc(db, "companySettings", companyId)).then((snap) => {
      const saved = snap.data()?.selectedTemplate;
      if (saved && saved in Templates) setSelected(saved as TemplateName);
    }).finally(() => setLoading(false));
  }, [companyId]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      await setDoc(doc(db, "companySettings", companyId), { selectedTemplate: selected }, { merge: true });
      setMessage("Șablonul a fost salvat și va fi folosit pentru facturile următoare.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  const TemplatePreview = Templates[selected];
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHelpDropdown steps={["Selectează unul dintre cele cinci șabloane disponibile.", "Verifică aspectul în zona de previzualizare.", "Apasă „Salvează alegerea” pentru a-l folosi la facturile următoare."]} note="Previzualizarea folosește date demonstrative; documentele tipărite vor avea datele reale." />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Personalizare documente</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Șablon factură</h1><p className="mt-2 max-w-2xl text-slate-600">Alege aspectul comenzilor de lucru tipărite pentru client și pentru service.</p></div>
        <button onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}{saving ? "Se salvează..." : "Salvează alegerea"}</button>
      </div>
      {message && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div>}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">{options.map((option) => <button key={option.id} type="button" onClick={() => { setSelected(option.id); setMessage(""); }} aria-pressed={selected === option.id} className={`relative rounded-2xl border p-5 text-left transition ${selected === option.id ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"}`}><span className={`mb-4 block h-2 w-14 rounded-full ${option.color}`} />{selected === option.id && <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white"><Check size={17} /></span>}<strong className="block text-lg text-slate-900">{option.name}</strong><span className="mt-2 block text-sm leading-6 text-slate-500">{option.description}</span></button>)}</div>
      <section className="mt-10"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-900">Previzualizare</h2><p className="text-sm text-slate-500">Datele de mai jos sunt demonstrative.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Format A4</span></div><div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-6"><div className="mx-auto min-w-[760px] max-w-[900px] bg-white shadow-xl"><TemplatePreview bill={fakeBill} company={fakeCompany} copyType="client" /></div></div></section>
    </div>
  );
}
