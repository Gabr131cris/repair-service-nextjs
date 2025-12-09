"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToCompanyEdit() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (!params.companyId) return;

    router.replace(`/dashboard/superadmin/companies/${params.companyId}/edit`);
  }, [params.companyId, router]);

  return null;
}
