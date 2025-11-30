"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

import Templates from "@/components/print-templates";

export default function PrintBillPage() {
  const { companyId, billId } = useParams();

  const [bill, setBill] = useState<any>(null);
  const [companySettings, setCompanySettings] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const billSnap = await getDoc(
        doc(db, "companyBills", companyId, "bills", billId)
      );

      const settingsSnap = await getDoc(
        doc(db, "companySettings", companyId)
      );

      setBill(billSnap.data());
      setCompanySettings(settingsSnap.data());

      // auto-print
      setTimeout(() => {
        window.print();
      }, 500);
    };

    load();
  }, []);

  if (!bill || !companySettings) return <p>Loading...</p>;

  // select template
  const SelectedTemplate =
  Templates[companySettings.selectedTemplate] || Templates.yellow;


  return <SelectedTemplate bill={bill} company={companySettings} />;
}
