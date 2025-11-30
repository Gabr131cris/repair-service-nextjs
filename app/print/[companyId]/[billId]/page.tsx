"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

import Templates from "@/components/print-templates";

export default function PrintBillPage() {
  const { companyId, billId } = useParams();

  const [bill, setBill] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      /* 1. LOAD BILL CORECT */
      const billRef = doc(db, "companyBills", companyId, "bills", billId);
      const billSnap = await getDoc(billRef);
      const billData = billSnap.data();

      /* 2. COMPANY */
      const companySnap = await getDoc(doc(db, "companies", companyId));
      const companyData = companySnap.data();

      /* 3. SCHEMA */
      const schemaSnap = await getDoc(
        doc(db, "companyBillSchemas", companyId)
      );
      const schemaData = schemaSnap.data();

      /* 4. PRICES */
      const pricesSnap = await getDoc(
        doc(db, "companyBillPrices", companyId)
      );
      const pricesData = pricesSnap.data();

      /* BUILD OBJECT */
      const finalCompany = {
        ...companyData,
        schema: schemaData,       // schema corectă
        servicePrices: pricesData?.prices || {},
        selectedTemplate: companyData?.selectedTemplate || "yellow",
      };

      setBill({ ...billData, id: billId });
      setCompany(finalCompany);

      setTimeout(() => window.print(), 500);
    };

    load();
  }, []);

  if (!bill || !company) return <p>Loading...</p>;

  const SelectedTemplate =
    Templates[company.selectedTemplate] || Templates.yellow;

  return <SelectedTemplate bill={bill} company={company} />;
}
