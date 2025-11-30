"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  Users,
  BarChart2,
  CheckCircle,
  LogOut,
  Search,
  ListOrdered,
  BadgeInfo,
  Building,
  Factory,
} from "lucide-react";

import { logoutUser, getUserRole } from "@/lib/auth";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  /* ---------------------------------------------------------
     Load USER ROLE + companyId (for company_admin only)
  ---------------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      const r = await getUserRole();
      setRole(r);

      // Dacă userul e admin de companie — îi găsim companyId
      if (r === "company_admin") {
        const auth = await getFirebaseAuth();
        const db = getDb();
        const user = auth.currentUser;

        if (user) {
          const snap = await getDoc(doc(db, "companyUsers", user.uid));
          if (snap.exists()) {
            setCompanyId(snap.data().companyId);
          }
        }
      }
    };

    load();
  }, []);

  /* ---------------------------------------------------------
     LOGOUT
  ---------------------------------------------------------- */
  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/login");
  };

  /* ---------------------------------------------------------
     BASE LINKS
  ---------------------------------------------------------- */
  const baseLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
  ];

  /* ---------------------------------------------------------
     PLATFORM ADMIN LINKS
  ---------------------------------------------------------- */
  const adminLinks =
    role === "admin" || role === "superadmin"
      ? [
          {
            href: "/dashboard/admin/cars",
            label: "Approve Cars",
            icon: <CheckCircle size={18} />,
          },
          {
            href: "/dashboard/admin/users",
            label: "Users",
            icon: <Users size={18} />,
          },
        ]
      : [];

  /* ---------------------------------------------------------
     SUPER ADMIN LINKS
  ---------------------------------------------------------- */
  const superLinks =
    role === "superadmin"
      ? [
          {
            href: "/dashboard/cars",
            label: "My Cars",
            icon: <Car size={18} />,
          },
          {
            href: "/dashboard/cars/new",
            label: "Add New",
            icon: <PlusCircle size={18} />,
          },
          {
            href: "/dashboard/superadmin/create-user",
            label: "Add new User",
            icon: <Users size={18} />,
          },
          {
            href: "/dashboard/superadmin/stats",
            label: "Analytics",
            icon: <BarChart2 size={18} />,
          },
          {
            href: "/dashboard/superadmin/schema-builder",
            label: "Schema Builder",
            icon: <ListOrdered size={18} />,
          },
          {
            href: "/dashboard/superadmin/schema-order",
            label: "Section Order",
            icon: <ListOrdered size={18} />,
          },
          {
            href: "/dashboard/superadmin/schema-field-order",
            label: "Fields Order",
            icon: <ListOrdered size={18} />,
          },
          {
            href: "/dashboard/superadmin/schema-migrator",
            label: "Migrate Data",
            icon: <ListOrdered size={18} />,
          },
          {
            href: "/dashboard/tools/webp-converter",
            label: "Convertor WEBP",
            icon: <ListOrdered size={18} />,
          },
          {
            href: "/dashboard/superadmin/site-settings",
            label: "Info Company",
            icon: <BadgeInfo size={18} />,
          },

          /* NEW company system */
          {
            href: "/dashboard/superadmin/companies",
            label: "Companies - service",
            icon: <Building size={18} />,
          },
          {
            href: "/dashboard/superadmin/companies/create",
            label: "Add Company - service",
            icon: <Factory size={18} />,
          },

          
        ]
      : [];

  /* ---------------------------------------------------------
     COMPANY ADMIN LINKS (special)
  ---------------------------------------------------------- */
  const companyAdminLinks =
  role === "company_admin" && companyId
    ? [
        {
          href: `/dashboard/company/${companyId}/schema-bill`,
          label: "Factura Schema",
          icon: <ListOrdered size={18} />,
        },
        {
          href: `/dashboard/company/${companyId}/bill-prices`,
          label: "Setare Prețuri",
          icon: <ListOrdered size={18} />,
        },
        {
          href: `/dashboard/company/${companyId}/create-bill`,
          label: "Creare Factură",
          icon: <PlusCircle size={18} />,
        },
        {
  href: `/dashboard/company/${companyId}/settings/template`,
  label: "Template Factură",
  icon: <ListOrdered size={18} />,
},

        {
          href: `/dashboard/company/${companyId}/bills`,
          label: "Facturile Mele",
          icon: <ListOrdered size={18} />,
        },
      ]
    : [];

  /* ---------------------------------------------------------
     FINAL LINKS MERGE
  ---------------------------------------------------------- */
  const links = [
    ...baseLinks,
    ...adminLinks,
    ...companyAdminLinks,
    ...superLinks,
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen shadow-sm">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">CarMarket</h2>

        {role && (
          <p className="text-sm text-gray-500 mt-1 capitalize">Role: {role}</p>
        )}

        {companyId && (
          <p className="text-xs text-blue-600 mt-1">Company ID: {companyId}</p>
        )}
      </div>

      {/* SEARCH */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-md px-2 py-1">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-2 bg-transparent outline-none text-sm w-full text-gray-700"
          />
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
