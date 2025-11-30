"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToCompanyForm() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    router.replace(`/dashboard/superadmin/companies/create?id=${params.id}`);
  }, [params.id, router]);

  return null;
}
