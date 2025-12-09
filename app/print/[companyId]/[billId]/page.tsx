"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

import Templates from "@/components/print-templates";

export default function PrintBillPage() {
  const { companyId, billId } = useParams();

  const [bill, setBill] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);

  // ⛔ blocare print dublu chiar și în StrictMode
  const hasPrintedRef = useRef(false);

  useEffect(() => {
    // deja printat în această sesiune?
    if (hasPrintedRef.current) return;

    // deja printat în tab?
    if (sessionStorage.getItem("alreadyPrinted") === "1") return;

    const load = async () => {
      const billSnap = await getDoc(
        doc(db, "companyBills", companyId, "bills", billId)
      );
      const billData = billSnap.data();

      const companySnap = await getDoc(doc(db, "companies", companyId));
      const companyData = companySnap.data();

      const schemaSnap = await getDoc(
        doc(db, "companyBillSchemas", companyId)
      );
      const schemaData = schemaSnap.data();

      const pricesSnap = await getDoc(
        doc(db, "companyBillPrices", companyId)
      );
      const pricesData = pricesSnap.data();

      const finalCompany = {
        ...companyData,
        schema: schemaData,
        servicePrices: pricesData?.prices || {},
        selectedTemplate: companyData?.selectedTemplate || "yellow",
      };

      setBill({ ...billData, id: billId });
      setCompany(finalCompany);

      // 🔥 blocare DEFINITIVĂ
      hasPrintedRef.current = true;
      sessionStorage.setItem("alreadyPrinted", "1");

      setTimeout(() => window.print(), 400);
    };

    load();
  }, [companyId, billId]);

  if (!bill || !company) return <p>Loading...</p>;

  const SelectedTemplate =
    Templates[company.selectedTemplate] || Templates.yellow;

  return (
    <div className="print-wrapper">
      <div className="copy-section client-copy">
        <div className="copy-header">COPIA CLIENT</div>
        <SelectedTemplate bill={bill} company={company} copyType="client" />
      </div>

      <div className="page-break"></div>

      <div className="copy-section service-copy">
        <div className="copy-header">COPIA SERVICE</div>
        <SelectedTemplate bill={bill} company={company} copyType="service" />
      </div>
    </div>
  );
}
